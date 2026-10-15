// demo: the kit's formats on real values, and "—" for anything missing
import { MiniTable, ago, date, day, dayTime, hhmm, money, monthYear, num } from "@mds/ui";

const placed = "2026-10-15T14:30:00";
const now = Date.now();

const ROWS: Array<[string, string]> = [
  ["day(placed)", day(placed)],
  ["dayTime(placed)", dayTime(placed)],
  ["hhmm(placed)", hhmm(placed)],
  ["monthYear(placed)", monthYear(placed)],
  ["ago(now - 5 minutes)", ago(now - 5 * 60_000)],
  ["ago(now - 3 hours)", ago(now - 3 * 3_600_000)],
  ['ago(date().add(2, "day"))', ago(date().add(2, "day"))],
  ["num(1234567)", num(1234567)],
  ["num(12.5, 2)", num(12.5, 2)],
  ["money(123456)", money(123456)],
  ["money(1234.5)", money(1234.5)],
  ["money(-980, 2)", money(-980, 2)],
  ["day(null)", day(null)],
  ['money("")', money("")],
];

export default function Formats() {
  return (
    <MiniTable
      label="Formats"
      rows={ROWS}
      rowKey={(r) => r[0]}
      cols={[
        { key: "call", header: "Call", cell: (r) => <code>{r[0]}</code> },
        { key: "result", header: "Result", cell: (r) => r[1] },
      ]}
    />
  );
}
