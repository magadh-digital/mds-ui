// demo: FootActions: a record's actions in a panel foot (primary, one more, the rest under More)
import { FootActions, toast, type Action } from "@mds/ui";
import { Check, Copy, Pencil, Printer, XCircle } from "lucide-react";

const actions: Array<Action> = [
  { key: "approve", label: "Approve", lucide: Check, icon: <Check />, primary: true, onClick: () => toast.ok("Approved") },
  { key: "edit", label: "Edit", lucide: Pencil, icon: <Pencil />, onClick: () => toast.info("Editing") },
  { key: "print", label: "Print", lucide: Printer, onClick: () => toast.info("Printing") },
  { key: "copy", label: "Copy link", lucide: Copy, onClick: () => toast.ok("Link copied") },
  {
    key: "reject",
    label: "Reject",
    lucide: XCircle,
    danger: true,
    confirm: { title: "Reject PO-3310?", reason: { label: "Reason", required: true }, confirmLabel: "Reject" },
    onClick: (reason) => toast.ok(`Rejected: ${reason}`),
  },
];

export default function FootActionsDemo() {
  return (
    <div className="mds-hstack" style={{ justifyContent: "flex-end", gap: 8, borderTop: "1px solid var(--mds-c-border)", paddingTop: 12 }}>
      <FootActions actions={actions} title="PO-3310" />
    </div>
  );
}
