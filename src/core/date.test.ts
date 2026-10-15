// The kit's date() must answer exactly what dayjs answered for every call the consoles make.
import { describe, expect, test } from "bun:test";
import dayjs from "dayjs";
import { date } from "./date.js";

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
const PATTERNS = ["DD MMM YYYY", "DD MMM YYYY, hh:mm A", "hh:mm A", "MMM YYYY", "YYYY-MM-DD", "MMM D, YYYY", "DD-MM-YYYY", "DD MMM", "DD MMM, HH:mm", "MMM-YY", "dddd, D MMMM YYYY", "ddd h:mm a", "HH:mm:ss.SSS", "YYYY-MM-DDTHH:mm:ssZ", "[on] DD/MM/YYYY", "M/D/YY H:m:s", "dd d", "ZZ"];

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
  test("startOf / endOf", () => {
    const units = ["year", "month", "week", "day", "hour", "minute", "second"] as const;
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
      expect(date(a).diff(b, "month", true)).toBeCloseTo(dayjs(a).diff(b, "month", true), 6);
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
