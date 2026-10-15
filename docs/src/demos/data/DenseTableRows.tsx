// demo: selection, a row menu, expandable rows and an open row; the table keeps its own column picks (storageId)
import { useState } from "react";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { Copy, Eye, Send, XCircle } from "lucide-react";
import { Button, DenseTable, MiniTable, StatusChip, Toolbar, day, money, toast, useContextMenu, useSelection, type MenuAnchor } from "@mds/ui";

type Line = { item: string; qty: number; rate: number };
type Invoice = { id: string; partner: string; due: string; status: string; lines: Array<Line> };

const INVOICES: Array<Invoice> = [
  { id: "INV-3101", partner: "Shree Traders", due: "2026-10-18", status: "unpaid", lines: [{ item: "TMT bar 12 mm", qty: 40, rate: 610 }, { item: "Binding wire", qty: 12, rate: 95 }] },
  { id: "INV-3102", partner: "Gupta Steel", due: "2026-10-12", status: "overdue", lines: [{ item: "TMT bar 16 mm", qty: 25, rate: 640 }] },
  { id: "INV-3103", partner: "Mithila Agro", due: "2026-10-05", status: "paid", lines: [{ item: "Cement 50 kg", qty: 120, rate: 385 }] },
  { id: "INV-3104", partner: "Kosi Hardware", due: "2026-10-22", status: "unpaid", lines: [] },
  { id: "INV-3105", partner: "Ganga Builders", due: "2026-10-09", status: "overdue", lines: [{ item: "TMT bar 8 mm", qty: 60, rate: 590 }, { item: "TMT bar 10 mm", qty: 30, rate: 600 }, { item: "Binding wire", qty: 20, rate: 95 }] },
  { id: "INV-3106", partner: "Vaishali Mart", due: "2026-10-28", status: "unpaid", lines: [{ item: "Cement 50 kg", qty: 40, rate: 385 }] },
];
const total = (inv: Invoice) => inv.lines.reduce((s, l) => s + l.qty * l.rate, 0);

const columns: Array<ColumnDef<Invoice>> = [
  { accessorKey: "id", header: "Invoice" },
  { accessorKey: "partner", header: "Partner" },
  { accessorKey: "due", header: "Due", cell: ({ row }) => day(row.original.due) },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusChip status={row.original.status} /> },
  { id: "amount", accessorFn: total, header: "Amount", meta: { align: "right" }, cell: ({ row }) => money(total(row.original)) },
];

export default function Invoices() {
  const [sorting, setSorting] = useState<SortingState>([{ id: "due", desc: false }]);
  const [page, setPage] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });
  const [open, setOpen] = useState<string | undefined>();
  const [expanded, setExpanded] = useState<Array<string>>([]);
  const sel = useSelection(INVOICES, (r) => r.id);
  const menu = useContextMenu();

  const rowMenu = (inv: Invoice, at: MenuAnchor) =>
    menu.open(
      at,
      [
        { key: "view", label: "View", icon: Eye, onSelect: () => setOpen(inv.id) },
        { key: "remind", label: "Send reminder", icon: Send, disabled: inv.status === "paid", title: inv.status === "paid" ? "Already paid" : undefined, onSelect: () => { toast.ok(`Reminder sent for ${inv.id}`); } },
        {
          key: "cancel",
          label: "Cancel invoice",
          icon: XCircle,
          danger: true,
          sep: true,
          confirm: { title: `Cancel ${inv.id}?`, confirmLabel: "Cancel invoice", danger: true, reason: { label: "Why", required: true } },
          onSelect: (reason) => { toast.ok(`${inv.id} cancelled: ${reason}`); },
        },
        { key: "copy", label: "Copy number", icon: Copy, onSelect: () => void navigator.clipboard?.writeText(inv.id) },
      ],
      inv.id,
    );

  return (
    <div style={{ height: 420, display: "flex", flexDirection: "column" }}>
      <Toolbar title="Invoices" count={INVOICES.length}>
        {sel.count > 0 && (
          <>
            <span className="mds-muted">{sel.count} selected</span>
            <Button variant="primary" icon={<Send />} onClick={() => {
                toast.ok(`${sel.count} reminders sent`);
                sel.clear();
              }}>
              Send reminders
            </Button>
          </>
        )}
      </Toolbar>
      <DenseTable
        label="invoices"
        storageId="docs-invoices"
        columns={columns}
        data={INVOICES}
        getRowId={(r) => r.id}
        loading={false}
        sorting={sorting}
        onSortingChange={setSorting}
        pagination={page}
        onPaginationChange={setPage}
        selectedId={open}
        onRowClick={(r) => setOpen(r.id)}
        selection={{ selected: sel.selected, onChange: sel.setSelected, selectable: (r) => r.status !== "paid" }}
        onRowContextMenu={rowMenu}
        expand={{
          expanded,
          onToggle: (id) => setExpanded((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id])),
          has: (r) => r.lines.length > 0,
          render: (r) => (
            <MiniTable
              label={`${r.id} lines`}
              rows={r.lines}
              rowKey={(l) => l.item}
              cols={[
                { key: "item", header: "Item", cell: (l) => l.item },
                { key: "qty", header: "Qty", align: "right", cell: (l) => l.qty },
                { key: "rate", header: "Rate", align: "right", cell: (l) => money(l.rate) },
                { key: "amount", header: "Amount", align: "right", cell: (l) => money(l.qty * l.rate) },
              ]}
            />
          ),
        }}
      />
      {menu.element}
    </div>
  );
}
