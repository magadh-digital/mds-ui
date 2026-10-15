// demo: DateRange that always has a window, with fewer shortcuts
import { useState } from "react";
import { DateRange, presetRange, type RangeValue } from "@mds/ui";

export default function DateRangeWindow() {
  const [range, setRange] = useState<RangeValue>(presetRange("month"));
  return (
    <div style={{ maxWidth: 300 }}>
      <DateRange
        label="Sheet dates"
        value={range}
        onChange={setRange}
        allowAll={false}
        presets={["today", "yesterday", "month", "last_month"]}
      />
    </div>
  );
}
