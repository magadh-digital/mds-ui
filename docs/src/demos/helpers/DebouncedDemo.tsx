// demo: the list filters on the settled text, not on every key
import { useState } from "react";
import { FormRow, Input, MiniTable, num, useDebounced } from "@mds/ui";

const WAREHOUSES = [
  { id: "WH-01", name: "Patna Main", stock: 18_420 },
  { id: "WH-02", name: "Gaya Depot", stock: 6_310 },
  { id: "WH-03", name: "Bhagalpur Main", stock: 9_870 },
  { id: "WH-04", name: "Patna Depot 2", stock: 4_150 },
  { id: "WH-05", name: "Muzaffarpur Main", stock: 12_030 },
];

export default function WarehouseSearch() {
  const [text, setText] = useState("");
  const q = useDebounced(text.trim().toLowerCase(), 400); // what a server query would be keyed on
  const rows = WAREHOUSES.filter((w) => w.name.toLowerCase().includes(q));

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
      <FormRow label="Warehouse" hint={`typed “${text}” · searching “${q}”`}>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type quickly: patna" />
      </FormRow>
      <MiniTable
        label="Warehouses"
        rows={rows}
        rowKey={(w) => w.id}
        empty="No warehouse matches."
        cols={[
          { key: "name", header: "Warehouse", cell: (w) => w.name },
          { key: "stock", header: "Stock", align: "right", cell: (w) => `${num(w.stock)} bags` },
        ]}
      />
    </div>
  );
}
