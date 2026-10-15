// demo: EditPop editing a rate in place, with close() after save
import { useState } from "react";
import { Button, EditPop, FormRow, IconAction, Input, money, toast } from "@mds/ui";
import { Pencil } from "lucide-react";

export default function EditPopRate() {
  const [rate, setRate] = useState(58400);
  return (
    <div className="mds-hstack" style={{ gap: 6 }}>
      <span>TMT 12 mm: <strong className="mds-num">{money(rate)}</strong> / tonne</span>
      <EditPop trigger={<IconAction icon={Pencil} label="Edit rate" />} title="Edit rate" width="300px">
        {(close) => <RateForm rate={rate} onSave={(v) => { setRate(v); close(); }} onCancel={close} />}
      </EditPop>
    </div>
  );
}

function RateForm({ rate, onSave, onCancel }: { rate: number; onSave: (v: number) => void; onCancel: () => void }) {
  const [value, setValue] = useState(String(rate));
  const n = Number(value);
  const error = !value.trim() || !Number.isFinite(n) || n <= 0 ? "Enter a rate above zero" : undefined;
  return (
    <form
      className="mds-vstack"
      style={{ gap: 10 }}
      onSubmit={(e) => {
        e.preventDefault();
        if (error) return;
        onSave(n);
        toast.ok("Rate saved");
      }}
    >
      <FormRow label="Rate per tonne" required error={error}>
        <Input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
      </FormRow>
      <div className="mds-hstack" style={{ justifyContent: "flex-end", gap: 8 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={!!error}>Save</Button>
      </div>
    </form>
  );
}
