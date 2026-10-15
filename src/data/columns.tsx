import { type Column, type ColumnDef, type VisibilityState } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { moveId, useDragSort } from "./dragsort.js";
import { Pop } from "../overlay/pop.js";

/** Pure: the ids in the saved order first, then the ones the saved order does not know in their own order; ids it names that no longer exist are dropped. */
export const orderColumns = (
  ids: Array<string>,
  order: Array<string>,
): Array<string> => [
  ...order.filter((id) => ids.includes(id)),
  ...ids.filter((id) => !order.includes(id)),
];

/**
 * @internal
 * A column def's id, worked out the way TanStack Table v8 does: `id`, else `accessorKey` (dots become `_`), else a
 * string `header`. Lets the kit name a column before the table instance exists; once it does, read
 * `table.getAllLeafColumns()` instead.
 */
export const columnIdOf = <T,>(c: ColumnDef<T, any>): string | undefined => {
  const key = (c as { accessorKey?: unknown }).accessorKey;
  return (
    c.id ??
    (typeof key === "string" ? key.replace(/\./g, "_") : undefined) ??
    (typeof c.header === "string" ? c.header : undefined)
  );
};

/**
 * Pure: the name the customiser lists a column under: `meta.label`, else a string `header`; null for a column with
 * neither (a status dot, the checkbox and menu columns), which stays where the page put it.
 */
export const columnLabel = <T,>(c: ColumnDef<T, any>): string | null =>
  c.meta?.label ?? (typeof c.header === "string" && c.header ? c.header : null);

/** @internal the table's own columns the customiser lists: labelled, and not the kit's `__` columns */
export const listedColumns = <T,>(columns: Array<Column<T, unknown>>) =>
  columns.filter((c) => !c.id.startsWith("__") && columnLabel(c.columnDef) != null);

/**
 * `Customize Columns`: every labelled column with a checkbox (a column the page cannot do without has its box disabled)
 * and, when the page keeps an order, a grip to drag the row and ↑ ↓ arrows that move it one place (the table's header
 * cells drag too); `Reset order` returns to the page's own order.
 * `columns` are the table's own columns (`table.getAllLeafColumns()`), so ids come from TanStack and columns built with
 * `columnHelper.accessor("name")` (no explicit `id`) are listed too.
 */
export function ColumnsPop<T>({
  columns,
  visibility,
  onChange,
  order,
  onOrder,
}: {
  columns: Array<Column<T, unknown>>;
  visibility: VisibilityState;
  onChange: (v: VisibilityState) => void;
  order?: Array<string>;
  onOrder?: (o: Array<string>) => void;
}) {
  const listed = listedColumns(columns);
  const byId = new Map(listed.map((c) => [c.id, c] as const));
  const ids = orderColumns(
    listed.map((c) => c.id),
    order ?? [],
  );
  const drag = useDragSort(ids, (next) => onOrder?.(next), "columns");
  const move = (id: string, dir: -1 | 1) => {
    const next = moveId(ids, id, dir);
    if (next !== ids) onOrder?.(next);
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
        const fixed = !c.getCanHide();
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
              <span>{columnLabel(c.columnDef)}</span>
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
