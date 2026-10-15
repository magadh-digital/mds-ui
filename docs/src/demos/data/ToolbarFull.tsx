// demo: a list page's toolbar: title and count, filters, search (`/`), refresh (`R`), the primary button and More
import { useState } from "react";
import { Archive, Download, Plus, Printer } from "lucide-react";
import { Button, DateRange, Kbd, MoreMenu, ToggleGroup, Toolbar, hhmm, toast, type RangeValue } from "@mds/ui";

// stands in for the list query's refetch: resolves after a moment
const refetch = () => new Promise((resolve) => setTimeout(resolve, 900));

export default function OrdersToolbar() {
  const [range, setRange] = useState<RangeValue>({});
  const [status, setStatus] = useState<"" | "open" | "dispatched" | "delivered">("");
  const [q, setQ] = useState("");
  const [loadedAt, setLoadedAt] = useState(() => new Date());

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Toolbar
        title="Orders"
        count={1284}
        unit="orders"
        filters={
          <>
            <DateRange label="Placed" value={range} onChange={setRange} />
            <ToggleGroup
              label="Status"
              value={status}
              onChange={setStatus}
              options={[
                { value: "open", label: "Open", count: 412 },
                { value: "dispatched", label: "Dispatched", count: 96 },
                { value: "delivered", label: "Delivered" },
              ]}
            />
          </>
        }
        search={{ value: q, onChange: setQ, placeholder: "Search orders" }}
        // the icon spins until the returned promise settles
        onRefresh={() => refetch().then(() => setLoadedAt(new Date()))}
      >
        <Button variant="primary" icon={<Plus />} onClick={() => toast.ok("New order")}>
          New order
        </Button>
        <MoreMenu
          items={[
            { key: "export", label: "Export to Excel", icon: Download, onSelect: () => { toast.ok("Exported"); } },
            { key: "print", label: "Print list", icon: Printer, onSelect: () => window.print() },
            {
              key: "archive",
              label: "Archive delivered",
              icon: Archive,
              sep: true,
              confirm: { title: "Archive every delivered order?", confirmLabel: "Archive" },
              onSelect: () => { toast.ok("Archived"); },
            },
          ]}
        />
      </Toolbar>
      <p className="mds-muted" style={{ margin: 0 }}>
        Search: “{q}” · Status: {status || "all"} · Loaded at {hhmm(loadedAt)}. Press <Kbd>/</Kbd> to search, <Kbd>R</Kbd> to refresh.
      </p>
    </div>
  );
}
