// demo: Switch, with a label and icon-only in a table
import { useState } from "react";
import { MiniTable, Switch } from "@mds/ui";

type Warehouse = { id: string; name: string; active: boolean };

export default function SwitchDemo() {
  const [notify, setNotify] = useState(true);
  const [rows, setRows] = useState<Array<Warehouse>>([
    { id: "w1", name: "Patna Central", active: true },
    { id: "w2", name: "Gaya", active: false },
  ]);
  return (
    <div className="mds-vstack" style={{ gap: 12 }}>
      <Switch label="Email the partner when an order is dispatched" checked={notify} onChange={setNotify} />
      <Switch label="Send a daily summary (owners only)" checked={false} onChange={() => {}} disabled />
      <MiniTable
        label="Warehouses"
        rows={rows}
        rowKey={(r) => r.id}
        cols={[
          { key: "name", header: "Warehouse", cell: (r) => r.name },
          {
            key: "active",
            header: "Active",
            width: "90px",
            cell: (r) => (
              <Switch
                hideLabel
                label={`${r.name} active`}
                checked={r.active}
                onChange={(on) => setRows(rows.map((x) => (x.id === r.id ? { ...x, active: on } : x)))}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
