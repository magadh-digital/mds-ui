// demo: Tabs for the sections of one record, with counts and a disabled tab
import { useState } from "react";
import { Empty, Tabs } from "@mds/ui";

type Section = "details" | "items" | "payments" | "files" | "logs";

export default function TabsDemo() {
  const [tab, setTab] = useState<Section>("details");
  return (
    <div className="mds-vstack" style={{ gap: 12 }}>
      <Tabs
        label="Order SO-2041"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "details", label: "Details" },
          { value: "items", label: "Items", count: 3 },
          { value: "payments", label: "Payments", count: 1240 },
          { value: "files", label: "Files", count: 0 },
          { value: "logs", label: "Logs", disabled: true },
        ]}
      />
      {tab === "details" && <p style={{ margin: 0 }}>Shree Balaji Traders · Gaya · due 30 Oct</p>}
      {tab === "items" && <p style={{ margin: 0 }}>TMT 8 mm, TMT 12 mm, binding wire</p>}
      {tab === "payments" && <p style={{ margin: 0 }}>1,240 payments</p>}
      {tab === "files" && <Empty compact title="No files yet" />}
    </div>
  );
}
