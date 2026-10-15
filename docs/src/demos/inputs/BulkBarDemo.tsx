// demo: BulkBar over selected rows
import { useState } from "react";
import { Checkbox, BulkBar, Input, MiniTable, money, toast } from "@mds/ui";

type Invoice = { id: string; partner: string; amount: number };
const INVOICES: Array<Invoice> = [
  { id: "INV-2041", partner: "Ravi Traders", amount: 184500 },
  { id: "INV-2042", partner: "Mithila Steel", amount: 92300 },
  { id: "INV-2043", partner: "Kosi Hardware", amount: 41750 },
  { id: "INV-2044", partner: "Ganga Build Mart", amount: 268000 },
];

export default function BulkBarDemo() {
  const [selected, setSelected] = useState<Array<string>>(["INV-2041", "INV-2043"]);
  const [utr, setUtr] = useState("");
  const picked = INVOICES.filter((i) => selected.includes(i.id));
  const total = picked.reduce((s, i) => s + i.amount, 0);
  const toggle = (id: string, on: boolean) => setSelected(on ? [...selected, id] : selected.filter((x) => x !== id));
  return (
    <div>
      <BulkBar
        count={selected.length}
        unit={selected.length === 1 ? "invoice" : "invoices"}
        summary={money(total)}
        onClear={() => setSelected([])}
        actions={[
          {
            key: "paid",
            label: "Mark paid",
            primary: true,
            disabled: !utr.trim(),
            title: utr.trim() ? undefined : "Enter the UTR first",
            onClick: () => {
              toast.ok(`${selected.length} marked paid, UTR ${utr}`);
              setSelected([]);
              setUtr("");
            },
          },
          { key: "remind", label: "Send reminder", onClick: () => { toast.ok("Reminders sent"); } },
          { key: "export", label: "Export", onClick: () => { toast.info("Exporting"); } },
          {
            key: "void",
            label: "Void",
            danger: true,
            confirm: { title: "Void these invoices?", reason: { label: "Reason", required: true }, confirmLabel: "Void" },
            onClick: () => {
              toast.ok("Voided");
              setSelected([]);
            },
          },
        ]}
      >
        <Input aria-label="UTR" placeholder="UTR" value={utr} onChange={(e) => setUtr(e.target.value)} style={{ width: 140 }} />
      </BulkBar>
      <MiniTable
        label="Invoices"
        rows={INVOICES}
        rowKey={(r) => r.id}
        rowClassName={(r) => (selected.includes(r.id) ? "on" : "")}
        cols={[
          {
            key: "pick",
            header: "",
            width: "40px",
            cell: (r) => <Checkbox label={<span className="mds-sr-only">Select {r.id}</span>} checked={selected.includes(r.id)} onChange={(on) => toggle(r.id, on)} />,
          },
          { key: "id", header: "Invoice", cell: (r) => r.id },
          { key: "partner", header: "Partner", cell: (r) => r.partner },
          { key: "amount", header: "Amount", align: "right", cell: (r) => money(r.amount) },
        ]}
      />
    </div>
  );
}
