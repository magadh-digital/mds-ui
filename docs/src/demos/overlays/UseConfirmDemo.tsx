// demo: useConfirm: a confirm started from code, awaited like a promise
import { Button, toast, useConfirm } from "@mds/ui";

export default function UseConfirmDemo() {
  const ask = useConfirm();
  const closeDay = async () => {
    const reason = await ask.confirm({
      title: "Close the day at Gaya main yard?",
      description: "Weighments after this go to tomorrow's register.",
      confirmLabel: "Close day",
      reason: { label: "Note for the register (optional)" },
    });
    if (reason === null) return toast.info("Left open");
    toast.ok(reason ? `Day closed: ${reason}` : "Day closed");
  };
  const deleteInvoice = async () => {
    const reason = await ask.confirm({ title: "Delete invoice INV-7781?", danger: true, typed: "DELETE", confirmLabel: "Delete" });
    if (reason !== null) toast.ok("Invoice deleted");
  };
  return (
    <div className="mds-hstack" style={{ gap: 8 }}>
      <Button onClick={() => void closeDay()}>Close day</Button>
      <Button variant="danger" onClick={() => void deleteInvoice()}>Delete invoice</Button>
      {ask.element}
    </div>
  );
}
