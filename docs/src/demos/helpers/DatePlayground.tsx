// demo: type a date and a format; see what date() makes of it
import { useState } from "react";
import { FormRow, Input, MiniTable, date } from "@mds/ui";

export default function DatePlayground() {
  const [value, setValue] = useState("2026-10-15 14:30");
  const [pattern, setPattern] = useState("ddd, DD MMM YYYY [at] hh:mm A");
  const d = date(value);

  const rows: Array<[string, string]> = [
    ["isValid()", String(d.isValid())],
    ["format(pattern)", d.format(pattern)],
    ['add(1, "month")', d.add(1, "month").format("DD MMM YYYY")],
    ['subtract(6, "day").startOf("day")', d.subtract(6, "day").startOf("day").format("DD MMM YYYY, HH:mm")],
    ['startOf("week")', d.startOf("week").format("ddd DD MMM")],
    ['startOf("quarter")', d.startOf("quarter").format("DD MMM YYYY")],
    ['endOf("month")', d.endOf("month").format("DD MMM YYYY, HH:mm:ss.SSS")],
    ['diff(date(), "day")', String(d.diff(date(), "day"))],
    ['isSame(date(), "month")', String(d.isSame(date(), "month"))],
  ];

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 640 }}>
      <FormRow label="Value" hint="a date, a date and time, or an ISO instant">
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
      </FormRow>
      <FormRow label="Format">
        <Input value={pattern} onChange={(e) => setPattern(e.target.value)} />
      </FormRow>
      <MiniTable
        label="Results"
        rows={rows}
        rowKey={(r) => r[0]}
        cols={[
          { key: "call", header: "Call", cell: (r) => <code>{r[0]}</code> },
          { key: "result", header: "Result", cell: (r) => r[1] },
        ]}
      />
    </div>
  );
}
