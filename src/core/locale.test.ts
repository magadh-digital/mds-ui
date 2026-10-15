import { expect, test } from "bun:test";
import { configureLocale, kitLocale, localeNumber } from "./locale.js";

test("configureLocale merges, and a change of value is what counts", () => {
  const before = { ...kitLocale() };
  configureLocale({ locale: "en-US" });
  expect(kitLocale().locale).toBe("en-US");
  expect(kitLocale().currency).toBe(before.currency);
  expect(localeNumber(1234567)).toBe("1,234,567");
  const same = kitLocale();
  configureLocale({ locale: "en-US" }); // nothing changes: the same object stays (subscribers are not woken)
  expect(kitLocale()).toBe(same);
  configureLocale(before);
  expect(localeNumber(1234567)).toBe("12,34,567");
});
