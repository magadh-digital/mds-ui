import { AlertTriangle, type LucideIcon, MoreHorizontal } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type Action, type ConfirmSpec } from "../core/types.js";
import { ActionConfirm } from "./confirm.js";
import { MENU_Z } from "./floating.js";

/**
 * The right-click menu on a row (and on anything else that has actions). One list of actions feeds
 * three surfaces — the panel's ActionRow, this menu and the BulkBar — so a row never has an action the panel lacks.
 * Opens at the pointer (or under a `⋯` button / the focused row for keyboard and touch), never a modal. Destructive
 * items confirm inside the menu. Esc, outside click, scroll or blur close it.
 */

export type MenuItem = {
  key: string;
  label: ReactNode;
  icon?: LucideIcon;
  /** shortcut shown on the right, e.g. `⌘C` or `Enter` */
  kbd?: string;
  disabled?: boolean;
  /** why it is disabled; shown as the tooltip */
  title?: string;
  danger?: boolean;
  /** a hairline above this item */
  sep?: boolean;
  /** ask first, inside the menu; the reason (if any) reaches onSelect */
  confirm?: ConfirmSpec;
  onSelect?: (reason?: string) => void | Promise<unknown>;
};

/** Where to put the menu: a mouse event, or any object with a viewport point. */
export type MenuAnchor = {
  clientX: number;
  clientY: number;
  preventDefault?: () => void;
};
export type MenuState = {
  x: number;
  y: number;
  items: Array<MenuItem>;
  title?: ReactNode;
} | null;

/** Actions (as the panel builds them) become menu items; element-only actions cannot be shown in a menu and are skipped. */
export const actionsToMenu = (actions: Array<Action>): Array<MenuItem> =>
  actions
    .filter((a) => a.onClick || a.confirm)
    .map((a) => ({
      key: a.key,
      label: a.label,
      icon: a.lucide,
      disabled: a.disabled,
      title: a.title,
      danger: a.danger,
      confirm: a.confirm,
      onSelect: a.onClick,
    }));

/**
 * `const menu = useContextMenu()` → `onContextMenu={(e) => menu.open(e, items, title)}` and render `{menu.element}` once.
 * `open`, `openAt` and `close` keep their identity across renders.
 */
export function useContextMenu() {
  const [menu, setMenu] = useState<MenuState>(null);
  const open = useCallback((
    at: MenuAnchor,
    rawItems: Array<MenuItem>,
    title?: ReactNode,
  ) => {
    at.preventDefault?.();
    if (rawItems.length === 0) return;
    // the page's own actions come first (the first item is the record's main action, "View"); the kit's Copy and Open
    // helpers follow after a separator, so the main action is always first
    const util = rawItems.filter((i) => i.key === "copy" || i.key === "open");
    const own = rawItems.filter((i) => i.key !== "copy" && i.key !== "open");
    const items =
      own.length && util.length
        ? [
            ...own.map((m, i) => (i === 0 ? { ...m, sep: false } : m)),
            ...util.map((m, i) => (i === 0 ? { ...m, sep: true } : m)),
          ]
        : rawItems;
    setMenu({ x: at.clientX, y: at.clientY, items, title });
  }, []);
  /** open under an element (the `⋯` button, a focused row) */
  const openAt = useCallback((el: Element, items: Array<MenuItem>, title?: ReactNode) => {
    const r = el.getBoundingClientRect();
    open({ clientX: r.left, clientY: r.bottom + 2 }, items, title);
  }, [open]);
  const close = useCallback(() => setMenu(null), []);
  return {
    menu,
    open,
    openAt,
    close,
    element: <ContextMenu menu={menu} onClose={close} />,
  };
}

export function ContextMenu({
  menu,
  onClose,
}: {
  menu: MenuState;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [active, setActive] = useState(0);
  const [confirming, setConfirming] = useState<MenuItem | null>(null);
  const [typedWord, setTypedWord] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const restoreFocus = useRef<Element | null>(null);
  // the menu on screen now: an action started from one menu must not close the next one when it finishes
  const current = useRef<MenuState>(null);
  current.current = menu;
  const baseId = useId();

  // keep the menu inside the viewport
  useLayoutEffect(() => {
    if (!menu || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({
      left: Math.max(8, Math.min(menu.x, window.innerWidth - r.width - 8)),
      top: Math.max(8, Math.min(menu.y, window.innerHeight - r.height - 8)),
    });
  }, [menu, confirming]);
  // focus once it is placed, so ↑ ↓ Enter Esc land on the menu (not before: a hidden element cannot take focus)
  useEffect(() => {
    if (menu && pos && !confirming) ref.current?.focus();
  }, [menu, pos, confirming]);

  useEffect(() => {
    if (!menu) return;
    restoreFocus.current = document.activeElement;
    setActive(menu.items.findIndex((i) => !i.disabled));
    setConfirming(null);
    setReason("");
    setTypedWord("");
    // the component stays mounted between menus: a new menu never inherits the last one's running state
    setBusy(false);
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onScroll = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("mousedown", onDown, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onClose);
    window.addEventListener("blur", onClose);
    return () => {
      window.removeEventListener("mousedown", onDown, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onClose);
      window.removeEventListener("blur", onClose);
      const el = restoreFocus.current as HTMLElement | null;
      if (el && typeof el.focus === "function" && document.contains(el))
        el.focus();
    };
  }, [menu, onClose]);

  if (!menu) return null;
  const items = menu.items;

  const pick = async (it: MenuItem) => {
    if (it.disabled) return;
    if (it.confirm && !confirming) {
      setConfirming(it);
      return;
    }
    const from = menu;
    setBusy(true);
    try {
      await it.onSelect?.(reason.trim() || undefined);
      if (current.current !== from) return; // closed (Esc) or replaced by another menu meanwhile
      setBusy(false);
      setConfirming(null);
      setReason("");
      setTypedWord("");
      onClose();
    } catch {
      // the caller toasts; keep the menu open so the person sees what failed
      if (current.current === from) setBusy(false);
    }
  };
  const move = (dir: 1 | -1) => {
    let i = active;
    for (let n = 0; n < items.length; n++) {
      i = (i + dir + items.length) % items.length;
      if (!items[i]!.disabled) break;
    }
    setActive(i);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    } else if (confirming) {
      return;
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      setActive(
        e.key === "Home"
          ? items.findIndex((i) => !i.disabled)
          : items.length - 1 - [...items].reverse().findIndex((i) => !i.disabled),
      );
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const it = items[active];
      if (it) void pick(it);
    }
  };

  const itemId = (i: number) => `${baseId}-item-${i}`;
  const titleId = `${baseId}-title`;
  return createPortal(
    <div
      ref={ref}
      className="ctxmenu"
      role={confirming ? "dialog" : "menu"}
      tabIndex={-1}
      aria-labelledby={confirming ? `${baseId}-confirm` : menu.title ? titleId : undefined}
      aria-label={!confirming && !menu.title ? "Actions" : undefined}
      // focus stays on the menu; the active item is announced through aria-activedescendant
      aria-activedescendant={!confirming && active >= 0 && items[active] ? itemId(active) : undefined}
      style={{
        left: pos?.left ?? menu.x,
        top: pos?.top ?? menu.y,
        opacity: pos ? 1 : 0,
        zIndex: MENU_Z,
      }}
      onKeyDown={onKey}
      onContextMenu={(e) => e.preventDefault()}
    >
      {confirming ? (
        <div className="confirm">
          <div className="confirm-title" id={`${baseId}-confirm`}>
            {(confirming.confirm?.danger ?? confirming.danger) && (
              <AlertTriangle />
            )}
            {confirming.confirm!.title}
          </div>
          {confirming.confirm!.description && (
            <div className="ui-muted">{confirming.confirm!.description}</div>
          )}
          {confirming.confirm!.reason && (
            <textarea
              className="ui-input ui-textarea"
              placeholder={confirming.confirm!.reason.label}
              aria-label={confirming.confirm!.reason.label}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              autoFocus
            />
          )}
          {confirming.confirm!.typed && (
            <input
              className="ui-input"
              placeholder={`Type ${confirming.confirm!.typed} to confirm`}
              aria-label={`Type ${confirming.confirm!.typed} to confirm`}
              value={typedWord}
              onChange={(e) => setTypedWord(e.target.value)}
              autoFocus={!confirming.confirm!.reason}
            />
          )}
          <div className="hstack" style={{ justifyContent: "flex-end" }}>
            <button
              type="button"
              className="ui-link"
              onClick={() => {
                setConfirming(null);
                setTypedWord("");
              }}
              disabled={busy}
            >
              Back
            </button>
            <button
              type="button"
              className={`ui-btn ${(confirming.confirm?.danger ?? confirming.danger) ? "danger" : ""}`}
              disabled={
                busy ||
                (confirming.confirm!.reason?.required && !reason.trim()) ||
                (!!confirming.confirm!.typed &&
                  typedWord.trim() !== confirming.confirm!.typed)
              }
              onClick={() => void pick(confirming)}
            >
              {busy
                ? "Working…"
                : (confirming.confirm!.confirmLabel ?? "Confirm")}
            </button>
          </div>
        </div>
      ) : (
        <>
          {menu.title && <div className="title" id={titleId}>{menu.title}</div>}
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <div key={it.key} style={{ display: "contents" }}>
                {it.sep && i > 0 && <div className="sep" />}
                <button
                  type="button"
                  role="menuitem"
                  id={itemId(i)}
                  tabIndex={-1}
                  aria-haspopup={it.confirm ? "dialog" : undefined}
                  className={`mi ${i === active ? "active" : ""} ${it.danger ? "danger" : ""}`}
                  disabled={it.disabled || busy}
                  title={it.title}
                  onMouseEnter={() => !it.disabled && setActive(i)}
                  onClick={() => void pick(it)}
                >
                  {Icon && <Icon />}
                  <span style={{ flex: 1, whiteSpace: "nowrap" }}>
                    {it.label}
                  </span>
                  {it.confirm && <span className="ui-muted">…</span>}
                  {it.kbd && <kbd className="ui-kbd">{it.kbd}</kbd>}
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>,
    document.body,
  );
}

/**
 * The `⋯` that appears on row hover / focus so touch and keyboard users reach the same menu as right-click. Pass
 * `expanded` (the menu is open for this row) so a screen reader hears the state.
 */
export function RowMenuButton({
  onOpen,
  label = "Actions",
  expanded = false,
}: {
  onOpen: (el: Element) => void;
  label?: string;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      className="ui-iconbtn"
      aria-label={label}
      aria-haspopup="menu"
      aria-expanded={expanded}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(e.currentTarget);
      }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
        <circle cx="3" cy="8" r="1.4" fill="currentColor" />
        <circle cx="8" cy="8" r="1.4" fill="currentColor" />
        <circle cx="13" cy="8" r="1.4" fill="currentColor" />
      </svg>
    </button>
  );
}

/**
 * The record's actions in the panel foot: the primary one filled at the right, one more
 * outlined, the rest behind `More` as the same menu the row's right-click shows. One `actionsFor(row)`, three surfaces.
 */
export function FootActions({
  actions,
  title,
}: {
  actions: Array<Action>;
  title?: string;
}) {
  const menu = useContextMenu();
  const enabled = actions.filter((a) => !a.disabled);
  const primary =
    actions.find((a) => a.primary && !a.disabled) ??
    enabled.find((a) => !a.danger) ??
    null;
  const second = enabled.find((a) => a !== primary && !a.danger) ?? null;
  const rest = actions.filter((a) => a !== primary && a !== second);
  const btn = (a: Action, cls: string) =>
    a.confirm ? (
      <ActionConfirm
        key={a.key}
        a={a}
        placement="top-start"
        trigger={
          <button
            type="button"
            className={`ui-btn ${cls}`}
            disabled={a.disabled}
            title={a.title}
          >
            {a.icon}
            {a.label}
          </button>
        }
      />
    ) : (
      <button
        key={a.key}
        type="button"
        className={`ui-btn ${cls}`}
        disabled={a.disabled}
        title={a.title}
        onClick={() => void a.onClick?.()}
      >
        {a.icon}
        {a.label}
      </button>
    );
  return (
    <>
      {rest.length > 0 && (
        <button
          type="button"
          className="ui-btn"
          aria-label="More actions"
          aria-haspopup="menu"
          aria-expanded={!!menu.menu}
          title="Every other action"
          onClick={(e) => {
            const b = e.currentTarget.getBoundingClientRect();
            menu.open(
              { clientX: b.right, clientY: b.top - 4 },
              actionsToMenu(rest),
              title,
            );
          }}
        >
          <MoreHorizontal /> More
        </button>
      )}
      {second && btn(second, "")}
      {primary && btn(primary, "primary")}
      {menu.element}
    </>
  );
}

/**
 * A toolbar's secondary actions behind one `More` button (the primary action stays a button beside it), so a page
 * with five actions keeps one toolbar row. Items are the row menu's: `confirm` asks inside the menu.
 */
export function MoreMenu({
  items,
  label = "More",
  title,
}: {
  items: Array<MenuItem>;
  label?: string;
  title?: ReactNode;
}) {
  const menu = useContextMenu();
  if (!items.length) return null;
  return (
    <>
      <button
        type="button"
        className="ui-btn"
        aria-haspopup="menu"
        aria-expanded={!!menu.menu}
        onClick={(e) => menu.openAt(e.currentTarget, items, title)}
      >
        <MoreHorizontal /> {label}
      </button>
      {menu.element}
    </>
  );
}
