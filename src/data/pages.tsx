import { ChevronDown, ChevronUp, GripVertical, SlidersHorizontal } from "lucide-react";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { dropId, moveId, useDragSort } from "./dragsort.js";
import { Term } from "../display/term.js";
import { Pop } from "../overlay/pop.js";
import { Tip } from "../overlay/tip.js";
import { useClientLayoutEffect } from "./saved.js";
import { storageKey } from "../core/storage.js";

/**
 * Page layout — the user's order of the rail's pages and which ones are hidden.
 *
 * Saved per module in this browser as `<prefix>.<module>.pages` (core/storage) = `{ order: [to…], hidden: [to…] }`, like the column
 * chooser saves `<prefix>.table.<storageId>.cols`. `arrangePages` is pure: it sorts a group by the saved order (pages the order
 * does not know — added after the user arranged theirs — join after the ordered ones) and drops the hidden ones.
 *
 * Three ways to arrange, one state: drag a rail icon; right-click it (`Hide page`, `Move up`, `Move down`); or the
 * `Customize pages` popover at the rail's foot (checkbox = shown, drag or ↑ ↓ to move, `Reset` for the app's own
 * order). Hidden pages stay reachable: ⌘K still lists them (hint `hidden from the rail`) and their URLs still work.
 */

export type PageLayout = { order: Array<string>; hidden: Array<string> };
export type PageLike = { to: string; label: string };
export const EMPTY_LAYOUT: PageLayout = { order: [], hidden: [] };

const key = (module: string) => storageKey(`${module}.pages`);

export function readPageLayout(module: string): PageLayout {
  try {
    const raw = localStorage.getItem(key(module));
    if (!raw) return EMPTY_LAYOUT;
    const v = JSON.parse(raw) as Partial<PageLayout>;
    const strings = (a: unknown) =>
      Array.isArray(a)
        ? a.filter((x): x is string => typeof x === "string")
        : [];
    return { order: strings(v.order), hidden: strings(v.hidden) };
  } catch {
    return EMPTY_LAYOUT;
  }
}
function writePageLayout(module: string, layout: PageLayout) {
  try {
    if (layout.order.length === 0 && layout.hidden.length === 0)
      localStorage.removeItem(key(module));
    else localStorage.setItem(key(module), JSON.stringify(layout));
  } catch {}
}

/** the saved order first (only the pages that exist), then the pages the order does not know, in the app's order */
export const orderPages = <T extends PageLike>(
  items: Array<T>,
  order: Array<string>,
): Array<T> => {
  const known = order
    .map((to) => items.find((i) => i.to === to))
    .filter((i): i is T => !!i);
  return [...known, ...items.filter((i) => !order.includes(i.to))];
};
/** ordered, with the hidden pages left out */
export const arrangePages = <T extends PageLike>(
  items: Array<T>,
  layout: PageLayout,
): Array<T> =>
  orderPages(items, layout.order).filter((i) => !layout.hidden.includes(i.to));

/** the shared drag-sort helpers under their page names (dragsort.tsx) */
export const movePage = moveId;
export const dropPage = dropId;

/** The saved arrangement of one module's pages; the first render (on the server too) is the app's own order. */
export function usePageLayout(module: string) {
  const [layout, setLayoutState] = useState<PageLayout>(EMPTY_LAYOUT);
  useClientLayoutEffect(() => setLayoutState(readPageLayout(module)), [module]);
  const setLayout = useCallback(
    (next: PageLayout | ((prev: PageLayout) => PageLayout)) => {
      setLayoutState((prev) => {
        const v = typeof next === "function" ? next(prev) : next;
        writePageLayout(module, v);
        return v;
      });
    },
    [module],
  );
  const setOrder = useCallback(
    (order: Array<string>) => setLayout((l) => ({ ...l, order })),
    [setLayout],
  );
  const setHidden = useCallback(
    (to: string, hidden: boolean) =>
      setLayout((l) => ({
        ...l,
        hidden: hidden
          ? l.hidden.includes(to)
            ? l.hidden
            : [...l.hidden, to]
          : l.hidden.filter((h) => h !== to),
      })),
    [setLayout],
  );
  const showAll = useCallback(
    () => setLayout((l) => ({ ...l, hidden: [] })),
    [setLayout],
  );
  const reset = useCallback(() => setLayout(EMPTY_LAYOUT), [setLayout]);
  const arrange = useCallback(
    <T extends PageLike>(items: Array<T>) => arrangePages(items, layout),
    [layout],
  );
  const isHidden = useCallback(
    (to: string) => layout.hidden.includes(to),
    [layout],
  );
  const customized = layout.order.length > 0 || layout.hidden.length > 0;
  return useMemo(
    () => ({
      layout,
      setOrder,
      setHidden,
      showAll,
      reset,
      arrange,
      isHidden,
      customized,
    }),
    [
      layout,
      setOrder,
      setHidden,
      showAll,
      reset,
      arrange,
      isHidden,
      customized,
    ],
  );
}

// ---------------------------------------------------------------- the popover
type Group<T extends PageLike> = { title: string; items: Array<T> };

/**
 * `Customize pages` — every page the user may see, in two groups (the rail, then its utility foot): a checkbox shows or
 * hides it, the grip drags it, the arrows move it one place. The page the user is on can still be hidden (the URL keeps
 * working); the last visible page of a group cannot, so the rail is never empty.
 */
export function PagesPop<T extends PageLike>({
  groups,
  layout,
  onOrder,
  onHidden,
  onReset,
  trigger,
}: {
  groups: Array<Group<T>>;
  layout: PageLayout;
  onOrder: (order: Array<string>) => void;
  onHidden: (to: string, hidden: boolean) => void;
  onReset: () => void;
  trigger?: ReactNode;
}) {
  const ordered = groups.map((g) => ({
    ...g,
    items: orderPages(g.items, layout.order),
  }));
  // one order across the groups; a change in one group keeps the others as they stand
  const setGroupOrder = (gi: number, ids: Array<string>) =>
    onOrder(
      ordered.flatMap((g, i) => (i === gi ? ids : g.items.map((x) => x.to))),
    );
  const customized = layout.order.length > 0 || layout.hidden.length > 0;
  return (
    <Pop
      placement="top-start"
      width="240px"
      trigger={
        trigger ?? (
          <button type="button" className="mds-rail-item" aria-label="Customize pages">
            <Tip label="Customize pages" placement="right">
              <span className="rail-fill">
                <SlidersHorizontal />
              </span>
            </Tip>
          </button>
        )
      }
    >
      {ordered.map((g, gi) => (
        <PageGroup
          key={g.title}
          title={g.title}
          items={g.items}
          hidden={layout.hidden}
          onOrder={(ids) => setGroupOrder(gi, ids)}
          onHidden={onHidden}
          group={`g${gi}`}
        />
      ))}
      <div
        style={{
          display: "flex",
          gap: "var(--mds-sp-2)",
          alignItems: "center",
          padding: "6px var(--mds-sp-1) 2px",
        }}
      >
        <button
          type="button"
          className="mds-link"
          disabled={!customized}
          onClick={onReset}
        >
          Reset
        </button>
        <span className="mds-muted" style={{ fontSize: "var(--mds-fs-xs)" }}>
          Drag or use the arrows · saved in this browser
        </span>
      </div>
    </Pop>
  );
}

function PageGroup<T extends PageLike>({
  title,
  items,
  hidden,
  onOrder,
  onHidden,
  group,
}: {
  title: string;
  items: Array<T>;
  hidden: Array<string>;
  onOrder: (ids: Array<string>) => void;
  onHidden: (to: string, hidden: boolean) => void;
  group: string;
}) {
  const ids = items.map((i) => i.to);
  const drag = useDragSort(ids, onOrder, group);
  const visible = items.filter((i) => !hidden.includes(i.to)).length;
  return (
    <>
      <div className="group-title">{title}</div>
      {items.map((p, i) => {
        const shown = !hidden.includes(p.to);
        const last = shown && visible <= 1;
        const { className, ...dnd } = drag.props(p.to);
        return (
          <div key={p.to} className={`mds-colrow mds-pagerow${className}`} {...dnd}>
            <span className="draghandle" aria-hidden>
              <GripVertical />
            </span>
            <label
              className={`mds-check${last ? " disabled" : ""}`}
              title={
                last
                  ? "keep one page"
                  : shown
                    ? "Hide from the rail"
                    : "Show in the rail"
              }
            >
              <input
                type="checkbox"
                checked={shown}
                disabled={last}
                onChange={(e) => onHidden(p.to, !e.target.checked)}
              />
              <span style={{ opacity: shown ? 1 : 0.55 }}>
                <Term label={p.label} />
              </span>
            </label>
            <span className="mds-colmove">
              <button
                type="button"
                className="mds-iconbtn"
                aria-label="Move up"
                title="Move up"
                disabled={i === 0}
                onClick={() => onOrder(movePage(ids, p.to, -1))}
              >
                <ChevronUp />
              </button>
              <button
                type="button"
                className="mds-iconbtn"
                aria-label="Move down"
                title="Move down"
                disabled={i === ids.length - 1}
                onClick={() => onOrder(movePage(ids, p.to, 1))}
              >
                <ChevronDown />
              </button>
            </span>
          </div>
        );
      })}
    </>
  );
}
