import { type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { Pop } from "../overlay/pop.js";

/**
 * A flow strip in lanes (a record's steps, grouped by who does them). Unlike the panel's `FlowStrip` (one
 * record's stages in a row of bars), this draws what an engine says: lanes of nodes, `→` where a node needs the one
 * before it, `||` where it runs beside it, and the nodes of another lane it waits for as an "after …" note. A node is a
 * button (open it) or, with `pop`, the trigger of a small popover (the reasons a blocked node waits on). Nodes that are
 * not needed are shown dimmed and cannot be focused.
 *
 * Keys: ← → move along the nodes, Enter opens one. When the strip sits in a table row of its own (DenseTable's second
 * row), ↑ goes to the row before that one and ↓ to the row after it, and ← from the first node goes back up. A table
 * enters the strip at its first node (`data-nav`).
 *
 * A node may carry a second glyph (`mark`) beside the state's: the strip only makes room for it — what it means and
 * how it is coloured belong to the page that builds the nodes (for example: whether another system already holds that step).
 */

export type LaneNodeState = "done" | "todo" | "blocked" | "not_needed";
export type LaneNode = {
  key: string;
  state: LaneNodeState;
  /** a second glyph beside the state's, for a strip that tracks a record in two places (the Vehicles two ticks) */
  mark?: ReactNode;
  /** the small mono tag before the label (whose book) */
  tag?: string | null;
  /** the node's word (Purchase, DN, Freight) */
  what: string;
  /** after the arrow (a party), already shortened; `full` goes into the title */
  to?: string | null;
  /** the second line: an amount, a weight */
  sub?: ReactNode;
  /** the hover text */
  title?: string;
  /** done, but its source changed since: shown with the warn tone */
  changed?: boolean;
  /** this node is the record the strip is shown for (the record's own slide-over) */
  current?: boolean;
  /** a fact the record keeps from elsewhere (an invoice), not work: drawn quieter */
  fact?: boolean;
  /** how it meets the node before it in its lane */
  join: "needs" | "beside" | null;
  /** the nodes of other lanes it waits for, by label */
  after?: Array<string>;
  /** a popover instead of a click (a blocked node's reasons) */
  pop?: ReactNode;
};
export type LaneRow = { lane: string; label: string; nodes: Array<LaneNode> };

const GLYPH: Record<LaneNodeState, string> = {
  done: "✓",
  todo: "",
  blocked: "!",
  not_needed: "–",
};

export function LaneStrip({
  lanes,
  onOpen,
  label = "Steps",
}: {
  lanes: Array<LaneRow>;
  onOpen?: (key: string) => void;
  label?: string;
}) {
  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement;
    if (!t.matches("[data-flow-node]")) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      e.stopPropagation();
      const all = Array.from(
        e.currentTarget.querySelectorAll<HTMLElement>("[data-flow-node]"),
      );
      const i = all.indexOf(t);
      const next = all[i + (e.key === "ArrowRight" ? 1 : -1)];
      if (next) next.focus();
      else if (e.key === "ArrowLeft") rowAround(t, "up")?.focus();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const row = rowAround(t, e.key === "ArrowUp" ? "up" : "down");
      if (!row) return;
      e.preventDefault();
      e.stopPropagation();
      row.focus();
    }
  };
  let first = true;
  return (
    <div className="mds-lstrip" role="group" aria-label={label} onKeyDown={onKeyDown}>
      {lanes.map((ln) => (
        <div key={ln.lane} className="mds-lstrip-lane" role="list" aria-label={ln.label}>
          <span className="mds-lstrip-label">{ln.label}</span>
          <span className="mds-lstrip-nodes">
            {ln.nodes.map((n) => {
              const focusable = n.state !== "not_needed";
              const nav = focusable && first;
              if (nav) first = false;
              return (
                <span key={n.key} className="mds-lstrip-cell" role="listitem">
                  {n.join && (
                    <span
                      className={`mds-lstrip-join ${n.join}`}
                      aria-label={n.join === "needs" ? "then" : "beside"}
                      title={
                        n.join === "needs"
                          ? "needs the one before it"
                          : "runs beside the one before it"
                      }
                    >
                      {n.join === "needs" ? "→" : "||"}
                    </span>
                  )}
                  {n.after?.length ? (
                    <span className="mds-lstrip-after" title={`after ${n.after.join(", ")}`}>
                      ↳ after {n.after.join(", ")}
                    </span>
                  ) : null}
                  <Node node={n} nav={nav} onOpen={onOpen} />
                </span>
              );
            })}
          </span>
        </div>
      ))}
    </div>
  );
}

/** the table row before / after the row the strip sits in (none when the strip is not in a table) */
const rowAround = (el: HTMLElement, dir: "up" | "down") => {
  const tr = el.closest("tr");
  return ((dir === "up" ? tr?.previousElementSibling : tr?.nextElementSibling) as HTMLElement | null | undefined) ?? null;
};

function Node({
  node: n,
  nav,
  onOpen,
}: {
  node: LaneNode;
  nav: boolean;
  onOpen?: (key: string) => void;
}) {
  const cls = `mds-lstrip-node ${n.state}${n.changed ? " changed" : ""}${n.current ? " current" : ""}${n.fact ? " fact" : ""}`;
  const body = (
    <>
      <span className="n1">
        <span className="glyph" aria-hidden>
          {GLYPH[n.state]}
        </span>
        {n.mark}
        {n.tag && <span className="tag">{n.tag}</span>}
        <span className="what">{n.what}</span>
        {n.to && <span className="to">→ {n.to}</span>}
      </span>
      {n.sub != null && <span className="n2">{n.sub}</span>}
    </>
  );
  if (n.state === "not_needed")
    return (
      <span className={cls} title={n.title}>
        {body}
      </span>
    );
  const button = (
    <button
      type="button"
      className={cls}
      title={n.title}
      data-flow-node=""
      data-nav={nav ? "" : undefined}
      aria-current={n.current ? "true" : undefined}
      onClick={n.pop ? undefined : () => onOpen?.(n.key)}
    >
      {body}
    </button>
  );
  return n.pop ? (
    <Pop trigger={button} placement="bottom-start" width="calc(320px * var(--mds-ui-scale))">
      {n.pop}
    </Pop>
  ) : (
    button
  );
}
