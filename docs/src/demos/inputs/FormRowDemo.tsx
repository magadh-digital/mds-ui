// demo: FormRow and SaveBar, checked before saving
import { useState } from "react";
import { all, Autocomplete, check, DateInput, FormRow, Input, numberIn, required, SaveBar, Textarea, toast, useFormErrors } from "@mds/ui";

const PARTNERS = [
  { value: "p1", label: "Ravi Traders", hint: "Patna" },
  { value: "p2", label: "Shree Cement Agency", hint: "Gaya" },
  { value: "p3", label: "Mithila Steel", hint: "Darbhanga" },
];
const EMPTY = { partner: "", billNo: "", billDate: "", amount: "", note: "" };

export default function FormRowDemo() {
  const [saved, setSaved] = useState(EMPTY);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const errors = useFormErrors();
  const set = (k: keyof typeof EMPTY) => (v: string) => setForm({ ...form, [k]: v });
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  const save = async () => {
    const found = check(form, {
      partner: required("Partner"),
      billNo: required("Bill number"),
      billDate: required("Bill date"),
      amount: all(required("Amount"), numberIn({ positive: true })),
    });
    errors.set(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800)); // your request here
    setSaving(false);
    setSaved(form);
    toast.ok(`Bill ${form.billNo} saved`);
  };

  return (
    <div>
      <FormRow label="Partner" required error={errors.at("partner")}>
        <Autocomplete options={PARTNERS} value={form.partner} onChange={(v) => set("partner")(v ?? "")} placeholder="Search partners" />
      </FormRow>
      <FormRow label="Bill number" required error={errors.at("billNo")}>
        <Input value={form.billNo} onChange={(e) => set("billNo")(e.target.value)} />
      </FormRow>
      <FormRow label="Bill date" required error={errors.at("billDate")}>
        <DateInput value={form.billDate} onChange={set("billDate")} />
      </FormRow>
      <FormRow label="Amount" required hint="Before tax, in rupees" error={errors.at("amount")}>
        <Input inputMode="decimal" value={form.amount} onChange={(e) => set("amount")(e.target.value)} />
      </FormRow>
      <FormRow label="Note" hint="Shown to the accounts team">
        <Textarea value={form.note} onChange={(e) => set("note")(e.target.value)} />
      </FormRow>
      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={save}
        onReset={() => {
          setForm(saved);
          errors.clear();
        }}
        label="Save bill"
      />
    </div>
  );
}
