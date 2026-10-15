// The kit's components next to the ones they replaced (react-datepicker), with the same value: compare.html#old or #new
import { useState } from "react";
import { createRoot } from "react-dom/client";
import "@mds/ui/styles.css";
import { DateRange, type RangeValue } from "@mds/ui";
import { DateRange as OldDateRange } from "./old/OldDateRange";
import "./old/old-daterange.css";

function Compare() {
  const [v, setV] = useState<RangeValue>({ from: "2026-10-06", to: "2026-10-12" });
  const old = location.hash === "#old";
  return (
    <div style={{ padding: 24, width: 260 }} data-testid="picker">
      {old ? <OldDateRange value={v} onChange={setV} /> : <DateRange value={v} onChange={setV} />}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<Compare />);
