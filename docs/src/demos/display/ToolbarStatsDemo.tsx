// demo: ToolbarStats inline in a Toolbar; a figure with onClick filters the list
import { useState } from "react";
import { Button, Toolbar, ToolbarStats, money } from "@mds/ui";
import { Plus } from "lucide-react";

export default function ToolbarStatsDemo() {
  const [q, setQ] = useState("");
  const [only, setOnly] = useState<"" | "overdue">("");
  return (
    <div style={{ height: 120, display: "flex", flexDirection: "column", border: "1px solid var(--mds-c-border)" }}>
      <Toolbar
        title="Invoices"
        count={only === "overdue" ? 7 : 128}
        chips={only ? ["Overdue"] : undefined}
        search={{ value: q, onChange: setQ, placeholder: "Search invoices" }}
        onRefresh={() => new Promise((r) => setTimeout(r, 700))}
      >
        <ToolbarStats
          items={[
            { label: "billed today", value: money(842300) },
            { label: "paid", value: 41, sub: "/ 52", tone: "ok" },
            { label: "overdue", value: 7, tone: "error", title: "Show only overdue invoices", onClick: () => setOnly(only ? "" : "overdue") },
          ]}
        />
        <Button variant="primary" icon={<Plus />}>New invoice</Button>
      </Toolbar>
    </div>
  );
}
