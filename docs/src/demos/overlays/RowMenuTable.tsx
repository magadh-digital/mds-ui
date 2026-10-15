// demo: a table's row menu: right-click a row, press "." on it, or use its ⋯ button
import { useState } from "react";
import { actionsToMenu, DenseTable, money, StatusChip, toast, useContextMenu, type Action } from "@mds/ui";
import { Copy, Eye, Truck, XCircle } from "lucide-react";

type Order = { id: string; partner: string; amount: number; status: string };
const ORDERS: Array<Order> = [
  { id: "SO-2041", partner: "Shree Balaji Traders", amount: 412500, status: "DELIVERED" },
  { id: "SO-2042", partner: "Maa Tara Steel", amount: 96800, status: "PENDING" },
  { id: "SO-2043", partner: "Bihar Build Mart", amount: 1250400, status: "ON_HOLD" },
  { id: "SO-2044", partner: "Magadh Hardware", amount: 58300, status: "PENDING" },
];

// one list of actions per row; the panel and the bulk bar use the same list
const actionsFor = (o: Order): Array<Action> => [
  { key: "view", label: "View", lucide: Eye, onClick: () => toast.info(`Opening ${o.id}`) },
  { key: "dispatch", label: "Dispatch", lucide: Truck, disabled: o.status !== "PENDING", title: "Only pending orders can be dispatched", onClick: () => toast.ok(`${o.id} dispatched`) },
  {
    key: "cancel",
    label: "Cancel order",
    lucide: XCircle,
    danger: true,
    confirm: { title: `Cancel ${o.id}?`, confirmLabel: "Cancel order", reason: { label: "Why?", required: true } },
    onClick: (reason) => toast.ok(`${o.id} cancelled: ${reason}`),
  },
  { key: "copy", label: "Copy order number", lucide: Copy, onClick: () => void navigator.clipboard?.writeText(o.id) },
];

export default function RowMenuTable() {
  const menu = useContextMenu();
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([]);
  const [page, setPage] = useState({ pageIndex: 0, pageSize: 25 });
  return (
    <div style={{ height: 300, display: "flex", flexDirection: "column" }}>
      <DenseTable
        label="Orders"
        data={ORDERS}
        getRowId={(o) => o.id}
        loading={false}
        sorting={sorting}
        onSortingChange={setSorting}
        pagination={page}
        onPaginationChange={setPage}
        columns={[
          { id: "id", accessorKey: "id", header: "Order" },
          { id: "partner", accessorKey: "partner", header: "Partner" },
          { id: "amount", accessorKey: "amount", header: "Amount", cell: (c) => money(c.getValue<number>()) },
          { id: "status", accessorKey: "status", header: "Status", cell: (c) => <StatusChip status={c.getValue<string>()} /> },
        ]}
        onRowContextMenu={(o, at) => menu.open(at, actionsToMenu(actionsFor(o)), o.id)}
      />
      {menu.element}
    </div>
  );
}
