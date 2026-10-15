// The kit's date() must answer exactly what dayjs answers for the calls it covers.
import { describe, expect, test } from "bun:test";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear.js";
import { date } from "./date.js";
import { configureLocale } from "./locale.js";

dayjs.extend(quarterOfYear);

// deterministic pseudo-random instants across 2019–2031, plus month ends and leap days
let seed = 7;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
const instants = [
  ...Array.from({ length: 400 }, () => Date.UTC(2019, 0, 1) + Math.floor(rnd() * 13 * 365 * 864e5)),
  new Date(2024, 1, 29, 23, 59, 59, 999).getTime(),
  new Date(2026, 0, 31, 0, 0).getTime(),
  new Date(2026, 11, 31, 12, 0).getTime(),
];
const strings = ["2026-10-15", "2024-02-29", "2026-10-15T09:30:00Z", "2026-10-15T09:30:00+05:30", "2026-03-01 14:05", "2026-03-01 14:05:09"];
const PATTERNS = ["DD MMM YYYY", "DD MMM YYYY, hh:mm A", "hh:mm A", "MMM YYYY", "YYYY-MM-DD", "MMM D, YYYY", "DD-MM-YYYY", "DD MMM", "DD MMM, HH:mm", "MMM-YY", "dddd, D MMMM YYYY", "ddd h:mm a", "HH:mm:ss.SSS", "YYYY-MM-DDTHH:mm:ssZ", "[on] DD/MM/YYYY", "M/D/YY H:m:s", "dd d", "ZZ", "[] DD", "[x]YYYY[]"];

describe("date() matches dayjs", () => {
  test("format", () => {
    for (const t of [...instants, ...strings]) for (const p of PATTERNS) expect(date(t).format(p)).toBe(dayjs(t).format(p));
  });
  test("default format, valueOf, getters, daysInMonth", () => {
    for (const t of [...instants, ...strings]) {
      const a = date(t), b = dayjs(t);
      expect(a.format()).toBe(b.format());
      expect(a.valueOf()).toBe(b.valueOf());
      expect([a.year(), a.month(), a.date(), a.day(), a.hour(), a.minute(), a.second()]).toEqual([b.year(), b.month(), b.date(), b.day(), b.hour(), b.minute(), b.second()]);
      expect(a.daysInMonth()).toBe(b.daysInMonth());
    }
  });
  test("add / subtract", () => {
    const units = ["millisecond", "second", "minute", "hour", "day", "week", "month", "year"] as const;
    for (const t of instants) for (const u of units) for (const n of [1, 6, 29, -1, -13]) {
      expect(date(t).add(n, u).valueOf()).toBe(dayjs(t).add(n, u).valueOf());
      expect(date(t).subtract(n, u).valueOf()).toBe(dayjs(t).subtract(n, u).valueOf());
    }
  });
  test("add / subtract: fractions and quarters", () => {
    const units = ["millisecond", "second", "minute", "hour", "day", "week", "month", "quarter", "year"] as const;
    for (const t of instants) for (const u of units) for (const n of [1.5, 0.4, -0.5, -1.5, 2.7, -13.2, 1, -3]) {
      // `as never`: dayjs types "quarter" (the plugin's) in a separate overload from the core units
      expect(date(t).add(n, u).valueOf()).toBe(dayjs(t).add(n, u as never).valueOf());
      expect(date(t).subtract(n, u).valueOf()).toBe(dayjs(t).subtract(n, u as never).valueOf());
    }
  });
  test("YYYY pads to four digits", () => {
    const d = new Date(2000, 5, 15, 10, 0);
    d.setFullYear(99);
    for (const p of ["YYYY-MM-DD", "YY", "DD MMM YYYY"]) expect(date(d.getTime()).format(p)).toBe(dayjs(d.getTime()).format(p));
    expect(date(d.getTime()).format("YYYY")).toBe("0099");
  });
  test("startOf / endOf", () => {
    const units = ["year", "quarter", "month", "week", "day", "hour", "minute", "second"] as const;
    for (const t of instants) for (const u of units) {
      expect(date(t).startOf(u).valueOf()).toBe(dayjs(t).startOf(u).valueOf());
      expect(date(t).endOf(u).valueOf()).toBe(dayjs(t).endOf(u).valueOf());
    }
  });
  test("diff", () => {
    for (let i = 0; i + 1 < instants.length; i++) {
      const a = instants[i]!, b = instants[i + 1]!;
      for (const u of ["millisecond", "second", "minute", "hour", "day", "week", "month", "year"] as const)
        expect(date(a).diff(b, u)).toBe(dayjs(a).diff(b, u));
      expect(date(a).diff(b, "quarter")).toBe(dayjs(a).diff(b, "quarter"));
      expect(date(a).diff(b, "month", true)).toBeCloseTo(dayjs(a).diff(b, "month", true), 6);
    }
  });
  // dayjs answers NaN for some units and 0 for months here; the kit answers NaN for every unit
  test("diff with an invalid date is NaN; equal dates are 0, never -0", () => {
    for (const u of ["millisecond", "day", "month", "year"] as const) {
      expect(date("junk").diff("2026-10-15", u)).toBeNaN();
      expect(date("2026-10-15").diff(null, u)).toBeNaN();
      expect(Object.is(date("2026-10-15").diff("2026-10-15", u), 0)).toBe(true);
      expect(Object.is(date("2026-10-15T10:00").diff("2026-10-15T09:00", "day"), 0)).toBe(true);
    }
  });
  test("a week starts on the locale's weekStartsOn", () => {
    try {
      configureLocale({ weekStartsOn: 1 });
      expect(date("2026-10-15").startOf("week").format("YYYY-MM-DD ddd")).toBe("2026-10-12 Mon"); // a Thursday
      expect(date("2026-10-18").startOf("week").format("YYYY-MM-DD")).toBe("2026-10-12"); // a Sunday
      expect(date("2026-10-15").endOf("week").format("YYYY-MM-DD HH:mm")).toBe("2026-10-18 23:59");
      configureLocale({ weekStartsOn: 6 });
      expect(date("2026-10-15").startOf("week").format("YYYY-MM-DD ddd")).toBe("2026-10-10 Sat");
    } finally {
      configureLocale({ weekStartsOn: 0 });
    }
  });
  test("comparisons", () => {
    for (let i = 0; i + 1 < instants.length; i++) {
      const a = instants[i]!, b = instants[i + 1]!;
      expect(date(a).isBefore(b)).toBe(dayjs(a).isBefore(b));
      expect(date(a).isAfter(b)).toBe(dayjs(a).isAfter(b));
      for (const u of ["day", "month", "year"] as const) {
        expect(date(a).isSame(b, u)).toBe(dayjs(a).isSame(b, u));
        expect(date(a).isSame(a, u)).toBe(true);
        expect(date(a).isBefore(b, u)).toBe(dayjs(a).isBefore(b, u));
        expect(date(a).isAfter(b, u)).toBe(dayjs(a).isAfter(b, u));
      }
    }
  });
  test("invalid input", () => {
    for (const v of [null, "", "junk", "2026-13-45", NaN]) {
      expect(date(v as never).isValid()).toBe(dayjs(v as never).isValid());
      expect(date(v as never).format("DD MMM YYYY")).toBe(dayjs(v as never).format("DD MMM YYYY"));
    }
    expect(date().isValid()).toBe(true);
  });
});
