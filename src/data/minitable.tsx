import { type ReactNode, useMemo } from "react";
import { type ColumnDef, type SortingState, type VisibilityState } from "@tanstack/react-table";
import { DenseTable } from "./table.js";
import { Term } from "../display/term.js";
import { type MenuAnchor } from "../overlay/menu.js";

export type MiniCol<T> = {
  key: string;
  header: string;
  align?: "right" | "acts";
  cell: (row: T) => ReactNode;
  width?: string;
};

/**
 * A small, already-loaded table inside a panel, form or settings card. It is the page table (`DenseTable`) in its
 * `bare` mode, so panels and pages share one table: the same cells, chips, row menu and highlights, with compact rows
 * and no pager, sorting or column menu. Columns are plain `{ key, header, cell }`.
 */
export function MiniTable<T>({
  rows,
  cols,
  rowKey,
  empty = "Nothing here.",
  onRowClick,
  onRowContextMenu,
  className,
  rowClassName,
  label,
}: {
  rows: Array<T>;
  cols: Array<MiniCol<T>>;
  rowKey: (r: T) => string;
  /** the empty row's text; `null` shows no row at all */
  empty?: ReactNode;
  onRowClick?: (r: T) => void;
  /** `rows2` for two-line rows */
  className?: string;
  /** right-click or the `.` key on a row opens the same menu kit as the page tables */
  onRowContextMenu?: (r: T, at: MenuAnchor) => void;
  /** a class per row (`warn`, `error`, `on`): highlights a suspect or picked row */
  rowClassName?: (r: T) => string;
  /** the table's accessible name ("Order lines"); the column headers ("Name, Amount") when not given */
  label?: string;
}) {
  const columns = useMemo<Array<ColumnDef<T, unknown>>>(
    () =>
      cols.map((c) => ({
        id: c.key,
        header: () => <Term label={c.header} />,
        cell: ({ row }) => c.cell(row.original),
        enableSorting: false,
        enableResizing: false,
        meta: {
          align: c.align ? "right" : "left",
          cls: c.align === "acts" ? "acts" : undefined,
        },
        ...(c.width ? { size: parseInt(c.width, 10) || undefined } : {}),
      })),
    [cols],
  );
  const twoLine = /\brows2\b/.test(className ?? "");
  if (rows.length === 0 && empty === null) return null;
  return (
    <DenseTable<T>
      bare
      label={label ?? cols.map((c) => c.header).join(", ")}
      columns={columns}
      data={rows}
      getRowId={rowKey}
      sorting={NO_SORT}
      onSortingChange={noop}
      pagination={{ pageIndex: 0, pageSize: Math.max(rows.length, 1) }}
      onPaginationChange={noop}
      manual
      rowCount={rows.length}
      columnVisibility={NO_HIDDEN}
      loading={false}
      emptyText={empty}
      onRowClick={onRowClick}
      onRowContextMenu={onRowContextMenu}
      rowClassName={rowClassName}
      lines={twoLine ? 2 : 1}
      className={`mini-table ${(className ?? "").replace(/\brows2\b/, "").trim()}`.trim()}
      enableColumnResizing={false}
    />
  );
}
const NO_SORT: SortingState = [];
const NO_HIDDEN: VisibilityState = {};
const noop = () => {};
