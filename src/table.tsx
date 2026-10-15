import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { ColumnsPop } from "./listpage";
import { mergeOrder, useDragSort } from "./dragsort";
import type { ReactNode } from "react";
import { Term } from "./term";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnSizingState,
  type PaginationState,
  type RowData,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { RowMenuButton, type MenuAnchor } from "./menu";
import { dialogOpen } from "./dialog";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: "left" | "right" | "center";
    hideable?: boolean;
    label?: string;
    /** extra class on the cell (the kit uses `sel` and `rowmenu`) */
    cls?: string;
  }
}

/** Pattern K: multi-select. Ids of the selected rows live with the page (a `useSelection`), the table only draws and toggles. */
export type Selection<T> = {
  selected: ReadonlyArray<string>;
  onChange: (ids: Array<string>) => void;
  /** rows that may be picked; the others show no checkbox */
  selectable?: (row: T) => boolean;
};

export type DenseTableProps<T> = {
  columns: Array<ColumnDef<T, any>>;
  data: Array<T>;
  getRowId: (row: T) => string;
  sorting: SortingState;
  onSortingChange: (s: SortingState) => void;
  pagination: PaginationState;
  onPaginationChange: (p: PaginationState) => void;
  columnVisibility?: VisibilityState;
  /** the user's column order from the customiser (ids of the page's columns); the checkbox, status and menu columns keep their edges */
  columnOrder?: Array<string>;
  /** given, the labelled header cells drag into a new order (dragsort.tsx); called with the page's column ids, hidden ones keeping their slots */
  onColumnOrder?: (order: Array<string>) => void;
  /**
   * given, the table's bottom bar carries `Columns` (show / hide, and reorder when `onColumnOrder` is given): the one
   * place every table keeps its column choices, never the toolbar or the sidebar (owner, 15 Oct 2026)
   */
  onColumnVisibility?: (v: VisibilityState) => void;
  selectedId?: string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  /**
   * Required: whether this table's data is being fetched (pass the query's `isFetching`). One look for every load —
   * the first one, a background refetch, the toolbar's refresh: the overlay (veil + spinner)
   * over the table, shown after a short delay so fast answers do not flicker. Before the first data the body keeps
   * a blank area for it.
   */
  loading: boolean;
  error?: string | null;
  /** the one-sentence empty row; a node where it carries a link (Vehicles offers to widen its window) */
  emptyText?: ReactNode;
  note?: string | null;
  pageSizes?: Array<number>;
  label: string;
  /** server-side paging and sorting: `data` is one page, `rowCount` the total */
  manual?: boolean;
  rowCount?: number;
  /** checkbox column + ⇧/⌘ click, Space, ⌘A (pattern K) */
  selection?: Selection<T>;
  /** right-click, the `.` key or the row's `⋯` button open the same menu (pattern J) */
  onRowContextMenu?: (row: T, at: MenuAnchor) => void;
  /** files dropped on a row (a statement onto its account); the row highlights while a file hovers it */
  onRowDrop?: (row: T, files: Array<File>) => void;
  /** a chevron column that opens a second row under the row (a truck's lines); rows where `has` is false show no chevron */
  expand?: {
    expanded: ReadonlyArray<string>;
    onToggle: (id: string) => void;
    render: (row: T) => ReactNode;
    has?: (row: T) => boolean;
  };
  className?: string;
  /** rows of 1 (default), 2 (value + muted `.sub` detail) or 3 lines; the kit sets the matching height */
  lines?: 1 | 2 | 3;
  wrapperClassName?: string;
  enableColumnResizing?: boolean;
  /**
   * a small, already-loaded table inside a panel, form or card (what `MiniTable` draws): compact rows, sized to its
   * content, no bottom bar (pager, column menu) and no loading veil
   */
  bare?: boolean;
};

const inField = (t: EventTarget | null) =>
  t instanceof HTMLInputElement ||
  t instanceof HTMLTextAreaElement ||
  t instanceof HTMLSelectElement ||
  (t instanceof HTMLElement && t.isContentEditable);

/** Pattern B: sticky header, 30 px rows, sort on header click, footer paginator; + selection (K) and row menu (J). */
export function DenseTable<T>({
  columns,
  data,
  getRowId,
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
  columnVisibility: visibilityProp,
  columnOrder,
  onColumnOrder,
  onColumnVisibility: onVisibilityProp,
  selectedId,
  onRowClick,
  rowClassName,
  loading,
  error,
  emptyText = "Nothing matches.",
  note,
  pageSizes = [25, 50, 100, 200],
  label,
  manual,
  rowCount,
  selection,
  onRowContextMenu,
  onRowDrop,
  expand,
  className,
  wrapperClassName,
  enableColumnResizing = true,
  lines = 1,
  bare = false,
}: DenseTableProps<T>) {
  const expandedSet = useMemo(
    () => new Set(expand?.expanded ?? []),
    [expand?.expanded],
  );
  const selectedSet = useMemo(
    () => new Set(selection?.selected ?? []),
    [selection?.selected],
  );
  const selectable = selection?.selectable ?? (() => true);
  const anchor = useRef<string | null>(null);

  const allColumns = useMemo<Array<ColumnDef<T, any>>>(() => {
    const out: Array<ColumnDef<T, any>> = [];
    if (selection) {
      out.push({
        id: "__sel",
        enableResizing: false,
        size: 30,
        enableSorting: false,
        enableHiding: false,
        meta: { cls: "sel" },
        header: ({ table }) => {
          const ids = table
            .getRowModel()
            .rows.filter((r) => selectable(r.original))
            .map((r) => r.id);
          const on = ids.filter((id) => selectedSet.has(id)).length;
          return (
            <input
              type="checkbox"
              aria-label="Select all on this page"
              checked={ids.length > 0 && on === ids.length}
              ref={(el) => {
                if (el) el.indeterminate = on > 0 && on < ids.length;
              }}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) =>
                selection.onChange(
                  e.target.checked
                    ? Array.from(new Set([...selection.selected, ...ids]))
                    : selection.selected.filter((id) => !ids.includes(id)),
                )
              }
            />
          );
        },
        cell: ({ row, table }) => {
          if (!selectable(row.original)) return null;
          return (
            <input
              type="checkbox"
              aria-label="Select row"
              checked={selectedSet.has(row.id)}
              onChange={() => {}}
              onClick={(e) => {
                e.stopPropagation();
                const rows = table.getRowModel().rows;
                const on = !selectedSet.has(row.id);
                let ids = [row.id];
                if (e.shiftKey && anchor.current) {
                  const a = rows.findIndex((r) => r.id === anchor.current);
                  const b = rows.findIndex((r) => r.id === row.id);
                  if (a >= 0 && b >= 0)
                    ids = rows
                      .slice(Math.min(a, b), Math.max(a, b) + 1)
                      .filter((r) => selectable(r.original))
                      .map((r) => r.id);
                }
                anchor.current = row.id;
                selection.onChange(
                  on
                    ? Array.from(new Set([...selection.selected, ...ids]))
                    : selection.selected.filter((id) => !ids.includes(id)),
                );
              }}
            />
          );
        },
      });
    }
    if (expand) {
      out.push({
        id: "__exp",
        enableResizing: false,
        size: 22,
        enableSorting: false,
        enableHiding: false,
        meta: { cls: "exp" },
        header: "",
        cell: ({ row }) => {
          if (expand.has && !expand.has(row.original)) return null;
          const open = expandedSet.has(row.id);
          return (
            <button
              type="button"
              aria-label={open ? "Hide lines" : "Show lines"}
              aria-expanded={open}
              title={open ? "Hide lines" : "Show lines"}
              onClick={(e) => {
                e.stopPropagation();
                expand.onToggle(row.id);
              }}
            >
              {open ? <ChevronDown /> : <ChevronRight />}
            </button>
          );
        },
      });
    }
    out.push(...columns);
    if (onRowContextMenu) {
      out.push({
        id: "__menu",
        enableResizing: false,
        size: 30,
        enableSorting: false,
        enableHiding: false,
        meta: { cls: "rowmenu" },
        header: "",
        cell: ({ row }) => (
          <RowMenuButton
            onOpen={(el) => {
              const r = el.getBoundingClientRect();
              onRowContextMenu(row.original, {
                clientX: r.left,
                clientY: r.bottom + 2,
              });
            }}
          />
        ),
      });
    }
    return out;
  }, [
    columns,
    selection,
    selectedSet,
    selectable,
    onRowContextMenu,
    expand,
    expandedSet,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // the order the customiser saved, applied to the page's labelled columns only: the checkbox column stays first, an
  // unlabelled status column right after it, the row-menu column last; columns the saved order does not know follow it
  const fullOrder = useMemo(() => {
    if (!columnOrder?.length) return undefined;
    const labelled = new Set(
      columns
        .filter(
          (c) =>
            c.id &&
            (c.meta?.label || (typeof c.header === "string" && c.header)),
        )
        .map((c) => c.id!),
    );
    const ids = allColumns.map((c) => c.id!).filter(Boolean);
    const own = ids.filter((id) => labelled.has(id));
    const saved = columnOrder.filter((id) => labelled.has(id));
    return [
      ...ids.filter((id) => !labelled.has(id) && id !== "__menu"),
      ...saved,
      ...own.filter((id) => !saved.includes(id)),
      ...ids.filter((id) => id === "__menu"),
    ];
  }, [allColumns, columns, columnOrder]);

  // column choices (owner, 15 Oct 2026: "customize columns in the bottom bar, for every table"): a page that keeps its
  // own (`columnVisibility` + `onColumnVisibility`) decides; a table given neither keeps them itself, per table in the
  // browser; one given only `columnVisibility` is fixed by the page and shows no menu
  const visKey = `mgdh.ui.table.${label}.cols`;
  const ownsVisibility = visibilityProp === undefined && onVisibilityProp === undefined;
  const [ownVisibility, setOwnVisibility] = useState<VisibilityState>(() => {
    if (!ownsVisibility) return {};
    try {
      const v = JSON.parse(localStorage.getItem(visKey) ?? "{}") as unknown;
      return v && typeof v === "object" && !Array.isArray(v) ? (v as VisibilityState) : {};
    } catch {
      return {};
    }
  });
  const columnVisibility = ownsVisibility ? ownVisibility : visibilityProp;
  const onColumnVisibility = ownsVisibility
    ? (v: VisibilityState) => {
        setOwnVisibility(v);
        try {
          localStorage.setItem(visKey, JSON.stringify(v));
        } catch {
          /* private window: the choice lasts this visit */
        }
      }
    : onVisibilityProp;

  // header drag (18 Sep 2026): the visible labelled columns in their shown order; a drop re-sequences them inside the
  // page's full order so hidden columns keep their slots, then the customiser's setOrder saves it
  const labelledIds = useMemo(
    () =>
      columns
        .filter(
          (c) =>
            c.id &&
            (c.meta?.label || (typeof c.header === "string" && c.header)),
        )
        .map((c) => c.id!),
    [columns],
  );
  const shownIds = labelledIds.filter((id) => columnVisibility?.[id] !== false);
  const shownOrdered = [
    ...(columnOrder ?? []).filter((id) => shownIds.includes(id)),
    ...shownIds.filter((id) => !(columnOrder ?? []).includes(id)),
  ];
  const fullOrdered = [
    ...(columnOrder ?? []).filter((id) => labelledIds.includes(id)),
    ...labelledIds.filter((id) => !(columnOrder ?? []).includes(id)),
  ];
  const colDrag = useDragSort(
    shownOrdered,
    (next) => onColumnOrder?.(mergeOrder(fullOrdered, next)),
    `cols:${label}`,
    "x",
  );

  // column widths (23 Sep 2026): dragged on the header's right edge, kept per table in the browser; double-click resets one
  const sizeKey = `mgdh.ui.table.${label}.sizes`;
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() => {
    if (!enableColumnResizing) return {};
    try {
      const v = JSON.parse(localStorage.getItem(sizeKey) ?? "{}") as unknown;
      return v && typeof v === "object" && !Array.isArray(v) ? (v as ColumnSizingState) : {};
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      if (Object.keys(columnSizing).length) localStorage.setItem(sizeKey, JSON.stringify(columnSizing));
      else localStorage.removeItem(sizeKey);
    } catch {
      /* private mode or full storage: widths just do not persist */
    }
  }, [columnSizing, sizeKey]);

  const table = useReactTable({
    data,
    columns: allColumns,
    getRowId,
    enableColumnResizing,
    columnResizeMode: "onChange",
    defaultColumn: { minSize: 36, maxSize: 1200 },
    onColumnSizingChange: (u) => setColumnSizing((prev) => (typeof u === "function" ? u(prev) : u)),
    // a page's default sort id may name no column ('none', a server-only key): TanStack warns on every render, so keep only real ids
    state: {
      sorting: sorting.filter((st) =>
        allColumns.some(
          (c) =>
            c.id === st.id || ("accessorKey" in c && c.accessorKey === st.id),
        ),
      ),
      pagination,
      columnVisibility,
      columnSizing,
      ...(fullOrder ? { columnOrder: fullOrder } : {}),
    },
    onSortingChange: (u) =>
      onSortingChange(typeof u === "function" ? u(sorting) : u),
    onPaginationChange: (u) =>
      onPaginationChange(typeof u === "function" ? u(pagination) : u),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    manualPagination: !!manual,
    manualSorting: !!manual,
    rowCount: manual ? (rowCount ?? data.length) : undefined,
  });
  const total = table.getRowCount();
  const from = total === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const to = Math.min(total, (pagination.pageIndex + 1) * pagination.pageSize);
  const rows = table.getRowModel().rows;
  const colCount = table.getVisibleLeafColumns().length;

  // `[` / `]` move the open panel to the previous / next row; Esc (with the panel closed) clears the selection
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (inField(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.defaultPrevented || dialogOpen()) return; // a dialog over the page owns the keys
      if ((e.key === "[" || e.key === "]") && selectedId && onRowClick) {
        const i = rows.findIndex((r) => r.id === selectedId);
        const next = rows[i + (e.key === "]" ? 1 : -1)];
        if (i >= 0 && next) {
          e.preventDefault();
          onRowClick(next.original);
          document
            .querySelector<HTMLElement>(
              `.ui-table tr[data-id="${CSS.escape(next.id)}"]`,
            )
            ?.scrollIntoView({ block: "nearest" });
        }
      } else if (
        e.key === "Escape" &&
        !selectedId &&
        selection &&
        selection.selected.length
      ) {
        selection.onChange([]);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [rows, selectedId, onRowClick, selection]);

  const toggleRow = (id: string, row: T) => {
    if (!selection || !selectable(row)) return;
    anchor.current = id;
    selection.onChange(
      selectedSet.has(id)
        ? selection.selected.filter((x) => x !== id)
        : [...selection.selected, id],
    );
  };
  const rangeTo = (id: string) => {
    if (!selection) return;
    const a = rows.findIndex((r) => r.id === anchor.current);
    const b = rows.findIndex((r) => r.id === id);
    const ids = (
      a >= 0 ? rows.slice(Math.min(a, b), Math.max(a, b) + 1) : [rows[b]!]
    )
      .filter((r) => selectable(r.original))
      .map((r) => r.id);
    selection.onChange(Array.from(new Set([...selection.selected, ...ids])));
  };

  return (
    <>
      <div className={`ui-table-host${bare ? " bare" : ""}`}>
      <div className={`ui-table-wrap${wrapperClassName ? ` ${wrapperClassName}` : ""}`}>
        <table
          className={`ui-table${lines === 2 ? " two-line" : lines === 3 ? " three-line" : ""}${className ? ` ${className}` : ""}`}
          aria-label={label}
          aria-multiselectable={selection ? true : undefined}
        >
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const canSort = h.column.getCanSort();
                  const sorted = h.column.getIsSorted();
                  const align = h.column.columnDef.meta?.align ?? "left";
                  const cls = h.column.columnDef.meta?.cls ?? "";
                  const { className: dragCls, ...drag } =
                    onColumnOrder && shownOrdered.includes(h.column.id)
                      ? colDrag.props(h.column.id)
                      : { className: "" };
                  const sized = enableColumnResizing && columnSizing[h.column.id] != null;
                  const resizing = h.column.getIsResizing();
                  return (
                    <th
                      key={h.id}
                      className={`${canSort ? "sortable" : ""} ${align} ${cls}${dragCls}${resizing ? " resizing" : ""}`}
                      style={sized ? { width: h.getSize(), minWidth: h.getSize(), maxWidth: h.getSize() } : { width: h.getSize() }}
                      onClick={
                        canSort ? h.column.getToggleSortingHandler() : undefined
                      }
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : undefined
                      }
                      title={
                        onColumnOrder && shownOrdered.includes(h.column.id)
                          ? "Drag to move the column"
                          : undefined
                      }
                      {...drag}
                    >
                      <span className="th">
                        {typeof h.column.columnDef.header === "string" ? (
                          <Term label={h.column.columnDef.header} />
                        ) : (
                          flexRender(h.column.columnDef.header, h.getContext())
                        )}
                        {sorted === "asc" && <ChevronUp />}
                        {sorted === "desc" && <ChevronDown />}
                      </span>
                      {h.column.getCanResize() && (
                        <span
                          className="col-resize"
                          role="separator"
                          aria-orientation="vertical"
                          aria-label={`Resize ${typeof h.column.columnDef.header === "string" ? h.column.columnDef.header : "column"}`}
                          title="Drag to resize · double-click to reset"
                          draggable={false}
                          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); h.getResizeHandler()(e); }}
                          onTouchStart={(e) => { e.stopPropagation(); h.getResizeHandler()(e); }}
                          onClick={(e) => e.stopPropagation()}
                          onDoubleClick={(e) => { e.stopPropagation(); h.column.resetSize(); }}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading && rows.length === 0 && (
              <tr className="ui-table-pending" style={{ cursor: "default" }}>
                <td colSpan={colCount} />
              </tr>
            )}
            {!(loading && rows.length === 0) && error && (
              <tr>
                <td colSpan={colCount} className="ui-error">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && rows.length === 0 && (
              <tr style={{ cursor: "default" }}>
                <td colSpan={colCount} className="ui-empty">
                  {emptyText}
                </td>
              </tr>
            )}
            {rows.length > 0 &&
              rows.map((r) => (
                <Fragment key={r.id}>
                  <tr
                    data-id={r.id}
                    className={`${selectedId === r.id ? "selected" : ""} ${selectedSet.has(r.id) ? "checked" : ""} ${rowClassName?.(r.original) ?? ""}`}
                    aria-selected={
                      selection ? selectedSet.has(r.id) : undefined
                    }
                    onClick={(e) => {
                      if (selection && (e.metaKey || e.ctrlKey))
                        return toggleRow(r.id, r.original);
                      if (selection && e.shiftKey) return rangeTo(r.id);
                      onRowClick?.(r.original);
                    }}
                    onContextMenu={
                      onRowContextMenu
                        ? (e) => onRowContextMenu(r.original, e)
                        : undefined
                    }
                    onDragOver={
                      onRowDrop
                        ? (e) => {
                            if (!e.dataTransfer.types.includes("Files")) return;
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "copy";
                            e.currentTarget.classList.add("dropping");
                          }
                        : undefined
                    }
                    onDragLeave={
                      onRowDrop
                        ? (e) => e.currentTarget.classList.remove("dropping")
                        : undefined
                    }
                    onDrop={
                      onRowDrop
                        ? (e) => {
                            e.currentTarget.classList.remove("dropping");
                            const files = Array.from(
                              e.dataTransfer.files ?? [],
                            );
                            if (!files.length) return;
                            e.preventDefault();
                            onRowDrop(r.original, files);
                          }
                        : undefined
                    }
                    onMouseDown={
                      selection
                        ? (e) => e.shiftKey && e.preventDefault()
                        : undefined
                    } // ⇧-click ranges rows, not text
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (inField(e.target)) return;
                      // ↑ ↓ move between rows, Enter opens (guide §5.7); Space selects, ⌘A selects the page, `.` opens the row menu
                      if (e.key === "Enter") onRowClick?.(r.original);
                      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                        e.preventDefault();
                        // an open second row (exp-row) is passed over: ↑ ↓ go row to row
                        const step = (el: Element | null) =>
                          e.key === "ArrowDown"
                            ? el?.nextElementSibling
                            : el?.previousElementSibling;
                        let next = step(e.currentTarget) as HTMLElement | null;
                        while (next?.classList.contains("exp-row"))
                          next = step(next) as HTMLElement | null;
                        next?.focus();
                      } else if (
                        expand &&
                        (e.key === "ArrowRight" || e.key === "ArrowLeft") &&
                        (!expand.has || expand.has(r.original))
                      ) {
                        // → opens the second row, → again steps into it (its first [data-nav] control); ← closes it
                        e.preventDefault();
                        const open = expandedSet.has(r.id);
                        if (e.key === "ArrowLeft") {
                          if (open) expand.onToggle(r.id);
                        } else if (!open) expand.onToggle(r.id);
                        else {
                          const sub = e.currentTarget.nextElementSibling;
                          if (sub?.classList.contains("exp-row"))
                            sub
                              .querySelector<HTMLElement>("[data-nav]")
                              ?.focus();
                        }
                      } else if (e.key === " " && selection) {
                        e.preventDefault();
                        if (e.shiftKey) rangeTo(r.id);
                        else toggleRow(r.id, r.original);
                      } else if (
                        (e.metaKey || e.ctrlKey) &&
                        e.key.toLowerCase() === "a" &&
                        selection
                      ) {
                        e.preventDefault();
                        selection.onChange(
                          Array.from(
                            new Set([
                              ...selection.selected,
                              ...rows
                                .filter((x) => selectable(x.original))
                                .map((x) => x.id),
                            ]),
                          ),
                        );
                      } else if (
                        (e.key === "." ||
                          e.key === "ContextMenu" ||
                          (e.key === "F10" && e.shiftKey)) &&
                        onRowContextMenu
                      ) {
                        e.preventDefault();
                        const rect = e.currentTarget.getBoundingClientRect();
                        onRowContextMenu(r.original, {
                          clientX: rect.left + 40,
                          clientY: rect.bottom,
                        });
                      }
                    }}
                  >
                    {r.getVisibleCells().map((c) => (
                      <td
                        key={c.id}
                        className={`${c.column.columnDef.meta?.align ?? "left"} ${c.column.columnDef.meta?.cls ?? ""}`}
                        style={enableColumnResizing && columnSizing[c.column.id] != null ? { width: c.column.getSize(), minWidth: c.column.getSize(), maxWidth: c.column.getSize() } : undefined}
                      >
                        {flexRender(c.column.columnDef.cell, c.getContext())}
                      </td>
                    ))}
                  </tr>
                  {expand && expandedSet.has(r.id) && (
                    <tr className="exp-row" data-parent={r.id}>
                      <td colSpan={colCount}>{expand.render(r.original)}</td>
                    </tr>
                  )}
                </Fragment>
              ))}
          </tbody>
        </table>
      </div>
      {loading && !bare && (
        <div className="ui-table-loading" role="status" aria-live="polite">
          <span className="ui-table-loading-spin">
            <Loader2 className="ui-spin" aria-hidden />
            <span className="sr-only">Loading</span>
          </span>
        </div>
      )}
      </div>
      {!bare && (
      <div className="ui-foot">
        <span className="pager">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight />
          </button>
        </span>
        <span className="ui-num">
          {from.toLocaleString("en-IN")}-{to.toLocaleString("en-IN")} of{" "}
          {total.toLocaleString("en-IN")} {label}
        </span>
        {note && <span>· {note}</span>}
        <span style={{ flex: 1 }} />
        {onColumnVisibility && labelledIds.length > 1 && (
          <ColumnsPop
            columns={columns}
            visibility={columnVisibility ?? {}}
            onChange={onColumnVisibility}
            order={columnOrder}
            onOrder={onColumnOrder}
          />
        )}
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          Rows Per Page:
          <select
            className="ui-select"
            value={pagination.pageSize}
            onChange={(e) =>
              onPaginationChange({
                pageIndex: 0,
                pageSize: Number(e.target.value),
              })
            }
          >
            {pageSizes.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      )}
    </>
  );
}
