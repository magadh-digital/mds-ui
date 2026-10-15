import { ChevronDown, ChevronRight, ChevronUp, Loader2 } from "lucide-react";
import { createContext, Fragment, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { type ColumnDef, type ColumnSizingState, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, type PaginationState, type RowData, type SortingState, useReactTable, type VisibilityState } from "@tanstack/react-table";
import { ColumnsPop, columnIdOf, columnLabel, listedColumns } from "./columns.js";
import { Pagination } from "./pagination.js";
import { mergeOrder, useDragSort } from "./dragsort.js";
import { isRecord, readSaved, useClientLayoutEffect, writeSaved } from "./saved.js";
import { Term } from "../display/term.js";
import { dialogOpen } from "../overlay/dialog.js";
import { type MenuAnchor, RowMenuButton, useAnyMenuOpen } from "../overlay/menu.js";
import { storageKey } from "../core/storage.js";

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

/** Multi-select. Ids of the selected rows live with the page (a `useSelection`), the table only draws and toggles. */
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
  /** also called by the table itself when the page is past the last one (`?page=9` on 150 rows): it moves to the last page */
  onPaginationChange: (p: PaginationState) => void;
  columnVisibility?: VisibilityState;
  /** the user's column order from the customiser (ids of the page's columns); the checkbox, status and menu columns keep their edges */
  columnOrder?: Array<string>;
  /** given, the labelled header cells drag into a new order (dragsort.tsx); called with the page's column ids, hidden ones keeping their slots */
  onColumnOrder?: (order: Array<string>) => void;
  /**
   * given, the table's bottom bar carries `Columns` (show / hide, and reorder when `onColumnOrder` is given): the one
   * place every table keeps its column choices, never the toolbar or the sidebar
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
  /** the one-sentence empty row; a node where it carries a link (an offer to widen the date range) */
  emptyText?: ReactNode;
  note?: string | null;
  pageSizes?: Array<number>;
  /** the table's accessible name, and what the rows are in the pager ("21-40 of 683 partners") */
  label: string;
  /**
   * the name the table's own column picks and widths are saved under in this browser (`<prefix>.table.<storageId>.cols`
   * / `.sizes`); `label` by default. Give two tables with the same label different ids, and keep the id when a label
   * is renamed so saved choices survive.
   */
  storageId?: string;
  /** server-side paging and sorting: `data` is one page, `rowCount` the total */
  manual?: boolean;
  rowCount?: number;
  /** checkbox column + ⇧/⌘ click, Space, ⌘A */
  selection?: Selection<T>;
  /** right-click, the `.` key or the row's `⋯` button open the same menu */
  onRowContextMenu?: (row: T, at: MenuAnchor) => void;
  /** files dropped on a row (a statement onto its account); the row highlights while a file hovers it */
  onRowDrop?: (row: T, files: Array<File>) => void;
  /** a chevron column that opens a second row under the row (a record's lines); rows where `has` is false show no chevron */
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

const ALL = () => true;

/**
 * The page table: sticky header, kit row heights, sort on a header (click, or Enter / Space on its button), footer
 * paginator, selection and a row menu. Rows are one tab stop: Tab lands on one row, ↑ ↓ move between them.
 */
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
  storageId,
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
  const selectable = selection?.selectable ?? ALL;
  const anchor = useRef<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // the kit's own columns read the page's latest selection / expand / menu through this ref, so they are built once
  // per `columns` (not on every parent render, which would remount every cell)
  // the row whose ⋯ opened the menu on screen: its button says it is expanded until the menu closes
  const [menuRow, setMenuRow] = useState<string | null>(null);
  const anyMenuOpen = useAnyMenuOpen();
  const onRowMenuOpened = setMenuRow;
  const live = useRef({ selection, selectedSet, selectable, expand, expandedSet, onRowContextMenu, onRowMenuOpened });
  live.current = { selection, selectedSet, selectable, expand, expandedSet, onRowContextMenu, onRowMenuOpened };
  const hasSelection = !!selection;
  const hasExpand = !!expand;
  const hasMenu = !!onRowContextMenu;

  const allColumns = useMemo<Array<ColumnDef<T, any>>>(() => {
    const out: Array<ColumnDef<T, any>> = [];
    if (hasSelection) {
      out.push({
        id: "__sel",
        enableResizing: false,
        size: 30,
        enableSorting: false,
        enableHiding: false,
        meta: { cls: "sel" },
        header: ({ table }) => {
          const { selection, selectedSet, selectable } = live.current;
          if (!selection) return null;
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
          const { selection, selectedSet, selectable } = live.current;
          if (!selection || !selectable(row.original)) return null;
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
    if (hasExpand) {
      out.push({
        id: "__exp",
        enableResizing: false,
        size: 22,
        enableSorting: false,
        enableHiding: false,
        meta: { cls: "exp" },
        header: "",
        cell: ({ row }) => {
          const { expand, expandedSet } = live.current;
          if (!expand || (expand.has && !expand.has(row.original))) return null;
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
    if (hasMenu) {
      out.push({
        id: "__menu",
        enableResizing: false,
        size: 30,
        enableSorting: false,
        enableHiding: false,
        meta: { cls: "rowmenu" },
        header: "",
        cell: ({ row }) => (
          <RowMenuCell
            rowId={row.id}
            onOpen={(el) => {
              const r = el.getBoundingClientRect();
              live.current.onRowMenuOpened(row.id);
              live.current.onRowContextMenu?.(row.original, {
                clientX: r.left,
                clientY: r.bottom + 2,
              });
            }}
          />
        ),
      });
    }
    return out;
  }, [columns, hasSelection, hasExpand, hasMenu]);

  // the page's labelled columns (the ones the customiser lists and the header drags), by TanStack's id rule
  const labelledSet = useMemo(
    () =>
      new Set(
        columns
          .filter((c) => columnLabel(c) != null)
          .map((c) => columnIdOf(c))
          .filter((id): id is string => !!id && !id.startsWith("__")),
      ),
    [columns],
  );

  // the order the customiser saved, applied to the page's labelled columns only: the checkbox column stays first, an
  // unlabelled status column right after it, the row-menu column last; columns the saved order does not know follow it
  const fullOrder = useMemo(() => {
    if (!columnOrder?.length) return undefined;
    const ids = allColumns.map((c) => columnIdOf(c)).filter((id): id is string => !!id);
    const own = ids.filter((id) => labelledSet.has(id));
    const saved = columnOrder.filter((id) => labelledSet.has(id));
    return [
      ...ids.filter((id) => !labelledSet.has(id) && id !== "__menu"),
      ...saved,
      ...own.filter((id) => !saved.includes(id)),
      ...ids.filter((id) => id === "__menu"),
    ];
  }, [allColumns, labelledSet, columnOrder]);

  // column choices: a page that keeps its own (`columnVisibility` + `onColumnVisibility`) decides; a table given
  // neither keeps them itself, per table in the browser; one given only `columnVisibility` is fixed by the page and
  // shows no menu. Saved choices are read after mount, so a server render and the first client render agree.
  const saveId = storageId ?? label;
  const visKey = storageKey(`table.${saveId}.cols`);
  const ownsVisibility = visibilityProp === undefined && onVisibilityProp === undefined;
  const [ownVisibility, setOwnVisibility] = useState<VisibilityState>({});
  useClientLayoutEffect(() => {
    if (!ownsVisibility) return;
    const v = readSaved(visKey);
    setOwnVisibility(isRecord(v) ? (v as VisibilityState) : {});
  }, [ownsVisibility, visKey]);
  const columnVisibility = ownsVisibility ? ownVisibility : visibilityProp;
  const onColumnVisibility = ownsVisibility
    ? (v: VisibilityState) => {
        setOwnVisibility(v);
        writeSaved(visKey, v);
      }
    : onVisibilityProp;

  // column widths: dragged on the header's right edge, kept per table in the browser; double-click resets one
  const sizeKey = storageKey(`table.${saveId}.sizes`);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [sizesRead, setSizesRead] = useState<string | null>(null);
  useClientLayoutEffect(() => {
    if (!enableColumnResizing) return;
    const v = readSaved(sizeKey);
    setColumnSizing(isRecord(v) ? (v as ColumnSizingState) : {});
    setSizesRead(sizeKey);
  }, [enableColumnResizing, sizeKey]);
  useEffect(() => {
    // only once this key's saved widths are in state, so the defaults never overwrite them
    if (!enableColumnResizing || sizesRead !== sizeKey) return;
    writeSaved(sizeKey, Object.keys(columnSizing).length ? columnSizing : undefined);
  }, [columnSizing, sizeKey, sizesRead, enableColumnResizing]);

  // a page past the last one (`?page=9` on 150 rows) moves to the last page once the data says so; until then a
  // client-side table already shows the last page
  const total = manual ? (rowCount ?? data.length) : data.length;
  const lastPage = Math.max(0, Math.ceil(total / Math.max(pagination.pageSize, 1)) - 1);
  const pastEnd = pagination.pageIndex > lastPage;
  const shownPagination = useMemo<PaginationState>(
    () => (pastEnd && !manual ? { pageIndex: lastPage, pageSize: pagination.pageSize } : pagination),
    [pastEnd, manual, lastPage, pagination],
  );
  const onPage = useRef(onPaginationChange);
  onPage.current = onPaginationChange;
  useEffect(() => {
    if (pastEnd && !loading) onPage.current({ pageIndex: lastPage, pageSize: pagination.pageSize });
  }, [pastEnd, loading, lastPage, pagination.pageSize]);

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
      sorting: sorting.filter((st) => allColumns.some((c) => columnIdOf(c) === st.id)),
      pagination: shownPagination,
      columnVisibility,
      columnSizing,
      ...(fullOrder ? { columnOrder: fullOrder } : {}),
    },
    onSortingChange: (u) =>
      onSortingChange(typeof u === "function" ? u(sorting) : u),
    onPaginationChange: (u) =>
      onPaginationChange(typeof u === "function" ? u(shownPagination) : u),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    manualPagination: !!manual,
    manualSorting: !!manual,
    rowCount: manual ? total : undefined,
  });
  const rows = table.getRowModel().rows;
  const colCount = table.getVisibleLeafColumns().length;
  const leafColumns = table.getAllLeafColumns();
  // the page waits for a past-the-end page to come back (server paging): a blank body, not "Nothing matches."
  const waiting = loading || (pastEnd && total > 0);

  // header drag: the visible labelled columns in their shown order; a drop re-sequences them inside the
  // page's full order so hidden columns keep their slots, then the customiser's setOrder saves it
  const labelledIds = listedColumns(leafColumns).map((c) => c.id);
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
    `cols:${saveId}`,
    "x",
  );

  // roving tab stop: one row is in the tab order (the last focused, else the open one, else the first)
  const [focusRow, setFocusRow] = useState<string | null>(null);
  const tabRow =
    (focusRow != null && rows.some((r) => r.id === focusRow) && focusRow) ||
    (selectedId != null && rows.some((r) => r.id === selectedId) && selectedId) ||
    rows[0]?.id;

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
          wrapRef.current
            ?.querySelector<HTMLElement>(`tr[data-id="${CSS.escape(next.id)}"]`)
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
    <MenuRowContext.Provider value={anyMenuOpen ? menuRow : null}>
      <div className={`mds-table-host${bare ? " bare" : ""}`}>
      <div ref={wrapRef} className={`mds-table-wrap${wrapperClassName ? ` ${wrapperClassName}` : ""}`}>
        <table
          className={`mds-table${lines === 2 ? " two-line" : lines === 3 ? " three-line" : ""}${className ? ` ${className}` : ""}`}
          aria-label={label}
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
                  const head =
                    typeof h.column.columnDef.header === "string" ? (
                      <Term label={h.column.columnDef.header} />
                    ) : (
                      flexRender(h.column.columnDef.header, h.getContext())
                    );
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
                      {canSort ? (
                        // a real button, so the sort is reachable by Tab and Enter / Space; its click bubbles to the th
                        <button type="button" className="th">
                          {head}
                          {sorted === "asc" && <ChevronUp aria-hidden />}
                          {sorted === "desc" && <ChevronDown aria-hidden />}
                        </button>
                      ) : (
                        <span className="th">{head}</span>
                      )}
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
            {waiting && rows.length === 0 && (
              <tr className="mds-table-pending" style={{ cursor: "default" }}>
                <td colSpan={colCount} />
              </tr>
            )}
            {!(waiting && rows.length === 0) && error && (
              <tr>
                <td colSpan={colCount} className="mds-error">
                  {error}
                </td>
              </tr>
            )}
            {!waiting && !error && rows.length === 0 && (
              <tr style={{ cursor: "default" }}>
                <td colSpan={colCount} className="mds-empty">
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
                    tabIndex={r.id === tabRow ? 0 : -1}
                    onFocus={() => setFocusRow(r.id)}
                    onKeyDown={(e) => {
                      // keys pressed on a control inside a cell (the ⋯ button, a chevron, a checkbox) are that control's
                      if (e.target !== e.currentTarget) return;
                      // ↑ ↓ move between rows, Enter opens; Space selects, ⌘A selects the page, `.` opens the row menu
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
        <div className="mds-table-loading" role="status" aria-live="polite">
          <span className="mds-table-loading-spin">
            <Loader2 className="mds-spin" aria-hidden />
            <span className="mds-sr-only">Loading</span>
          </span>
        </div>
      )}
      </div>
      {!bare && (
      <Pagination
        pageIndex={shownPagination.pageIndex}
        pageSize={shownPagination.pageSize}
        total={total}
        onChange={(p) => onPaginationChange(p)}
        pageSizes={pageSizes}
        label={label}
        note={note}
        extra={
          onColumnVisibility && labelledIds.length > 1 ? (
            <ColumnsPop
              columns={leafColumns}
              visibility={columnVisibility ?? {}}
              onChange={onColumnVisibility}
              order={columnOrder}
              onOrder={onColumnOrder}
            />
          ) : null
        }
      />
      )}
    </MenuRowContext.Provider>
  );
}

const MenuRowContext = createContext<string | null>(null);
/** the row's `⋯`: expanded while the menu it opened is on screen */
function RowMenuCell({ rowId, onOpen }: { rowId: string; onOpen: (el: Element) => void }) {
  return <RowMenuButton onOpen={onOpen} expanded={useContext(MenuRowContext) === rowId} />;
}
