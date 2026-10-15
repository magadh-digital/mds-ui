import { type ColumnDef, type PaginationState, type SortingState, type VisibilityState } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Action } from "../core/types.js";
import { dialogOpen } from "../overlay/dialog.js";
import { toast } from "../overlay/toast.js";

/**
 * What every B + C + D list page shares: URL-backed search/sort/page state, the debounced search box,
 * column visibility and order per page, the toolbar and the `Customize Columns` popover. Pages keep their columns,
 * filters and panel; this removes the boilerplate.
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
export const num = (v: unknown, min = 1) =>
  typeof v === "number" && v >= min ? Math.floor(v) : undefined;
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
  const set = useCallback(
    (patch: Partial<S>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }),
    [navigate],
  );

  // debounced search box, `/` focuses it
  const [qInput, setQInput] = useState(s.q ?? "");
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => setQInput(s.q ?? ""), [s.q]);
  useEffect(() => {
    const t = setTimeout(() => {
      if ((s.q ?? "") !== qInput.trim())
        set({ q: qInput.trim() || undefined, page: undefined } as Partial<S>);
    }, 250);
    return () => clearTimeout(t);
  }, [qInput, s.q, set]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !dialogOpen() &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

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
    () => ({ pageIndex: (s.page ?? 1) - 1, pageSize: s.size ?? defaultSize }),
    [s.page, s.size, defaultSize],
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

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      try {
        return JSON.parse(
          localStorage.getItem(opts.colsKey) ?? "{}",
        ) as VisibilityState;
      } catch {
        return {};
      }
    },
  );
  const setCols = useCallback(
    (v: VisibilityState) => {
      setColumnVisibility(v);
      try {
        localStorage.setItem(opts.colsKey, JSON.stringify(v));
      } catch {}
    },
    [opts.colsKey],
  );
  // the column order the user arranged in the customiser, saved beside the visibility; [] = the page's own order
  const orderKey = `${opts.colsKey}.order`;
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    try {
      const v = JSON.parse(localStorage.getItem(orderKey) ?? "[]") as unknown;
      return Array.isArray(v)
        ? v.filter((x): x is string => typeof x === "string")
        : [];
    } catch {
      return [];
    }
  });
  const setOrder = useCallback(
    (o: string[]) => {
      setColumnOrder(o);
      try {
        if (o.length) localStorage.setItem(orderKey, JSON.stringify(o));
        else localStorage.removeItem(orderKey);
      } catch {}
    },
    [orderKey],
  );
  const [collapsed, setCollapsed] = useState(false);
  return {
    set,
    qInput,
    setQInput,
    searchRef,
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
    page: s.page ?? 1,
    size: s.size ?? defaultSize,
    sort: s.sort ?? opts.defaultSort,
    dir: s.dir ?? opts.defaultDir ?? "desc",
  };
}

/** Turns a facets map into a lookup: count for (field, value), 0 when absent. */
export const countOf = (
  facets: Record<string, Array<{ value: string; count: number }>> | undefined,
  field: string,
  value: string,
) => facets?.[field]?.find((f) => f.value === value)?.count ?? 0;
export const facetList = (
  facets:
    | Record<
        string,
        Array<{ value: string; label?: string | null; count: number }>
      >
    | undefined,
  field: string,
) => [...(facets?.[field] ?? [])].sort((a, b) => b.count - a.count);

// ---------------------------------------------------------------- selection + bulk actions

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
 * The actions every selected row offers (same `key`), each running on all of them in turn — the intersection, so the bar
 * only ever shows what applies to the whole pick. Disabled when disabled on any row (with that row's reason). One toast
 * at the end with the tally; the caller's per-row mutation should stay quiet (see `useReceiptStep({ quiet })`).
 */
export function commonActions<T>(
  rows: Array<T>,
  actionsFor: (r: T) => Array<Action>,
  unit = "rows",
): Array<Action> {
  if (rows.length === 0) return [];
  const lists = rows.map(actionsFor);
  return lists[0]!
    .filter(
      (a) =>
        !a.element &&
        (a.onClick || a.confirm) &&
        lists.every((l) => l.some((b) => b.key === a.key)),
    )
    .map((a) => {
      const per = lists.map((l) => l.find((b) => b.key === a.key)!);
      const off = per.find((b) => b.disabled);
      return {
        ...a,
        element: undefined,
        disabled: !!off,
        title: off?.title ?? a.title,
        onClick: (reason?: string) =>
          runBulk(
            a.label,
            per.map((b) => () => b.onClick?.(reason)),
            unit,
          ),
      };
    });
}

/** Runs the jobs one after another (the API is per id) and reports once. Rejects when nothing succeeded, so a confirm stays open. */
export async function runBulk(
  label: string,
  jobs: Array<() => unknown>,
  unit = "rows",
) {
  let ok = 0;
  const failed: Array<string> = [];
  for (const job of jobs) {
    try {
      await job();
      ok++;
    } catch (e) {
      failed.push(e instanceof Error ? e.message : "failed");
    }
  }
  if (failed.length === 0) toast.ok(`${label}: ${ok} ${unit}`);
  else if (ok === 0) {
    toast.error(`${label} failed on all ${failed.length}: ${failed[0]}`);
    throw new Error(failed[0]);
  } else
    toast.error(`${label}: ${ok} done, ${failed.length} failed (${failed[0]})`);
}

/** Selected rows as tab-separated text in the visible columns (header row from `meta.label`), for Excel. */
export function rowsToTsv<T>(
  rows: Array<T>,
  columns: Array<ColumnDef<T, any>>,
  visibility: VisibilityState = {},
): string {
  type Acc = {
    accessorKey?: string;
    accessorFn?: (r: T, i: number) => unknown;
  };
  const cols = columns.filter(
    (c) =>
      c.id &&
      visibility[c.id] !== false &&
      ((c as Acc).accessorKey || (c as Acc).accessorFn),
  );
  const cell = (r: T, i: number, c: ColumnDef<T, any>) => {
    const a = c as Acc;
    const v = a.accessorFn
      ? a.accessorFn(r, i)
      : (r as Record<string, unknown>)[a.accessorKey!];
    return v == null ? "" : String(v).replace(/[\t\n\r]+/g, " ");
  };
  const head = cols.map((c) => c.meta?.label ?? c.id).join("\t");
  return [
    head,
    ...rows.map((r, i) => cols.map((c) => cell(r, i, c)).join("\t")),
  ].join("\n");
}
