// demo: useListState over React state standing in for the URL: search, sort, page and the column picks in one place
import { useCallback, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DenseTable, StatusChip, ToggleGroup, Toolbar, baseSearch, day, money, oneOf, useListState, type BaseSearch } from "@mds/ui";

type Order = { id: string; partner: string; status: "open" | "dispatched" | "delivered"; placed: string; amount: number };
type OrderSearch = BaseSearch & { status?: Order["status"] };

const STATUSES = ["open", "dispatched", "delivered"] as const;
const PARTNERS = ["Shree Traders", "Gupta Steel", "Mithila Agro", "Kosi Hardware", "Ganga Builders"];
const ORDERS: Array<Order> = Array.from({ length: 47 }, (_, i) => ({
  id: `SO-${3100 + i}`,
  partner: PARTNERS[i % PARTNERS.length]!,
  status: STATUSES[(i * 2) % 3]!,
  placed: `2026-10-${String((i % 14) + 1).padStart(2, "0")}`,
  amount: 8_000 + ((i * 6_311) % 150_000),
}));

const columns: Array<ColumnDef<Order>> = [
  { accessorKey: "id", header: "Order" },
  { accessorKey: "partner", header: "Partner" },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusChip status={row.original.status} /> },
  { accessorKey: "placed", header: "Placed", cell: ({ row }) => day(row.original.placed) },
  { accessorKey: "amount", header: "Amount", meta: { align: "right" }, cell: ({ row }) => money(row.original.amount) },
];

// what a router's validateSearch would do with the raw params
const validate = (raw: Record<string, unknown>): OrderSearch => ({ ...baseSearch(raw), status: oneOf(raw.status, STATUSES) });
// the search object as a query string, dropping empty values
const toQuery = (s: OrderSearch) =>
  new URLSearchParams(Object.entries(s).flatMap(([k, v]) => (v == null || v === "" ? [] : [[k, String(v)]]))).toString();

export default function OrdersList() {
  // React state plays the URL here; in an app this is the router's search params
  const [search, setSearch] = useState<OrderSearch>(() => validate({ size: "10" }));
  const navigate = useCallback(
    (o: { search: (prev: OrderSearch) => OrderSearch }) => setSearch((prev) => validate(o.search(prev))),
    [],
  );
  const L = useListState(search, navigate, { defaultSort: "placed", defaultSize: 25, colsKey: "docs.orders.cols" });

  const q = (search.q ?? "").toLowerCase();
  const rows = ORDERS.filter(
    (o) => (!search.status || o.status === search.status) && (!q || o.id.toLowerCase().includes(q) || o.partner.toLowerCase().includes(q)),
  );

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <code style={{ fontSize: 12 }}>?{toQuery(search)}</code>
      <div style={{ height: 440, display: "flex", flexDirection: "column" }}>
        <Toolbar
          title="Orders"
          count={rows.length}
          filters={
            <ToggleGroup
              label="Status"
              value={search.status ?? ""}
              onChange={(v) => L.set({ status: v || undefined, page: undefined })}
              options={STATUSES.map((s) => ({ value: s, label: s[0]!.toUpperCase() + s.slice(1) }))}
            />
          }
          search={{ value: L.qInput, onChange: L.setQInput, placeholder: "Search orders" }}
        />
        <DenseTable
          label="orders"
          columns={columns}
          data={rows}
          getRowId={(r) => r.id}
          loading={false}
          sorting={L.sorting}
          onSortingChange={L.onSortingChange}
          pagination={L.pagination}
          onPaginationChange={L.onPaginationChange}
          pageSizes={[10, 25, 50]}
          columnVisibility={L.columnVisibility}
          onColumnVisibility={L.setCols}
          columnOrder={L.columnOrder}
          onColumnOrder={L.setOrder}
        />
      </div>
    </div>
  );
}
