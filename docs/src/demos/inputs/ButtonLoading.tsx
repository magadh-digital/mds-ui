// demo: Button loading while an action runs
import { useState } from "react";
import { Send } from "lucide-react";
import { Button, toast } from "@mds/ui";

export default function ButtonLoading() {
  const [sending, setSending] = useState(false);
  const send = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500)); // your request here
    setSending(false);
    toast.ok("Invoice INV-2041 sent to Ravi Traders");
  };
  return (
    <div className="mds-hstack">
      <Button variant="primary" icon={<Send />} loading={sending} onClick={send}>
        {sending ? "Sending…" : "Send invoice"}
      </Button>
    </div>
  );
}
