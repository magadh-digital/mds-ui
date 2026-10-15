// demo: ToggleGroup as a filter, with counts
import { useState } from "react";
import { ToggleGroup } from "@mds/ui";

type Status = "open" | "dispatched" | "delivered";
const ORDERS: Array<{ id: string; status: Status }> = [
  { id: "SO-501", status: "open" },
  { id: "SO-502", status: "dispatched" },
  { id: "SO-503", status: "open" },
  { id: "SO-504", status: "delivered" },
  { id: "SO-505", status: "open" },
];
const count = (s: Status) => ORDERS.filter((o) => o.status === s).length;

export default function ToggleFilter() {
  const [status, setStatus] = useState<Status | "">("");
  const shown = status ? ORDERS.filter((o) => o.status === status) : ORDERS;
  return (
    <div className="mds-vstack" style={{ gap: 8, alignItems: "flex-start" }}>
      <ToggleGroup
        label="Status"
        value={status}
        onChange={setStatus}
        options={[
          { value: "open", label: "Open", count: count("open") },
          { value: "dispatched", label: "Dispatched", count: count("dispatched") },
          { value: "delivered", label: "Delivered", count: count("delivered") },
        ]}
      />
      <span className="mds-muted">Showing {shown.map((o) => o.id).join(", ")}</span>
    </div>
  );
}
