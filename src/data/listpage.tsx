import { type Column, type ColumnDef, type PaginationState, type SortingState, type VisibilityState } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { columnIdOf } from "./columns.js";
import { readSaved, stringList, isRecord, useClientLayoutEffect, writeSaved } from "./saved.js";
import { storageKey } from "../core/storage.js";

/**
 * What every list page shares: URL-backed search/sort/page state, the debounced search box, column visibility and
 * order per page (for the table's `Customize columns`). Pages keep their columns, filters and panel; this removes the
 * boilerplate.
 */
export type BaseSearch = {
  q?: string;
  sort?: string;
  dir?: "asc" | "desc";
  page?: number;
  size?: number;
  id?: string;
  tab?: string;
  view?: string;
};
export const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
/** a whole number ≥ `min` from a number or a numeric string (`2`, `"2"`; URL params arrive as strings), else undefined */
export const num = (v: unknown, min = 1) => {
  const n =
    typeof v === "number"
      ? v
      : typeof v === "string" && /^\s*-?\d+(\.\d+)?\s*$/.test(v)
        ? Number(v)
        : NaN;
  return Number.isFinite(n) && n >= min ? Math.floor(n) : undefined;
};
export const csv = (v: string | undefined) =>
  v ? v.split(",").filter(Boolean) : [];
export const join = (a: Array<string>) => (a.length ? a.join(",") : undefined);
export const toggle = (list: Array<string>, key: string, on: boolean) =>
  on ? Array.from(new Set([...list, key])) : list.filter((k) => k !== key);
export const oneOf = <T extends string>(
  v: unknown,
  allowed: ReadonlyArray<T>,
): T | undefined => (allowed.includes(v as T) ? (v as T) : undefined);

/** The common search-param fields, validated. Pages spread this into their own validateSearch. */
export const baseSearch = (s: Record<string, unknown>): BaseSearch => ({
  q: str(s.q),
  sort: str(s.sort),
  dir: s.dir === "asc" || s.dir === "desc" ? s.dir : undefined,
  page: num(s.page, 2),
  size: num(s.size),
  id: str(s.id),
  tab: str(s.tab),
  view: str(s.view),
});

/**
 * A list page's state, kept in the URL's search params.
 *
 * - `s`: the current search params, ideally validated with `baseSearch` (numeric strings such as `page: "2"` are
 *   accepted too, so raw `URLSearchParams` values work).
 * - `navigate`: replaces the search params. It is called TanStack Router style, with an updater:
 *   `navigate({ search: (prev) => next, replace: true })`. Other routers wrap their own call, e.g. React Router:
 *
 *       const [params, setParams] = useSearchParams();
 *       const s = baseSearch(Object.fromEntries(params));
 *       const navigate = useCallback(
 *         (o: { search: (prev: BaseSearch) => BaseSearch }) =>
 *           setParams((p) => toParams(o.search(baseSearch(Object.fromEntries(p)))), { replace: true }),
 *         [setParams],
 *       ); // toParams: drop undefined values, String() the rest
 *
 *   Keep `navigate` stable (useCallback): the search box's debounce depends on it.
 * - `opts.colsKey`: the name the column picks and order are saved under (through `storageKey`, so the app's storage
 *   prefix applies): `<prefix>.<colsKey>` and `<prefix>.<colsKey>.order`.
 *
 * The search box (`qInput` / `setQInput`) is debounced into `q`; `/` is the Toolbar's, so pass
 * `search={{ value: L.qInput, onChange: L.setQInput }}` to the page's `Toolbar`.
 */
export function useListState<S extends BaseSearch>(
  s: S,
  navigate: (opts: { search: (prev: S) => S; replace: true }) => void,
  opts: {
    defaultSort: string;
    defaultDir?: "asc" | "desc";
    defaultSize?: number;
    colsKey: string;
    sortable?: ReadonlySet<string>;
  },
) {
  const defaultSize = opts.defaultSize ?? 50;
  const page = num(s.page) ?? 1;
  const size = num(s.size) ?? defaultSize;
  const set = useCallback(
    (patch: Partial<S>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }),
    [navigate],
  );

  // the debounced search box. A `q` that comes back from our own navigation is not echoed into the box (the reader may
  // have typed on while it was in flight); a `q` from anywhere else (Back, a link) replaces the box's text.
  const [qInput, setQInput] = useState(s.q ?? "");
  const sent = useRef<Array<string>>([]);
  useEffect(() => {
    const q = s.q ?? "";
    const i = sent.current.indexOf(q);
    if (i >= 0) {
      sent.current = sent.current.slice(i + 1);
      return;
    }
    sent.current = [];
    setQInput(q);
  }, [s.q]);
  useEffect(() => {
    const t = setTimeout(() => {
      const v = qInput.trim();
      if ((s.q ?? "") !== v) {
        sent.current.push(v);
        set({ q: v || undefined, page: undefined } as Partial<S>);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [qInput, s.q, set]);

  const sorting = useMemo<SortingState>(
    () => [
      {
        id: s.sort ?? opts.defaultSort,
        desc: s.sort ? s.dir !== "asc" : (opts.defaultDir ?? "desc") === "desc",
      },
    ],
    [s.sort, s.dir, opts.defaultSort, opts.defaultDir],
  );
  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex: page - 1, pageSize: size }),
    [page, size],
  );
  const onSortingChange = useCallback(
    (st: SortingState) => {
      const col = st[0]?.id;
      if (col && opts.sortable && !opts.sortable.has(col)) return;
      set({
        sort: col,
        dir: st[0] ? (st[0].desc ? "desc" : "asc") : undefined,
        page: undefined,
      } as Partial<S>);
    },
    [set, opts.sortable],
  );
  const onPaginationChange = useCallback(
    (p: PaginationState) =>
      set({
        page: p.pageIndex > 0 ? p.pageIndex + 1 : undefined,
        size: p.pageSize !== defaultSize ? p.pageSize : undefined,
      } as Partial<S>),
    [set, defaultSize],
  );

  // the reader's column picks and order, saved per page; read after mount (the server renders the page's defaults)
  const colsKey = storageKey(opts.colsKey);
  const orderKey = storageKey(`${opts.colsKey}.order`);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<Array<string>>([]);
  useClientLayoutEffect(() => {
    const v = readSaved(colsKey);
    setColumnVisibility(isRecord(v) ? (v as VisibilityState) : {});
    setColumnOrder(stringList(readSaved(orderKey)));
  }, [colsKey, orderKey]);
  const setCols = useCallback(
    (v: VisibilityState) => {
      setColumnVisibility(v);
      writeSaved(colsKey, v);
    },
    [colsKey],
  );
  // [] = the page's own order
  const setOrder = useCallback(
    (o: Array<string>) => {
      setColumnOrder(o);
      writeSaved(orderKey, o.length ? o : undefined);
    },
    [orderKey],
  );
  const [collapsed, setCollapsed] = useState(false);
  return {
    set,
    qInput,
    setQInput,
    sorting,
    pagination,
    onSortingChange,
    onPaginationChange,
    columnVisibility,
    setCols,
    columnOrder,
    setOrder,
    collapsed,
    setCollapsed,
    page,
    size,
    sort: s.sort ?? opts.defaultSort,
    dir: s.dir ?? opts.defaultDir ?? "desc",
  };
}

// ---------------------------------------------------------------- selection

/**
 * The page's selection: ids (so it survives paging) plus the rows behind them (kept as they are seen, so bulk actions can
 * read state). Cleared when `resetKey` changes — pass the filter params, so a new filter never carries stale picks.
 */
export function useSelection<T>(
  rows: Array<T>,
  getRowId: (r: T) => string,
  resetKey?: unknown,
) {
  const [selected, setSelected] = useState<Array<string>>([]);
  const seen = useRef(new Map<string, T>());
  rows.forEach((r) => seen.current.set(getRowId(r), r));
  const first = useRef(true);
  const key = JSON.stringify(resetKey ?? null);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSelected([]);
  }, [key]);
  // recomputed when the list refreshes too, so the bar's actions follow the rows' new state after a run
  const selectedRows = useMemo(
    () =>
      selected
        .map((id) => seen.current.get(id))
        .filter((r): r is T => r != null),
    [selected, rows],
  );
  const clear = useCallback(() => setSelected([]), []);
  return { selected, setSelected, clear, selectedRows, count: selected.length };
}

/**
 * Rows as tab-separated text in the visible columns (header row from `meta.label`, else a string header), for Excel.
 * `columns` are the page's column defs, or the table's own columns (`table.getAllLeafColumns()`); a column's id is
 * worked out as TanStack does (`id`, else `accessorKey`, else a string `header`), so `columnHelper.accessor("name")`
 * columns count too. Columns with no accessor (actions, the checkbox) are left out.
 */
export function rowsToTsv<T>(
  rows: Array<T>,
  columns: Array<ColumnDef<T, any> | Column<T, unknown>>,
  visibility: VisibilityState = {},
): string {
  type Acc = { accessorKey?: string; accessorFn?: (r: T, i: number) => unknown };
  const cols = columns
    .map((c) => {
      const def = ("columnDef" in c ? c.columnDef : c) as ColumnDef<T, any> & Acc;
      const id = "columnDef" in c ? c.id : columnIdOf(def);
      const key = def.accessorKey;
      const get: ((r: T, i: number) => unknown) | undefined =
        ("columnDef" in c ? c.accessorFn : undefined) ??
        def.accessorFn ??
        (key != null
          ? (r: T) =>
              key
                .split(".")
                .reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), r)
          : undefined);
      const label = def.meta?.label ?? (typeof def.header === "string" && def.header ? def.header : id);
      return { id, get, label };
    })
    .filter(
      (c): c is { id: string; get: (r: T, i: number) => unknown; label: string } =>
        !!c.id && !c.id.startsWith("__") && !!c.get && visibility[c.id] !== false,
    );
  const cell = (r: T, i: number, get: (r: T, i: number) => unknown) => {
    const v = get(r, i);
    return v == null ? "" : String(v).replace(/[\t\n\r]+/g, " ");
  };
  return [
    cols.map((c) => c.label).join("\t"),
    ...rows.map((r, i) => cols.map((c) => cell(r, i, c.get)).join("\t")),
  ].join("\n");
}
