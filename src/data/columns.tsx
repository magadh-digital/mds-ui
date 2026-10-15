import { type ColumnDef, type VisibilityState } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useDragSort } from "./dragsort.js";
import { Pop } from "../overlay/pop.js";

/** Pure: the ids in the saved order first, then the ones the saved order does not know in their own order; ids it names that no longer exist are dropped. */
export const orderColumns = (
  ids: Array<string>,
  order: Array<string>,
): Array<string> => [
  ...order.filter((id) => ids.includes(id)),
  ...ids.filter((id) => !order.includes(id)),
];

/** Pure: a column the customiser lists — it has an id and something to call it by (the status-dot column has neither and stays pinned first). */
export const columnLabel = <T,>(c: ColumnDef<T, any>): string | null =>
  c.id
    ? (c.meta?.label ??
      (typeof c.header === "string" && c.header ? c.header : null))
    : null;

/**
 * `Customize Columns`: every labelled column with a checkbox (a column the page cannot do without has its box disabled)
 * and, when the page keeps an order, a grip to drag the row and ↑ ↓ arrows that move it one place (the table's header
 * cells drag too); `Reset order` returns to the page's own order.
 * Both choices are the user's and live in localStorage per page (see useListState).
 */
export function ColumnsPop<T>({
  columns,
  visibility,
  onChange,
  order,
  onOrder,
}: {
  columns: Array<ColumnDef<T, any>>;
  visibility: VisibilityState;
  onChange: (v: VisibilityState) => void;
  order?: Array<string>;
  onOrder?: (o: Array<string>) => void;
}) {
  const listed = columns.filter((c) => columnLabel(c) != null);
  const byId = new Map(listed.map((c) => [c.id!, c] as const));
  const ids = orderColumns(
    listed.map((c) => c.id!),
    order ?? [],
  );
  const drag = useDragSort(ids, (next) => onOrder?.(next), "columns");
  const move = (id: string, dir: -1 | 1) => {
    const i = ids.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    const next = [...ids];
    next[i] = ids[j]!;
    next[j] = ids[i]!;
    onOrder?.(next);
  };
  return (
    <Pop
      placement="top-start"
      trigger={
        <button type="button" className="ui-link">
          Customize columns
        </button>
      }
    >
      <div className="group-title">Columns</div>
      {ids.map((id, i) => {
        const c = byId.get(id)!;
        const fixed = c.enableHiding === false;
        const { className: dragCls, ...dnd } = onOrder
          ? drag.props(id)
          : { className: "" };
        return (
          <div
            key={id}
            className={`colrow${onOrder ? " pagerow" : ""}${dragCls}`}
            {...dnd}
          >
            {onOrder && (
              <span className="draghandle" aria-hidden>
                <GripVertical />
              </span>
            )}
            <label
              className={`ui-check${fixed ? " disabled" : ""}`}
              title={fixed ? "always shown" : undefined}
            >
              <input
                type="checkbox"
                checked={visibility[id] !== false}
                disabled={fixed}
                onChange={(e) =>
                  onChange({ ...visibility, [id]: e.target.checked })
                }
              />
              <span>{columnLabel(c)}</span>
            </label>
            {onOrder && (
              <span className="colmove">
                <button
                  type="button"
                  className="ui-iconbtn"
                  aria-label="Move up"
                  title="Move up"
                  disabled={i === 0}
                  onClick={() => move(id, -1)}
                >
                  <ChevronUp />
                </button>
                <button
                  type="button"
                  className="ui-iconbtn"
                  aria-label="Move down"
                  title="Move down"
                  disabled={i === ids.length - 1}
                  onClick={() => move(id, 1)}
                >
                  <ChevronDown />
                </button>
              </span>
            )}
          </div>
        );
      })}
      {onOrder && order?.length ? (
        <button
          type="button"
          className="ui-link"
          style={{ marginTop: "var(--sp-1)" }}
          onClick={() => onOrder([])}
        >
          Reset order
        </button>
      ) : null}
    </Pop>
  );
}
