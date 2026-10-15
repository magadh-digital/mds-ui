import { date } from "./date.js";

/**
 * The kit's date, time, money and number formats. Every
 * helper takes nullish input and answers "—".
 */

type DateIn = string | number | Date | null | undefined;
const ok = (v: DateIn) => v != null && v !== "" && date(v).isValid();

/** "15 Oct 2026" */
export const day = (v: DateIn) => (ok(v) ? date(v).format("DD MMM YYYY") : "—");
/** "15 Oct 2026, 02:30 PM" */
export const dayTime = (v: DateIn) => (ok(v) ? date(v).format("DD MMM YYYY, hh:mm A") : "—");
/** "02:30 PM" */
export const hhmm = (v: DateIn) => (ok(v) ? date(v).format("hh:mm A") : "—");
/** "Oct 2026" */
export const monthYear = (v: DateIn) => (ok(v) ? date(v).format("MMM YYYY") : "—");

/** "just now", "5m ago", "3h ago", "2d ago", then the date */
export function ago(v: DateIn, now: number = Date.now()) {
  if (!ok(v)) return "—";
  const m = Math.floor((now - date(v).valueOf()) / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return day(v);
}

type NumIn = number | string | null | undefined;
const n = (v: NumIn) => (v == null || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));

/** "1,23,456" (Indian grouping); `digits` fixes the decimals */
export const num = (v: NumIn, digits?: number) => {
  const x = n(v);
  return x == null
    ? "—"
    : x.toLocaleString("en-IN", digits == null ? undefined : { minimumFractionDigits: digits, maximumFractionDigits: digits });
};
/** "₹1,23,456" — whole rupees unless `digits` is given ("₹1,23,456.50") */
export const rupees = (v: NumIn, digits?: number) => {
  const x = n(v);
  return x == null
    ? "—"
    : `₹${x.toLocaleString("en-IN", { minimumFractionDigits: digits ?? 0, maximumFractionDigits: digits ?? 2 })}`;
};
/** "12.5 MT" from kilograms */
export const mt = (kg: NumIn, digits = 1) => {
  const x = n(kg);
  return x == null ? "—" : `${(x / 1000).toLocaleString("en-IN", { maximumFractionDigits: digits })} MT`;
};
/** "1,234 kg" */
export const kg = (v: NumIn) => {
  const x = n(v);
  return x == null ? "—" : `${Math.round(x).toLocaleString("en-IN")} kg`;
};
