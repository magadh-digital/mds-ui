// demo: ConfirmDialog owned by the page: open state plus an async onConfirm
import { useState } from "react";
import { Button, ConfirmDialog, toast } from "@mds/ui";

export default function ConfirmDialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Write off balance</Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Write off ₹2,340 for Shree Balaji Traders?"
        description="A credit note is made for the balance and the ledger is settled."
        confirmLabel="Write off"
        reason={{ label: "Reason", required: true }}
        onConfirm={async (reason) => {
          await new Promise((r) => setTimeout(r, 800)); // the API call; the button says "Working…" meanwhile
          toast.ok(`Written off: ${reason}`);
        }}
      />
    </>
  );
}
