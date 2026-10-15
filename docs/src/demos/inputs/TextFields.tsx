// demo: Input, Textarea, Select and Checkbox in a form
import { useState } from "react";
import { Checkbox, FormRow, Input, Select, Textarea } from "@mds/ui";

const WAREHOUSES = [
  { value: "pat", label: "Patna Central" },
  { value: "gya", label: "Gaya" },
  { value: "mzf", label: "Muzaffarpur" },
  { value: "bgp", label: "Bhagalpur" },
  { value: "drb", label: "Darbhanga" },
];

export default function TextFields() {
  const [ref, setRef] = useState("PO-1182");
  const [warehouse, setWarehouse] = useState("");
  const [note, setNote] = useState("");
  const [urgent, setUrgent] = useState(false);
  return (
    <div>
      <FormRow label="Reference">
        <Input value={ref} onChange={(e) => setRef(e.target.value)} />
      </FormRow>
      <FormRow label="Warehouse">
        <Select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} placeholder="Pick one…" options={WAREHOUSES} />
      </FormRow>
      <FormRow label="Note">
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="For the driver" />
      </FormRow>
      <FormRow label="Priority">
        <Checkbox label="Deliver today" checked={urgent} onChange={setUrgent} />
      </FormRow>
    </div>
  );
}
