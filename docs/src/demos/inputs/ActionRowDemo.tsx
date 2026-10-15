// demo: ActionRow for one record
import { CheckCircle2, PauseCircle } from "lucide-react";
import { ActionRow, toast } from "@mds/ui";

export default function ActionRowDemo() {
  return (
    <div style={{ maxWidth: 380 }}>
      <ActionRow
        buttons={[
          { key: "approve", label: "Approve", primary: true, icon: <CheckCircle2 />, onClick: () => { toast.ok("PO-1182 approved"); } },
          {
            key: "hold",
            label: "Hold",
            icon: <PauseCircle />,
            confirm: { title: "Hold PO-1182?", reason: { label: "Why is it on hold?", required: true }, confirmLabel: "Hold" },
            onClick: (reason) => { toast.info(`On hold: ${reason}`); },
          },
        ]}
        links={[
          { key: "edit", label: "Edit", onClick: () => { toast.info("Editing PO-1182"); } },
          { key: "print", label: "Print", onClick: () => { toast.info("Printing"); } },
          { key: "invoice", label: "Raise invoice", disabled: true, title: "Approve the order first" },
          {
            key: "delete",
            label: "Delete",
            danger: true,
            confirm: { title: "Delete PO-1182?", description: "The order and its lines go for good.", typed: "DELETE", confirmLabel: "Delete" },
            onClick: () => { toast.ok("PO-1182 deleted"); },
          },
        ]}
      />
    </div>
  );
}
