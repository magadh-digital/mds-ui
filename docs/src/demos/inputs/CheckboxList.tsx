// demo: Checkbox list with counts (a filter group)
import { useState } from "react";
import { Checkbox } from "@mds/ui";

const STATUSES = [
  { value: "draft", label: "Draft", count: 12 },
  { value: "sent", label: "Sent", count: 48 },
  { value: "paid", label: "Paid", count: 1204 },
  { value: "overdue", label: "Overdue", count: 7 },
];

export default function CheckboxList() {
  const [picked, setPicked] = useState<Array<string>>(["sent", "overdue"]);
  const toggle = (v: string, on: boolean) => setPicked(on ? [...picked, v] : picked.filter((x) => x !== v));
  return (
    <div style={{ maxWidth: 240 }}>
      {STATUSES.map((s) => (
        <Checkbox key={s.value} label={s.label} count={s.count} checked={picked.includes(s.value)} onChange={(on) => toggle(s.value, on)} />
      ))}
      <Checkbox label="Cancelled" checked={false} onChange={() => {}} disabled />
    </div>
  );
}
