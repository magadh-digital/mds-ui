// demo: DateRange, a day or a range
import { useState } from "react";
import { DateRange, presetRange, type RangeValue } from "@mds/ui";

export default function DateRangeBasic() {
  const [range, setRange] = useState<RangeValue>(presetRange("7d"));
  return (
    <div className="mds-vstack" style={{ maxWidth: 300, gap: 8 }}>
      <DateRange label="Order dates" value={range} onChange={setRange} />
      <code>{JSON.stringify(range)}</code>
    </div>
  );
}
