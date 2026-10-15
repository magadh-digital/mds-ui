import { ChevronDown, ChevronLeft, ChevronRight, type LucideIcon, Maximize2, Minimize2, Pencil, X } from "lucide-react";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { type Tone } from "../core/types";
import { CopyButton } from "../display/buttons";
import { Term } from "../display/term";
import { useAppearance } from "./appearance";
import { dialogOpen, listOpen } from "../overlay/dialog";

export type PanelTab = { key: string; icon: LucideIcon; label: string };
export type TabCount =
  number | string | { n: number | string; tone?: Tone } | undefined;
/**
 * The panel's chrome slots: the body of a panel knows the record, the SlideOver does not — so the
 * body hands the head its chips and strip, the foot its actions, the tab strip its counts and the head its title through
 * portals and this context. `PanelHead`, `PanelFoot`, `PanelTitle` and `PanelTabCounts` are the four ways in.
 */
type ChromeCtx = {
  head: HTMLElement | null;
  foot: HTMLElement | null;
  setCounts: (c: Record<string, TabCount>) => void;
  setTitle: (t: { title: ReactNode; meta?: ReactNode } | null) => void;
};
const ChromeContext = createContext<ChromeCtx | null>(null);

/**
 * The slide-over stack. A page may keep several slide-overs mounted (a record, a linked record, a new-record form) and
 * two can be open at once — a row clicked while another panel is up, a linked entity opened from inside a panel. Without
 * this, both sat at right: 0 and the one later in the DOM covered the other: the new detail never showed. Now every open
 * slide-over registers here; only the most recently opened one is in view, the ones under it keep their state and come
 * back when it closes. `Esc` and the ‹ button in the head close the top one only.
 */
type StackEntry = { id: string; title: string };
type StackCtx = {
  stack: Array<StackEntry>;
  push: (e: StackEntry) => void;
  remove: (id: string) => void;
};
const PanelStackContext = createContext<StackCtx | null>(null);

export function PanelStackProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Array<StackEntry>>([]);
  const push = useCallback(
    (e: StackEntry) => setStack((s) => [...s.filter((x) => x.id !== e.id), e]),
    [],
  );
  const remove = useCallback(
    (id: string) =>
      setStack((s) =>
        s.some((x) => x.id === id) ? s.filter((x) => x.id !== id) : s,
      ),
    [],
  );
  const value = useMemo<StackCtx>(
    () => ({ stack, push, remove }),
    [stack, push, remove],
  );
  return (
    <PanelStackContext.Provider value={value}>
      {children}
    </PanelStackContext.Provider>
  );
}

/** Pure: where a panel stands in the stack — in view only at the top; `under` names the panel it would go back to. */
export const panelPlace = (
  stack: Array<StackEntry>,
  id: string,
): { top: boolean; under: StackEntry | null } => {
  const i = stack.findIndex((x) => x.id === id);
  if (i < 0) return { top: true, under: null };
  return { top: i === stack.length - 1, under: i > 0 ? stack[i - 1]! : null };
};

const titleText = (t: ReactNode): string =>
  typeof t === "string" || typeof t === "number" ? String(t) : "";
const countOf = (c: TabCount): { n: number | string; tone?: Tone } | null =>
  c == null || c === "" || c === 0
    ? null
    : typeof c === "object"
      ? c
      : { n: c };

/**
 * A right slide-over on top of the list; Esc closes the top one; never a modal. 680 px by default (Appearance ›
 * Detail panel). The head is two rows — identity (title, a state word in `meta`, ⤢, ×) and whatever the body posts with
 * `PanelHead` (chips, a flow strip); the tab strip carries labels and counts; the foot is the body's `PanelFoot` (the
 * action row), pinned under the scrolling body.
 */
export function SlideOver({
  open,
  title,
  meta,
  label,
  onClose,
  tabs,
  tab,
  onTab,
  keepMounted,
  children,
}: {
  open: boolean;
  title: ReactNode;
  /** a state word or a muted secondary id shown after the title */ meta?: ReactNode;
  /** the name the stack uses for "Back to …" when the title is not plain text */ label?: string;
  onClose: () => void;
  tabs?: Array<PanelTab>;
  tab?: string;
  onTab?: (k: string) => void;
  /** keep the body mounted while closed (a form whose pickers must keep their queries alive, as a Chakra dialog without unmountOnExit does) */ keepMounted?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  const ctx = useContext(PanelStackContext);
  const [headEl, setHeadEl] = useState<HTMLElement | null>(null);
  const [footEl, setFootEl] = useState<HTMLElement | null>(null);
  const [counts, setCounts] = useState<Record<string, TabCount>>({});
  const [titleOverride, setTitle] = useState<{
    title: ReactNode;
    meta?: ReactNode;
  } | null>(null);
  const chrome = useMemo<ChromeCtx>(
    () => ({ head: headEl, foot: footEl, setCounts, setTitle }),
    [headEl, footEl],
  );
  const shownTitle = titleOverride?.title ?? title;
  const shownMeta = titleOverride?.meta ?? meta;
  const text = label ?? titleText(title);
  useEffect(() => {
    if (!ctx || !open) return;
    ctx.push({ id, title: text });
    return () => ctx.remove(id);
  }, [ctx?.push, ctx?.remove, id, open, text]); // eslint-disable-line react-hooks/exhaustive-deps
  const { top, under } = ctx
    ? panelPlace(ctx.stack, id)
    : { top: true, under: null };
  const shown = open && top;
  useEffect(() => {
    if (!shown) return;
    // Esc closes the top panel — unless a popover (an editor, a confirm, a menu) is open: that Esc is the popover's;
    // a dialog over the panel (dialog.tsx) takes it too and closes first
    const fn = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      if (dialogOpen() || listOpen()) return;
      onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [shown, onClose]);
  return (
    <ChromeContext.Provider value={chrome}>
      <section
        className={`panel ${shown ? "open" : ""}`}
        aria-hidden={!shown}
        aria-label="Details"
      >
        <div className="head">
          <div className="head-row">
            {open && under && (
              <button
                className="ui-iconbtn back"
                onClick={onClose}
                aria-label={`Back to ${under.title || "the previous panel"}`}
                title={`Back to ${under.title || "the previous panel"}`}
              >
                <ChevronLeft />
              </button>
            )}
            <span className="title">{shownTitle}</span>
            {shownMeta && <span className="meta">{shownMeta}</span>}
            <span className="grow" />
            <ExpandToggle />
            <button
              className="ui-iconbtn close"
              onClick={onClose}
              aria-label="Close"
            >
              <X />
            </button>
          </div>
          <div className="head-extra" ref={setHeadEl} />
        </div>
        {tabs && (
          <div className="tabs" role="tablist">
            {tabs.map((t) => {
              const Icon = t.icon;
              const c = countOf(counts[t.key]);
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  className={tab === t.key ? "active" : ""}
                  title={t.label}
                  onClick={() => onTab?.(t.key)}
                >
                  <Icon />
                  <span className="tab-label">{t.label}</span>
                  {c && (
                    <span className={`tab-count ${c.tone ?? ""}`}>{c.n}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        <div className="body">{(open || keepMounted) && children}</div>
        <div className="foot" ref={setFootEl} />
      </section>
    </ChromeContext.Provider>
  );
}

/** The second head row: chips (parties, linked records, needs) and a flow strip. Rendered by the body, shown under the title. */
export function PanelHead({ children }: { children: ReactNode }) {
  const c = useContext(ChromeContext);
  return c?.head ? createPortal(children, c.head) : null;
}
/** The sticky action bar under the body: a "Next: …" note at the left, the buttons at the right (one primary at most). */
export function PanelFoot({
  note,
  children,
}: {
  note?: ReactNode;
  children: ReactNode;
}) {
  const c = useContext(ChromeContext);
  if (!c?.foot) return null;
  return createPortal(
    <div className="foot-row">
      {note && <span className="note">{note}</span>}
      <span className="grow" />
      {children}
    </div>,
    c.foot,
  );
}
/** The body knows the record: it names the panel (a vehicle number, an order id) and its state word. */
export function PanelTitle({
  title,
  meta,
}: {
  title: ReactNode;
  meta?: ReactNode;
}) {
  const c = useContext(ChromeContext);
  useEffect(() => {
    c?.setTitle({ title, meta });
    return () => c?.setTitle(null);
  }, [c?.setTitle, title, meta]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
/** Counts on the tab strip (`Lines 2`, `Findings 1` in amber): `{ lines: 2, findings: { n: 1, tone: 'warn' } }`. */
export function PanelTabCounts({
  counts,
}: {
  counts: Record<string, TabCount>;
}) {
  const c = useContext(ChromeContext);
  const key = JSON.stringify(counts);
  useEffect(() => {
    c?.setCounts(counts);
    return () => c?.setCounts({});
  }, [c?.setCounts, key]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
/** A chip row for the head: `<Chips>` wraps `.ui-chip`s and `.needs-chip`s. */
export function Chips({ children }: { children: ReactNode }) {
  return <div className="chips">{children}</div>;
}

/** The numbers that decide the record, right under the tabs: label above, value below, an optional muted or toned note. */
export type Stat = {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: Tone;
  title?: string;
};
export function StatTiles({ items }: { items: Array<Stat> }) {
  return (
    <div className="stats">
      {items.map((t) => (
        <div key={t.label} className="stat" title={t.title}>
          <div className="stat-l">
            <Term label={t.label} />
          </div>
          <div className={`stat-v ${t.tone ?? ""}`}>
            {t.value ?? "—"}
            {t.sub != null && <span className="stat-s">{t.sub}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
/** The stages of a record as a strip in the head: green done · blue now · amber hold · red bad, the time under each. */
export type FlowStep = {
  label: string;
  when?: string | null;
  state?: "done" | "now" | "todo" | "bad" | "hold";
};
export function FlowStrip({
  steps,
  label = "Where it is",
}: {
  steps: Array<FlowStep>;
  label?: string;
}) {
  return (
    <div className="flow" role="list" aria-label={label}>
      {steps.map((st) => (
        <div
          key={st.label}
          className={`st ${st.state && st.state !== "todo" ? st.state : ""}`}
          role="listitem"
          title={`${st.label}${st.when ? ` · ${st.when}` : ""}`}
        >
          <span className="bar" />
          <span className="lbl">{st.label}</span>
          <span className="when">{st.when ?? ""}</span>
        </div>
      ))}
    </div>
  );
}
/** One sentence on where the record stands, under the tiles. */
export function StatusLine({ children }: { children: ReactNode }) {
  return <p className="status-line">{children}</p>;
}
/** Two blocks side by side (billing | shipping); they stack when the panel is narrow. */
export function PanelColumns({ children }: { children: ReactNode }) {
  return <div className="pcols">{children}</div>;
}
/** A labelled block inside `PanelColumns`: a small muted label, then lines. */
export function PanelBlock({
  label,
  action,
  children,
}: {
  label: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="pblock">
      <div className="pblock-label">
        <span>
          <Term label={label} />
        </span>
        {action}
      </div>
      {children}
    </div>
  );
}

/** Full page ⇄ the side panel or popup the person last chose (Appearance › Detail view, kept for next time). */
function ExpandToggle() {
  const { detailView, setDetailView, windowedView } = useAppearance();
  const full = detailView === "full";
  const back = windowedView === "popup" ? "Back to the popup" : "Back to the side panel";
  return (
    <button
      className="ui-iconbtn expand"
      onClick={() => setDetailView(full ? windowedView : "full")}
      aria-label={full ? back : "Full page"}
      title={full ? back : "Show as a full page"}
    >
      {full ? <Minimize2 /> : <Maximize2 />}
    </button>
  );
}

export function PanelSection({
  title,
  action,
  children,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="psec">
      {title && (
        <div className="psec-title">
          <span>
            <Term label={title} />
          </span>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export type KV = {
  k: string;
  v: ReactNode;
  copy?: string;
  /** kept for callers: every value wraps now (the label column is fixed, the value sits beside it) */ wrap?: boolean;
  /** a muted note after the value (when, by whom, the secondary figure) */ sub?: ReactNode;
};
export function KeyValue({ items }: { items: Array<KV> }) {
  return (
    <div className="kv">
      {items.map((it) => (
        <div key={it.k} style={{ display: "contents" }}>
          <div className="k">
            <Term label={it.k} />
          </div>
          <div className="v">
            <span className="vt">
              {it.v ?? "—"}
              {it.sub != null && <span className="sub"> · {it.sub}</span>}
            </span>
            {it.copy && <CopyButton text={it.copy} />}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * A panel section that folds (the yard before arrival, the money before check) and edits in place: the pencil opens
 * the section's own editor, rendered by the caller under `editor` while `editing` is true; Save / Cancel live inside it.
 */
export function FoldSection({
  title,
  count,
  defaultOpen = true,
  open,
  onToggle,
  onEdit,
  editLabel = "edit",
  editing,
  editor,
  action,
  children,
}: {
  title: string;
  count?: number | string;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  onEdit?: () => void;
  editLabel?: string;
  editing?: boolean;
  editor?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  const [own, setOwn] = useState(defaultOpen);
  const isOpen = open ?? own;
  const toggle = () => (onToggle ? onToggle(!isOpen) : setOwn(!isOpen));
  return (
    <div className={`psec ${isOpen ? "" : "collapsed"}`}>
      <div className="psec-title">
        <button
          type="button"
          className="toggle"
          onClick={toggle}
          aria-expanded={isOpen}
        >
          {isOpen ? <ChevronDown /> : <ChevronRight />}
          <span>
            <Term label={title} />
            {count != null ? (
              <span className="ui-muted" style={{ fontWeight: 500 }}>
                {" "}
                · {count}
              </span>
            ) : null}
          </span>
        </button>
        <span className="hstack" style={{ gap: "var(--sp-2)" }}>
          {action}
          {onEdit && !editing && (
            <button
              type="button"
              className="pencil"
              onClick={() => {
                if (!isOpen) toggle();
                onEdit();
              }}
              title={editLabel}
            >
              <Pencil /> {editLabel}
            </button>
          )}
        </span>
      </div>
      {isOpen && (editing && editor ? editor : children)}
    </div>
  );
}
