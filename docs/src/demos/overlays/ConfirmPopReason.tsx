// demo: ConfirmPop asking for a required reason before cancelling an order
import { useState } from "react";
import { Button, ConfirmPop, StatusChip, toast } from "@mds/ui";

export default function ConfirmPopReason() {
  const [status, setStatus] = useState("PENDING");
  return (
    <div className="mds-hstack" style={{ gap: 12 }}>
      <span>SO-2042 <StatusChip status={status} /></span>
      <ConfirmPop
        trigger={<Button disabled={status === "CANCELLED"}>Cancel order</Button>}
        title="Cancel SO-2042?"
        description="The partner is told and the reserved stock goes back to the yard."
        confirmLabel="Cancel order"
        reason={{ label: "Why is it cancelled?", required: true }}
        onConfirm={async (reason) => {
          await new Promise((r) => setTimeout(r, 600)); // the API call
          setStatus("CANCELLED");
          toast.ok(`Cancelled: ${reason}`);
        }}
      />
      {status === "CANCELLED" && <Button size="sm" onClick={() => setStatus("PENDING")}>Reset</Button>}
    </div>
  );
}
