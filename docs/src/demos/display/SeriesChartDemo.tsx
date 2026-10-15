// demo: SeriesChart with two series over a fortnight; hover shows a day's values
import { SeriesChart, type SeriesLine } from "@mds/ui";

const days = Array.from({ length: 14 }, (_, i) => `2026-10-${String(i + 1).padStart(2, "0")}`);
const ORDERED = [42, 38, 51, 47, 60, 22, 18, 55, 58, 49, 63, 70, 31, 25];
const DISPATCHED = [35, 40, 44, 50, 52, 30, 15, 48, 57, 52, 58, 66, 40, 22];

const series: Array<SeriesLine> = [
  { key: "ordered", label: "Ordered", points: days.map((x, i) => ({ x, y: ORDERED[i]! })) },
  { key: "dispatched", label: "Dispatched", points: days.map((x, i) => ({ x, y: DISPATCHED[i]! })) },
];

export default function SeriesChartDemo() {
  return (
    <div className="mds-vstack" style={{ gap: 24 }}>
      <SeriesChart series={series} unit=" t" />
      <SeriesChart series={[]} height={80} empty="No dispatches in this range." />
    </div>
  );
}
