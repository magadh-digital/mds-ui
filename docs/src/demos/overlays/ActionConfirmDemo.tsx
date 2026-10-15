// demo: ActionConfirm: an Action with a confirm spec, the same one a row menu or panel uses
import { ActionConfirm, Button, toast, type Action } from "@mds/ui";
import { Ban } from "lucide-react";

const block: Action = {
  key: "block",
  label: "Block partner",
  lucide: Ban,
  danger: true,
  confirm: {
    title: "Block Bihar Build Mart?",
    description: "New orders are refused until someone unblocks them.",
    confirmLabel: "Block",
    reason: { label: "Reason (shown to the sales team)", required: true },
  },
  onClick: (reason) => {
    toast.ok(`Blocked: ${reason}`);
  },
};

export default function ActionConfirmDemo() {
  return (
    <ActionConfirm
      a={block}
      extra="Credit due: ₹4,12,000."
      trigger={<Button variant="danger" icon={<Ban />}>{block.label}</Button>}
    />
  );
}
