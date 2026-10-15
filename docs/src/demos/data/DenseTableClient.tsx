// demo: client-side sorting and paging, two-line rows and the column picker in the bottom bar
import { useState } from "react";
import type { ColumnDef, PaginationState, SortingState, VisibilityState } from "@tanstack/react-table";
import { DenseTable, StatusChip, day, money } from "@mds/ui";

type Order = { id: string; partner: string; city: string; status: string; placed: string; amount: number; items: number };

const PARTNERS = [
  ["Shree Traders", "Patna"],
  ["Gupta Steel", "Gaya"],
  ["Mithila Agro", "Darbhanga"],
  ["Kosi Hardware", "Purnia"],
  ["Ganga Builders", "Bhagalpur"],
  ["Vaishali Mart", "Hajipur"],
] as const;
const STATUSES = ["open", "dispatched", "delivered", "on_hold"];

const ORDERS: Array<Order> = Array.from({ length: 64 }, (_, i) => {
  const [partner, city] = PARTNERS[i % PARTNERS.length]!;
  return {
    id: `SO-${2400 + i}`,
    partner,
    city,
    status: STATUSES[(i * 7) % STATUSES.length]!,
    placed: `2026-10-${String((i % 15) + 1).padStart(2, "0")}`,
    amount: 12_500 + ((i * 3_517) % 240_000),
    items: (i % 9) + 1,
  };
});

const columns: Array<ColumnDef<Order>> = [
  {
    accessorKey: "id",
    header: "Order",
    cell: ({ row }) => (
      <>
        {row.original.id}
        <span className="sub">{row.original.items} items</span>
      </>
    ),
  },
  {
    accessorKey: "partner",
    header: "Partner",
    cell: ({ row }) => (
      <>
        {row.original.partner}
        <span className="sub">{row.original.city}</span>
      </>
    ),
  },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusChip status={row.original.status} /> },
  { accessorKey: "placed", header: "Placed", cell: ({ row }) => day(row.original.placed) },
  {
    accessorKey: "amount",
    header: "Amount",
    meta: { align: "right" },
    cell: ({ row }) => money(row.original.amount),
  },
];

export default function OrdersTable() {
  const [sorting, setSorting] = useState<SortingState>([{ id: "placed", desc: true }]);
  const [page, setPage] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  // the page keeps the column picks (in a real page: useListState's columnVisibility / setCols)
  const [cols, setCols] = useState<VisibilityState>({});

  return (
    <div style={{ height: 520, display: "flex", flexDirection: "column" }}>
      <DenseTable
        label="orders"
        columns={columns}
        data={ORDERS}
        getRowId={(r) => r.id}
        loading={false}
        lines={2}
        sorting={sorting}
        onSortingChange={setSorting}
        pagination={page}
        onPaginationChange={setPage}
        pageSizes={[10, 25, 50]}
        columnVisibility={cols}
        onColumnVisibility={setCols}
      />
    </div>
  );
}
