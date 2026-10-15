import { date, type DateLike } from "./date.js";
import { kitLocale, localeNumber } from "./locale.js";

/**
 * The kit's date, time, money and number formats. Every helper takes nullish (or unreadable) input and answers "—".
 * Numbers and money follow the kit's locale (core/locale.ts).
 */

const ok = (v: DateLike) => v != null && v !== "" && date(v).isValid();

/** "15 Oct 2026" */
export const day = (v: DateLike) => (ok(v) ? date(v).format("DD MMM YYYY") : "—");
/** "15 Oct 2026, 02:30 PM" */
export const dayTime = (v: DateLike) => (ok(v) ? date(v).format("DD MMM YYYY, hh:mm A") : "—");
/** "02:30 PM" */
export const hhmm = (v: DateLike) => (ok(v) ? date(v).format("hh:mm A") : "—");
/** "Oct 2026" */
export const monthYear = (v: DateLike) => (ok(v) ? date(v).format("MMM YYYY") : "—");

/**
 * How long ago (or how far ahead): "just now" within a minute either way, then "5m ago" / "3h ago" / "2d ago", or
 * "in 5m" / "in 3h" / "in 2d" for a future time; past 30 days, the date.
 */
export function ago(v: DateLike, now: number = Date.now()) {
  if (!ok(v)) return "—";
  const diff = now - date(v).valueOf();
  const m = Math.floor(Math.abs(diff) / 60_000);
  if (m < 1) return "just now";
  const say = (s: string) => (diff < 0 ? `in ${s}` : `${s} ago`);
  if (m < 60) return say(`${m}m`);
  const h = Math.floor(m / 60);
  if (h < 24) return say(`${h}h`);
  const d = Math.floor(h / 24);
  if (d < 30) return say(`${d}d`);
  return day(v);
}

type NumIn = number | string | null | undefined;
const n = (v: NumIn) => (v == null || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));
const fixed = (digits?: number) =>
  digits == null ? undefined : { minimumFractionDigits: digits, maximumFractionDigits: digits };

/** A number in the kit's locale ("1,23,456" with en-IN); `digits` fixes the decimals */
export const num = (v: NumIn, digits?: number) => {
  const x = n(v);
  return x == null ? "—" : localeNumber(x, fixed(digits));
};

const moneyIn = (x: number, currency: string, digits?: number) =>
  localeNumber(x, {
    style: "currency",
    currency,
    // a whole amount reads without decimals ("₹1,234"); a fractional one with the currency's own ("₹1,234.50")
    ...(fixed(digits) ?? (Number.isInteger(x) ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {})),
  });

/**
 * Money in the kit's currency and locale (`kitLocale().currency`): "₹1,23,456", "-₹1,234", "₹1,234.50". A whole
 * amount shows no decimals and a fractional one the currency's usual decimals; `digits` fixes them ("₹1,23,456.00").
 */
export const money = (v: NumIn, digits?: number) => {
  const x = n(v);
  return x == null ? "—" : moneyIn(x, kitLocale().currency, digits);
};

/**
 * Rupees in the kit's locale, whatever the kit's currency: the same rules as `money` ("₹1,23,456", "₹1,234.50").
 * @deprecated use `money`, which follows `kitLocale().currency`.
 */
export const rupees = (v: NumIn, digits?: number) => {
  const x = n(v);
  return x == null ? "—" : moneyIn(x, "INR", digits);
};
