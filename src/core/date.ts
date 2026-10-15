/**
 * A small date type for the kit and the apps that use it: the part of dayjs a list page calls, with no dependency.
 * Immutable: every change returns a new value.
 *
 *   date()                      now
 *   date("2026-10-15")          that day, local midnight (a date-only string is a local date, as in dayjs)
 *   date("2026-10-15T09:00Z")   an instant
 *   date(1760500000000)         milliseconds
 *   date(new Date())            a copy
 *   date(null) / date("junk")   invalid: isValid() is false and format() answers "Invalid Date"
 *
 *   date(v).format("DD MMM YYYY, hh:mm A")   "15 Oct 2026, 02:30 PM"
 *   date().subtract(6, "day").startOf("day")
 *   date(a).diff(b, "day")      NaN when either date is invalid
 *
 * Units: millisecond second minute hour day week month quarter year (also plural, and ms s m h d w M Q y). A week
 * starts on the locale's `weekStartsOn` (core/locale.ts; Sunday by default, as dayjs). A fractional `add` rounds as
 * dayjs does: days and weeks to the nearest whole day, months and years toward zero.
 *
 * Format tokens: YYYY YY · MMMM MMM MM M · DD D · dddd ddd dd d · HH H · hh h · mm m · ss s · SSS · A a · Z ZZ;
 * text inside [brackets] is printed as is ("[on] DD MMM"); empty brackets "[]" print as they are.
 */

import { kitLocale } from "./locale.js";

export type DateLike = KitDate | Date | string | number | null | undefined;
export type Unit =
  | "millisecond"
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year";
type UnitIn = Unit | `${Unit}s` | "ms" | "s" | "m" | "h" | "d" | "w" | "M" | "Q" | "y";

const SHORT: Record<string, Unit> = {
  ms: "millisecond",
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  M: "month",
  Q: "quarter",
  y: "year",
};
const unitOf = (u: UnitIn): Unit =>
  (SHORT[u] ?? (u.endsWith("s") && u !== "ms" ? u.slice(0, -1) : u)) as Unit;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const pad = (n: number, w = 2) => String(Math.abs(n)).padStart(w, "0");

// "2026-10-15" (date only) is a LOCAL day; native Date would read it as UTC midnight and shift it in India
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
// "2026-10-15 14:30[:05]" with a space and no zone: local time
const LOCAL_TIME = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;

function parse(v: DateLike): number {
  if (v === undefined) return Date.now();
  if (v === null || v === "") return NaN;
  if (v instanceof KitDate) return v.valueOf();
  if (v instanceof Date) return v.getTime();
  // through Date, so a fraction of a millisecond is dropped and an out-of-range number is invalid (as dayjs)
  if (typeof v === "number") return new Date(v).getTime();
  const s = v.trim();
  let m = DATE_ONLY.exec(s);
  if (m) return new Date(+m[1]!, +m[2]! - 1, +m[3]!).getTime();
  m = LOCAL_TIME.exec(s);
  if (m)
    return new Date(
      +m[1]!,
      +m[2]! - 1,
      +m[3]!,
      +m[4]!,
      +m[5]!,
      +(m[6] ?? 0),
      +(m[7] ?? "0").padEnd(3, "0"),
    ).getTime();
  return new Date(s).getTime();
}

export class KitDate {
  readonly #t: number;
  constructor(v?: DateLike) {
    this.#t = parse(v);
  }
  #d() {
    return new Date(this.#t);
  }
  #with(edit: (d: Date) => void) {
    const d = this.#d();
    if (!Number.isNaN(this.#t)) edit(d);
    return new KitDate(d);
  }

  isValid() {
    return !Number.isNaN(this.#t);
  }
  valueOf() {
    return this.#t;
  }
  toDate() {
    return this.#d();
  }
  toISOString() {
    return this.#d().toISOString();
  }
  toString() {
    return this.isValid() ? this.#d().toString() : "Invalid Date";
  }
  toJSON() {
    return this.isValid() ? this.toISOString() : null;
  }
  clone() {
    return new KitDate(this.#t);
  }

  year() {
    return this.#d().getFullYear();
  }
  /** 0–11, as in dayjs */
  month() {
    return this.#d().getMonth();
  }
  /** day of the month, 1–31 */
  date() {
    return this.#d().getDate();
  }
  /** day of the week, 0 (Sunday) – 6 */
  day() {
    return this.#d().getDay();
  }
  hour() {
    return this.#d().getHours();
  }
  minute() {
    return this.#d().getMinutes();
  }
  second() {
    return this.#d().getSeconds();
  }
  millisecond() {
    return this.#d().getMilliseconds();
  }
  daysInMonth() {
    return new Date(this.year(), this.month() + 1, 0).getDate();
  }

  add(n: number, unit: UnitIn = "millisecond"): KitDate {
    const u = unitOf(unit);
    switch (u) {
      case "millisecond":
        return new KitDate(this.#t + n);
      case "second":
        return new KitDate(this.#t + n * 1000);
      case "minute":
        return new KitDate(this.#t + n * 60_000);
      case "hour":
        return new KitDate(this.#t + n * 3_600_000);
      // days and weeks round to a whole day (1.5 days = 2 days), as dayjs
      case "day":
        return this.#with((d) => d.setDate(d.getDate() + Math.round(n)));
      case "week":
        return this.#with((d) => d.setDate(d.getDate() + Math.round(n * 7)));
      case "month":
      case "quarter":
      case "year":
        return this.#with((d) => {
          // 31 Jan + 1 month = 28/29 Feb (the month's last day), never 2/3 Mar: as dayjs. A fraction is dropped by
          // setMonth / setFullYear themselves (toward zero), as dayjs, which hands them the same sums.
          const day = d.getDate();
          d.setDate(1);
          if (u === "year") d.setFullYear(d.getFullYear() + n);
          else d.setMonth(d.getMonth() + (u === "quarter" ? n * 3 : n));
          const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
          d.setDate(Math.min(day, last));
        });
    }
  }
  subtract(n: number, unit: UnitIn = "millisecond") {
    return this.add(-n, unit);
  }

  startOf(unit: UnitIn): KitDate {
    const u = unitOf(unit);
    return this.#with((d) => {
      switch (u) {
        case "year":
          d.setMonth(0, 1);
          d.setHours(0, 0, 0, 0);
          break;
        case "quarter":
          d.setMonth(Math.floor(d.getMonth() / 3) * 3, 1);
          d.setHours(0, 0, 0, 0);
          break;
        case "month":
          d.setDate(1);
          d.setHours(0, 0, 0, 0);
          break;
        case "week": {
          const start = kitLocale().weekStartsOn;
          const w = d.getDay();
          d.setDate(d.getDate() - ((w < start ? w + 7 : w) - start));
          d.setHours(0, 0, 0, 0);
          break;
        }
        case "day":
          d.setHours(0, 0, 0, 0);
          break;
        case "hour":
          d.setMinutes(0, 0, 0);
          break;
        case "minute":
          d.setSeconds(0, 0);
          break;
        case "second":
          d.setMilliseconds(0);
          break;
        case "millisecond":
          break;
      }
    });
  }
  endOf(unit: UnitIn): KitDate {
    const u = unitOf(unit);
    if (u === "millisecond") return this.clone();
    return this.startOf(u).add(1, u).subtract(1, "millisecond");
  }

  /** `this − other` in whole units (truncated toward zero), or exact with `float`; NaN when either date is invalid */
  diff(other: DateLike, unit: UnitIn = "millisecond", float = false): number {
    const o = new KitDate(other);
    if (!this.isValid() || !o.isValid()) return NaN;
    const u = unitOf(unit);
    let v: number;
    if (u === "month" || u === "quarter" || u === "year") {
      v = monthDiff(this, o) / (u === "year" ? 12 : u === "quarter" ? 3 : 1);
    } else {
      const ms = this.#t - o.valueOf();
      const per = { millisecond: 1, second: 1e3, minute: 6e4, hour: 36e5 }[u as "millisecond" | "second" | "minute" | "hour"];
      // whole days/weeks count calendar days, so a DST shift or a time of day does not make 1 day read as 0.96
      v = u === "day" || u === "week" ? calendarDays(this, o) / (u === "week" ? 7 : 1) : ms / per;
    }
    const r = float ? v : Math.trunc(v);
    return r === 0 ? 0 : r; // never -0
  }

  isBefore(other: DateLike, unit?: UnitIn) {
    return unit ? this.endOf(unit).valueOf() < new KitDate(other).valueOf() : this.#t < new KitDate(other).valueOf();
  }
  isAfter(other: DateLike, unit?: UnitIn) {
    return unit ? this.startOf(unit).valueOf() > new KitDate(other).valueOf() : this.#t > new KitDate(other).valueOf();
  }
  isSame(other: DateLike, unit?: UnitIn) {
    if (!unit) return this.#t === new KitDate(other).valueOf();
    const o = new KitDate(other).valueOf();
    return this.startOf(unit).valueOf() <= o && o <= this.endOf(unit).valueOf();
  }
  isSameOrBefore(other: DateLike, unit?: UnitIn) {
    return this.isSame(other, unit) || this.isBefore(other, unit);
  }
  isSameOrAfter(other: DateLike, unit?: UnitIn) {
    return this.isSame(other, unit) || this.isAfter(other, unit);
  }

  format(pattern = "YYYY-MM-DDTHH:mm:ssZ"): string {
    if (!this.isValid()) return "Invalid Date";
    const d = this.#d();
    const Y = d.getFullYear();
    const M = d.getMonth();
    const D = d.getDate();
    const W = d.getDay();
    const H = d.getHours();
    const h = H % 12 || 12;
    const mi = d.getMinutes();
    const s = d.getSeconds();
    const off = -d.getTimezoneOffset();
    const zone = (sep: string) => `${off >= 0 ? "+" : "-"}${pad(Math.floor(Math.abs(off) / 60))}${sep}${pad(Math.abs(off) % 60)}`;
    const T: Record<string, () => string> = {
      YYYY: () => String(Y).padStart(4, "0"),
      YY: () => String(Y).slice(-2),
      MMMM: () => MONTHS[M]!,
      MMM: () => MONTHS[M]!.slice(0, 3),
      MM: () => pad(M + 1),
      M: () => String(M + 1),
      DD: () => pad(D),
      D: () => String(D),
      dddd: () => DAYS[W]!,
      ddd: () => DAYS[W]!.slice(0, 3),
      dd: () => DAYS[W]!.slice(0, 2),
      d: () => String(W),
      HH: () => pad(H),
      H: () => String(H),
      hh: () => pad(h),
      h: () => String(h),
      mm: () => pad(mi),
      m: () => String(mi),
      ss: () => pad(s),
      s: () => String(s),
      SSS: () => pad(d.getMilliseconds(), 3),
      A: () => (H < 12 ? "AM" : "PM"),
      a: () => (H < 12 ? "am" : "pm"),
      ZZ: () => zone(""),
      Z: () => zone(":"),
    };
    return pattern.replace(
      /\[([^\]]+)]|YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|dd|d|HH|H|hh|h|mm|m|ss|s|SSS|A|a|ZZ|Z/g,
      (tok, lit: string | undefined) => (lit !== undefined ? lit : T[tok]!()),
    );
  }
}

function monthDiff(a: KitDate, b: KitDate): number {
  // dayjs's own rule (utils.monthDiff), so a fractional month reads the same: anchored on `a`, by `a`'s day of month
  if (a.date() < b.date()) return -monthDiff(b, a);
  const whole = (b.year() - a.year()) * 12 + (b.month() - a.month());
  const anchor = a.add(whole, "month");
  const before = b.valueOf() - anchor.valueOf() < 0;
  const anchor2 = a.add(whole + (before ? -1 : 1), "month");
  const span = before ? anchor.valueOf() - anchor2.valueOf() : anchor2.valueOf() - anchor.valueOf();
  return +(-(whole + (b.valueOf() - anchor.valueOf()) / span) || 0);
}
function calendarDays(a: KitDate, b: KitDate): number {
  const ms = a.valueOf() - b.valueOf();
  // the zone offset change between the two instants (DST) is taken out, so days stay whole
  const shift = (a.toDate().getTimezoneOffset() - b.toDate().getTimezoneOffset()) * 6e4;
  return (ms - shift) / 864e5;
}

/** A date: `date()` is now; see the file header for the inputs it takes. */
export const date = (v?: DateLike) => new KitDate(v);
/** true when `v` is a KitDate (a value `date()` made); whether `date()` can read a value is `date(v).isValid()` */
export const isDate = (v: unknown): v is KitDate => v instanceof KitDate;
