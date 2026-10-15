// demo: ConfirmPop for a destructive delete: danger, typed "DELETE", and a failed first try
import { useRef } from "react";
import { Button, ConfirmPop, toast } from "@mds/ui";
import { Trash2 } from "lucide-react";

export default function ConfirmPopDelete() {
  const tries = useRef(0);
  return (
    <ConfirmPop
      trigger={<Button variant="danger" icon={<Trash2 />}>Delete partner</Button>}
      title="Delete Maa Tara Steel?"
      description="Its 14 orders and 3 open invoices stay, without a partner. This cannot be undone."
      confirmLabel="Delete"
      danger
      typed="DELETE"
      onConfirm={async () => {
        await new Promise((r) => setTimeout(r, 500));
        // the first try fails, to show the popover staying open for another go
        if (++tries.current === 1) {
          toast.error("Could not delete: the server is busy. Try again.");
          throw new Error("busy");
        }
        toast.ok("Partner deleted");
      }}
    />
  );
}
