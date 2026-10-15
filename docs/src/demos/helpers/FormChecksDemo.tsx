// demo: check the form before sending, show the errors per field, and land the service's refusals on the same fields
import { useState } from "react";
import { Button, FormRow, Input, all, check, dateLike, digits, maxLen, numberIn, required, toast, useFormErrors } from "@mds/ui";

type Partner = { name: string; pin: string; credit: string; since: string };

const RULES = {
  name: all(required("Name"), maxLen(60)),
  pin: all(required("PIN code"), digits(6, "PIN code")),
  credit: numberIn({ min: 0, max: 5_000_000, integer: true, unit: "rupees" }),
  since: dateLike,
};

// stands in for the API: refuses a name that is taken, the way a 400 with a field list does
const savePartner = (p: Partner) =>
  new Promise<void>((resolve, reject) =>
    setTimeout(() => {
      if (p.name.trim().toLowerCase() === "shree traders")
        reject({ fields: [{ field: "partner.name", message: "a partner with this name already exists" }] });
      else resolve();
    }, 600),
  );

export default function NewPartner() {
  const [form, setForm] = useState<Partner>({ name: "", pin: "", credit: "", since: "" });
  const [saving, setSaving] = useState(false);
  const f = useFormErrors();
  const edit = (k: keyof Partner) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  const send = async () => {
    const errors = check(form, RULES);
    f.set(errors);
    if (Object.keys(errors).length) return;
    setSaving(true);
    try {
      await savePartner(form);
      f.clear();
      toast.ok(`${form.name} added`);
    } catch (e) {
      f.fromError(e); // "partner.name" lands under "name" too
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 8, maxWidth: 560 }}>
      <FormRow label="Name" required error={f.at("name")}>
        <Input value={form.name} onChange={edit("name")} placeholder="Try Shree Traders" />
      </FormRow>
      <FormRow label="PIN code" required error={f.at("pin")}>
        <Input value={form.pin} onChange={edit("pin")} inputMode="numeric" />
      </FormRow>
      <FormRow label="Credit limit" hint="in rupees, up to 50,00,000" error={f.at("credit")}>
        <Input value={form.credit} onChange={edit("credit")} inputMode="numeric" />
      </FormRow>
      <FormRow label="Partner since" hint="YYYY-MM-DD" error={f.at("since")}>
        <Input value={form.since} onChange={edit("since")} placeholder="2026-09-13" />
      </FormRow>
      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "flex-end" }}>
        {f.first && <span className="mds-error">{f.first}</span>}
        <Button variant="primary" loading={saving} onClick={send}>
          Add partner
        </Button>
      </div>
    </div>
  );
}
