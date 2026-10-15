// demo: InlineInput in a small table
import { useState } from "react";
import { InlineInput, MiniTable, money, toast } from "@mds/ui";

type Rate = { id: string; product: string; rate: number };

export default function InlineInputDemo() {
  const [rows, setRows] = useState<Array<Rate>>([
    { id: "r1", product: "TMT bar 8 mm", rate: 61500 },
    { id: "r2", product: "TMT bar 12 mm", rate: 60200 },
    { id: "r3", product: "Binding wire", rate: 72000 },
  ]);
  const commit = (r: Rate, v: string) => {
    const rate = Number(v);
    if (!Number.isFinite(rate) || rate <= 0) return toast.error("Rate must be more than 0");
    setRows(rows.map((x) => (x.id === r.id ? { ...x, rate } : x)));
    toast.ok(`${r.product}: ${money(rate)} a tonne`);
  };
  return (
    <MiniTable
      label="Rates"
      rows={rows}
      rowKey={(r) => r.id}
      cols={[
        { key: "product", header: "Product", cell: (r) => r.product },
        {
          key: "rate",
          header: "Rate a Tonne",
          width: "160px",
          cell: (r) => <InlineInput type="number" label={`Rate for ${r.product}`} value={String(r.rate)} onCommit={(v) => commit(r, v)} width="120px" />,
        },
      ]}
    />
  );
}
