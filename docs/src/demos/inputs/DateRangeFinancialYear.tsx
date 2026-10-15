// demo: the financial-year shortcut follows the locale
import { useEffect, useState } from "react";
import { configureLocale, DateRange, kitLocale, presetRange, rangeLabel, Seg, type RangeValue } from "@mds/ui";

// An app calls configureLocale once at start-up (or passes UIProvider's `locale`).
// This demo switches it live only to show the shortcut move, and puts it back when it leaves the page.
const STARTS = [
  { value: "3", label: "April (India)" },
  { value: "0", label: "January" },
  { value: "6", label: "July (Australia)" },
];

export default function DateRangeFinancialYear() {
  const [start, setStart] = useState(String(kitLocale().fyStartMonth));
  const [range, setRange] = useState<RangeValue>({});
  useEffect(() => {
    const before = kitLocale().fyStartMonth;
    return () => configureLocale({ fyStartMonth: before });
  }, []);
  const pickStart = (v: string) => {
    configureLocale({ fyStartMonth: Number(v) });
    setStart(v);
    setRange(presetRange("fy"));
  };
  return (
    <div className="mds-vstack" style={{ gap: 8, alignItems: "flex-start" }}>
      <Seg label="Financial year starts in" options={STARTS} value={start} onChange={pickStart} />
      <div style={{ width: 300, maxWidth: "100%" }}>
        <DateRange label="Ledger dates" value={range} onChange={setRange} presets={["month", "last_month", "fy", "all"]} />
      </div>
      <span className="mds-muted">This financial year: {rangeLabel(presetRange("fy"))}</span>
    </div>
  );
}
