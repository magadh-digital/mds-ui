// demo: Dialog holding a create form, with a toolbar control and a pinned footer
import { useState } from "react";
import { Button, Dialog, FormRow, Input, Select, Switch, toast } from "@mds/ui";

const PARTNERS = ["Shree Balaji Traders", "Maa Tara Steel", "Bihar Build Mart", "Magadh Hardware", "Rohtas Cement Store"].map((p) => ({ value: p, label: p }));

export default function DialogForm() {
  const [open, setOpen] = useState(false);
  const [partner, setPartner] = useState("");
  const [tonnes, setTonnes] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [tried, setTried] = useState(false);
  const errors = {
    partner: !partner ? "Pick a partner" : undefined,
    tonnes: !(Number(tonnes) > 0) ? "Enter the quantity in tonnes" : undefined,
  };
  const close = () => {
    setOpen(false);
    setPartner("");
    setTonnes("");
    setTried(false);
  };
  const save = () => {
    setTried(true);
    if (errors.partner || errors.tonnes) return;
    toast.ok(`Order created for ${partner}`);
    close();
  };
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>New order</Button>
      <Dialog
        open={open}
        onClose={close}
        title="New sales order"
        toolbar={<Switch checked={urgent} onChange={setUrgent} label="Urgent" />}
        footer={
          <div className="mds-hstack" style={{ justifyContent: "flex-end", gap: 8, width: "100%" }}>
            <Button onClick={close}>Cancel</Button>
            <Button variant="primary" onClick={save}>Create order</Button>
          </div>
        }
      >
        <div className="mds-vstack" style={{ gap: 12 }}>
          <FormRow label="Partner" required error={tried ? errors.partner : undefined}>
            <Select value={partner} onChange={(e) => setPartner(e.target.value)} placeholder="Pick one…" options={PARTNERS} />
          </FormRow>
          <FormRow label="Quantity (tonnes)" required error={tried ? errors.tonnes : undefined} hint="TMT 12 mm, Fe 550D">
            <Input inputMode="decimal" value={tonnes} onChange={(e) => setTonnes(e.target.value)} />
          </FormRow>
        </div>
      </Dialog>
    </>
  );
}
