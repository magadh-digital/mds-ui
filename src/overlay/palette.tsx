/**
 * The ⌘K palette. One box to jump to a page, reopen something recent, run a page action or change the appearance —
 * without leaving the keyboard. Pages register their actions while mounted (`useCommands`).
 * `/` still focuses the page's own search box; ⌘K (Ctrl K off a Mac) is global.
 *
 * Navigation goes through `useKitRouter()` (core/router.tsx). The appearance settings are not known at this layer:
 * `AppearancePopover` (layout/shell.tsx) registers them as a `settings` scope, listed last and only while typing.
 */
import {
  Clock,
  Command as CommandIcon,
  Search,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useKitRouter } from "../core/router.js";
import { otherServicePages } from "../core/service_pages.js";
import { storageKey } from "../core/storage.js";
import { PALETTE_Z } from "./floating.js";

export type Command = {
  id: string;
  label: string;
  /** muted text after the label: a number, a name, "current" */
  hint?: string;
  group: string;
  icon?: LucideIcon;
  kbd?: string;
  /** extra words the matcher may hit (old names, synonyms) */
  keywords?: string;
  run: () => void;
};

// ---------------------------------------------------------------- registry: pages add actions while mounted
type Getter = () => Array<Command>;
/** `settings`: listed only while typing, after the page actions, 6 at most, and never under `>` (the appearance) */
export type CommandScopeOptions = { settings?: boolean };
// one entry per registration (its own token), so unmounting one component never removes another's commands; when two
// registrations share a scope, the newest is listed and the older one comes back once the newest goes
const regs = new Map<symbol, { scope: string; get: Getter; settings: boolean }>();
let regVersion = 0;
const regListeners = new Set<() => void>();
const regChanged = () => {
  regVersion++;
  regListeners.forEach((l) => l());
};
const subscribeRegs = (l: () => void) => {
  regListeners.add(l);
  return () => void regListeners.delete(l);
};
/** Adds a scope's commands; returns the function that removes this registration (and only this one). */
export function registerCommands(scope: string, get: Getter, opts: CommandScopeOptions = {}) {
  const token = Symbol(scope);
  regs.set(token, { scope, get, settings: !!opts.settings });
  regChanged();
  return () => {
    if (regs.delete(token)) regChanged();
  };
}
/** `useCommands('receipts', [{ id: 'clear', label: 'Clear filters', group: 'Receipts', run }])` — re-read on every open, so closures stay fresh. */
export function useCommands(scope: string, cmds: Array<Command>, opts: CommandScopeOptions = {}) {
  const ref = useRef(cmds);
  ref.current = cmds;
  const settings = !!opts.settings;
  useEffect(() => registerCommands(scope, () => ref.current, { settings }), [scope, settings]);
}
const registered = (settings = false) => {
  const latest = new Map<string, { get: Getter; settings: boolean }>();
  regs.forEach((r) => latest.set(r.scope, r)); // insertion order: the newest registration of a scope wins
  return Array.from(latest.values())
    .filter((s) => s.settings === settings)
    .flatMap((s) => s.get());
};

/** a recent item's path with its search, written as TanStack writes search (JSON for anything a plain string can't hold) */
const withSearch = (to: string, search?: Record<string, unknown>) => {
  const qs = new URLSearchParams();
  Object.entries(search ?? {}).forEach(([k, v]) => {
    if (v === undefined) return;
    let s = typeof v === "string" ? v : JSON.stringify(v);
    if (typeof v === "string")
      try {
        JSON.parse(v);
        s = JSON.stringify(v);
      } catch {
        /* a plain string */
      }
    qs.set(k, s);
  });
  const str = qs.toString();
  return str ? `${to}${to.includes("?") ? "&" : "?"}${str}` : to;
};

// ---------------------------------------------------------------- open / close from anywhere
type PaletteState = { open: boolean; q: string };
let state: PaletteState = { open: false, q: "" };
const stateListeners = new Set<() => void>();
const setState = (s: PaletteState) => {
  state = s;
  stateListeners.forEach((l) => l());
};
const subscribeState = (l: () => void) => {
  stateListeners.add(l);
  return () => void stateListeners.delete(l);
};
const CLOSED: PaletteState = { open: false, q: "" };
export const palette = {
  open: (q = "") => setState({ open: true, q }),
  close: () => setState({ open: false, q: "" }),
  toggle: () =>
    setState(state.open ? { open: false, q: "" } : { open: true, q: "" }),
};

// ---------------------------------------------------------------- recent items (per browser)
export type RecentItem = {
  id: string;
  label: string;
  hint?: string;
  to: string;
  search?: Record<string, unknown>;
  at: number;
};
const RECENT_KEY = () => storageKey("recent");
const isRecent = (r: unknown): r is RecentItem =>
  !!r &&
  typeof r === "object" &&
  typeof (r as RecentItem).id === "string" &&
  typeof (r as RecentItem).label === "string" &&
  typeof (r as RecentItem).to === "string";
/** @internal The saved recent items; anything else under the key (corrupt, another app's) reads as none. */
export function readRecent(): Array<RecentItem> {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(RECENT_KEY()) ?? "[]");
    return Array.isArray(v) ? v.filter(isRecent) : [];
  } catch {
    return [];
  }
}
/** Call when a panel opens on an entity; the palette lists the last 20 under Recent. */
export function rememberRecent(item: Omit<RecentItem, "at">) {
  try {
    const list = [
      { ...item, at: Date.now() },
      ...readRecent().filter((r) => r.id !== item.id),
    ].slice(0, 20);
    localStorage.setItem(RECENT_KEY(), JSON.stringify(list));
  } catch {
    /* private mode */
  }
}

// ---------------------------------------------------------------- matching
/** 0 = no match. Substring beats subsequence; a hit at a word start beats one mid-word. */
/** @internal */
export function score(q: string, text: string): number {
  if (!q) return 1;
  const t = text.toLowerCase();
  const s = q.toLowerCase();
  const idx = t.indexOf(s);
  if (idx >= 0)
    return (
      100 -
      Math.min(idx, 40) +
      (idx === 0 || /[\s\-_/.]/.test(t[idx - 1] ?? "") ? 20 : 0)
    );
  let ti = 0;
  let pts = 0;
  for (const ch of s) {
    const at = t.indexOf(ch, ti);
    if (at < 0) return 0;
    pts += at === 0 || /[\s\-_/.]/.test(t[at - 1] ?? "") ? 6 : 1;
    ti = at + 1;
  }
  return pts;
}
const scored = (q: string, c: Command) =>
  Math.max(
    score(q, c.label),
    c.keywords ? score(q, c.keywords) * 0.8 : 0,
    c.hint ? score(q, c.hint) * 0.6 : 0,
  );

/** @internal true on a Mac, iPhone or iPad; call it in the browser only (it reads `navigator`) */
export const isMac = () =>
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const never = () => () => {};
/**
 * The modifier key's name: "⌘" on a Mac, "Ctrl" elsewhere. The server and the hydrating render both say "Ctrl" (they
 * agree, so hydration does not fail); a Mac switches to "⌘" right after.
 */
export const useModKey = () => useSyncExternalStore(never, () => (isMac() ? "⌘" : "Ctrl"), () => "Ctrl");
/** a shortcut's keys with `Mod` read as the modifier key ("Mod K" → "⌘ K") */
const withMod = (kbd: string, mod: string) => kbd.replace(/\bMod\b/g, mod);

/** A line of the `?` list. In `kbd`, `Mod` reads as ⌘ on a Mac and Ctrl elsewhere ("Mod K"). */
export type Shortcut = { kbd: string; label: string };
export const DEFAULT_SHORTCUTS: Array<Shortcut> = [
  {
    kbd: "Mod K",
    label: "Search: pages of every service, recent items, actions",
  },
  { kbd: "/", label: "Focus the page search box" },
  { kbd: "↑ ↓", label: "Move between rows" },
  { kbd: "Enter", label: "Open the row" },
  { kbd: "Space", label: "Select or deselect the row" },
  { kbd: "Mod click", label: "Add a row to the selection" },
  { kbd: "⇧ click", label: "Select a range of rows" },
  { kbd: "Mod A", label: "Select every row on the page" },
  { kbd: "[ ]", label: "Previous / next row while the panel is open" },
  { kbd: ".", label: "Row actions (same as right-click)" },
  { kbd: "Esc", label: "Close the menu or panel, then clear the selection" },
];

export type PaletteProps = {
  pages: Array<{
    to: string;
    label: string;
    icon?: LucideIcon;
    hint?: string;
    keywords?: string;
  }>;
  shortcuts?: Array<Shortcut>;
};

type Group = { title: string; items: Array<Command> };

/** Mount once in the root layout. */
export function CommandPalette({
  pages,
  shortcuts = DEFAULT_SHORTCUTS,
}: PaletteProps) {
  // read straight from the stores, so a palette.open() or a registration made before this mounted is not missed
  const st = useSyncExternalStore(subscribeState, () => state, () => CLOSED);
  const regs = useSyncExternalStore(subscribeRegs, () => regVersion, () => 0);
  const mod = useModKey();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<Element | null>(null);
  const { navigate, pathname } = useKitRouter();
  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = (i: number) => `${baseId}-opt-${i}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        !e.altKey &&
        e.key.toLowerCase() === "k" &&
        !e.repeat
      ) {
        e.preventDefault();
        palette.toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (st.open) {
      restoreFocus.current = document.activeElement;
      setQ(st.q);
      setActive(0);
      setTimeout(() => inputRef.current?.select(), 0);
    } else {
      const el = restoreFocus.current as HTMLElement | null;
      if (el && typeof el.focus === "function" && document.contains(el))
        el.focus();
    }
  }, [st]);

  // the palette searches static things only (pages, actions, shortcuts, appearance): no server lookups while typing

  const groups = useMemo<Array<Group>>(() => {
    if (!st.open) return [];
    const mode = q.startsWith(">")
      ? "actions"
      : q.startsWith("?")
        ? "shortcuts"
        : "all";
    const needle = mode === "all" ? q.trim() : q.slice(1).trim();
    const out: Array<Group> = [];
    const add = (title: string, items: Array<Command>, cap = 8) => {
      const list = needle
        ? items
            .map((c) => [scored(needle, c), c] as const)
            .filter(([s]) => s > 0)
            .sort((a, b) => b[0] - a[0])
            .map(([, c]) => c)
        : items;
      if (list.length) out.push({ title, items: list.slice(0, cap) });
    };
    if (mode === "shortcuts") {
      add(
        "Shortcuts",
        shortcuts.map((s) => ({
          id: `kbd:${s.kbd}`,
          label: s.label,
          kbd: withMod(s.kbd, mod),
          group: "Shortcuts",
          run: () => {},
        })),
        20,
      );
      return out;
    }
    const actions = registered();
    if (mode === "actions") {
      const byGroup = new Map<string, Array<Command>>();
      actions.forEach((c) =>
        byGroup.set(c.group, [...(byGroup.get(c.group) ?? []), c]),
      );
      byGroup.forEach((items, title) => add(title, items));
      return out;
    }
    if (!needle)
      add(
        "Recent",
        readRecent().map((r) => ({
          id: `recent:${r.id}`,
          label: r.label,
          hint: r.hint,
          group: "Recent",
          icon: Clock,
          run: () => navigate(withSearch(r.to, r.search)),
        })),
        6,
      );
    add(
      "Pages",
      pages.map((p) => ({
        id: `page:${p.to}`,
        label: p.label,
        hint: p.hint,
        keywords: p.keywords,
        group: "Pages",
        icon: p.icon,
        run: () => navigate(p.to),
      })),
    );
    // the pages of the other services, named by their service; shown while typing so the list stays short at rest
    add(
      "Other services",
      otherServicePages(pathname).map((p) => ({
        id: `page:${p.to}`,
        label: p.label,
        hint: p.service,
        keywords: `${p.service} ${p.keywords ?? ""}`,
        group: "Other services",
        icon: p.icon,
        run: () => navigate(p.to),
      })),
      needle ? 8 : 0,
    );
    if (needle)
      add(
        "Recent",
        readRecent().map((r) => ({
          id: `recent:${r.id}`,
          label: r.label,
          hint: r.hint,
          group: "Recent",
          icon: Clock,
          run: () => navigate(withSearch(r.to, r.search)),
        })),
        4,
      );
    const byGroup = new Map<string, Array<Command>>();
    actions.forEach((c) =>
      byGroup.set(c.group, [...(byGroup.get(c.group) ?? []), c]),
    );
    byGroup.forEach((items, title) =>
      add(
        title,
        items.map((c) => ({ icon: Zap, ...c })),
      ),
    );
    // settings scopes (the appearance, registered by AppearancePopover): only while typing, after everything else
    const settingsByGroup = new Map<string, Array<Command>>();
    registered(true).forEach((c) =>
      settingsByGroup.set(c.group, [...(settingsByGroup.get(c.group) ?? []), c]),
    );
    settingsByGroup.forEach((items, title) => add(title, items, needle ? 6 : 0));
    return out;
    // `regs` changes when a page registers or drops its commands, so the list follows while the palette is open
  }, [st.open, q, pages, shortcuts, pathname, navigate, regs, mod]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(".mds-cmdk-item.active")
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!st.open) return null;
  const run = (c: Command) => {
    palette.close();
    c.run();
  };
  const onKey = (e: ReactKeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      palette.close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(flat.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      setActive(e.key === "Home" ? 0 : flat.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = flat[active];
      if (c) run(c);
    } else if (e.key === "Tab") {
      // a modal: the search box is its only stop, so Tab stays on it
      e.preventDefault();
      inputRef.current?.focus();
    }
  };
  let i = -1;
  return createPortal(
    <div
      className="mds-cmdk-overlay"
      style={{ zIndex: PALETTE_Z }}
      onMouseDown={(e) => e.target === e.currentTarget && palette.close()}
    >
      <div
        className="mds-cmdk"
        role="dialog"
        aria-modal="true"
        aria-label="Search and commands"
        onKeyDown={onKey}
      >
        <div className="mds-cmdk-input">
          <Search />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to a page in any service, or run an action…"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={flat[active] ? optionId(active) : undefined}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="mds-cmdk-list" ref={listRef} role="listbox" id={listId} aria-label="Results">
          {groups.length === 0 && (
            <div className="mds-cmdk-empty">
              {q
                ? "Nothing matches."
                : "Type to search. Prefix > for actions, ? for shortcuts."}
            </div>
          )}
          {groups.map((g, gi) => (
            <div key={g.title} role="group" aria-labelledby={`${baseId}-g-${gi}`}>
              <div className="mds-cmdk-group" id={`${baseId}-g-${gi}`}>
                {g.title}
              </div>
              {g.items.map((c) => {
                i++;
                const idx = i;
                const Icon = c.icon ?? CommandIcon;
                return (
                  <div
                    key={c.id}
                    id={optionId(idx)}
                    role="option"
                    aria-selected={idx === active}
                    className={`mds-cmdk-item ${idx === active ? "active" : ""}`}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => run(c)}
                  >
                    <Icon />
                    <span className="label">{c.label}</span>
                    {c.hint && <span className="hint">{c.hint}</span>}
                    <span style={{ flex: 1 }} />
                    {c.kbd && <kbd className="mds-kbd">{c.kbd}</kbd>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="mds-cmdk-foot">
          <span>
            <kbd className="mds-kbd">↑↓</kbd> move
          </span>
          <span>
            <kbd className="mds-kbd">↵</kbd> open
          </span>
          <span>
            <kbd className="mds-kbd">esc</kbd> close
          </span>
          <span style={{ flex: 1 }} />
          <span>
            <kbd className="mds-kbd">&gt;</kbd> actions
          </span>
          <span>
            <kbd className="mds-kbd">?</kbd> shortcuts
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** The top-bar trigger: a quiet search pill with the shortcut on it. */
export function PaletteButton() {
  const mod = useModKey();
  return (
    <button
      type="button"
      className="mds-search-pill"
      onClick={() => palette.open()}
      aria-label="Search and commands"
    >
      <Search />
      <span>Search or jump to…</span>
      <kbd className="mds-kbd">{mod} K</kbd>
    </button>
  );
}
