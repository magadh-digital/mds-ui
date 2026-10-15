// demo: server paging and sorting (manual + rowCount), the loading overlay and an empty text with a way out
import { useEffect, useState } from "react";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { DenseTable, LinkButton, Toolbar, money, num, useDebounced } from "@mds/ui";

type Partner = { id: string; name: string; city: string; orders: number; due: number };

const CITIES = ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia", "Ara"];
const NAMES = ["Shree", "Gupta", "Mithila", "Kosi", "Ganga", "Vaishali", "Magadh", "Sone", "Tirhut"];
const KINDS = ["Traders", "Steel", "Agro", "Hardware", "Builders", "Mart"];
const ALL: Array<Partner> = Array.from({ length: 183 }, (_, i) => ({
  id: `P-${1000 + i}`,
  name: `${NAMES[i % NAMES.length]} ${KINDS[(i * 5) % KINDS.length]}`,
  city: CITIES[(i * 3) % CITIES.length]!,
  orders: (i * 13) % 140,
  due: (i * 7_919) % 480_000,
}));

// stands in for the API: filters, sorts and returns one page after a short wait
function fetchPartners(q: { search: string; sort: SortingState; page: PaginationState }) {
  return new Promise<{ rows: Array<Partner>; total: number }>((resolve) => {
    setTimeout(() => {
      const s = q.search.toLowerCase();
      let rows = ALL.filter((p) => !s || p.name.toLowerCase().includes(s) || p.city.toLowerCase().includes(s));
      const by = q.sort[0];
      if (by) {
        const k = by.id as keyof Partner;
        rows = [...rows].sort((a, b) => (a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0) * (by.desc ? -1 : 1));
      }
      const start = q.page.pageIndex * q.page.pageSize;
      resolve({ rows: rows.slice(start, start + q.page.pageSize), total: rows.length });
    }, 700);
  });
}

const columns: Array<ColumnDef<Partner>> = [
  { accessorKey: "name", header: "Partner" },
  { accessorKey: "city", header: "City" },
  { accessorKey: "orders", header: "Orders", meta: { align: "right" }, cell: ({ row }) => num(row.original.orders) },
  { accessorKey: "due", header: "Due", meta: { align: "right" }, cell: ({ row }) => money(row.original.due) },
];

export default function Partners() {
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim(), 300);
  const [sorting, setSorting] = useState<SortingState>([{ id: "due", desc: true }]);
  const [page, setPage] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });
  const [data, setData] = useState<{ rows: Array<Partner>; total: number }>({ rows: [], total: 0 });
  const [fetching, setFetching] = useState(true);
  const [tick, setTick] = useState(0);

  // a new search starts again from the first page
  useEffect(() => setPage((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 })), [q]);

  useEffect(() => {
    let live = true;
    setFetching(true);
    fetchPartners({ search: q, sort: sorting, page }).then((r) => {
      if (!live) return;
      setData(r);
      setFetching(false);
    });
    return () => {
      live = false;
    };
  }, [q, sorting, page, tick]);

  return (
    <div style={{ height: 480, display: "flex", flexDirection: "column" }}>
      <Toolbar
        title="Partners"
        count={data.total}
        search={{ value: search, onChange: setSearch, placeholder: "Search partners" }}
        onRefresh={() => setTick((t) => t + 1)}
        refreshing={fetching}
      />
      <DenseTable
        label="partners"
        columns={columns}
        data={data.rows}
        getRowId={(r) => r.id}
        manual
        rowCount={data.total}
        loading={fetching}
        sorting={sorting}
        onSortingChange={setSorting}
        pagination={page}
        onPaginationChange={setPage}
        emptyText={
          <>
            No partner matches “{q}”. <LinkButton onClick={() => setSearch("")}>Clear the search</LinkButton>
          </>
        }
      />
    </div>
  );
}
