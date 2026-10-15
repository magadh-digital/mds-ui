/**
 * The kit's locale: how numbers, money and dates read, which day a week starts on, and where the financial year
 * starts. One setting for the whole app, usually set before the first render (UIProvider's `locale` prop does it);
 * changing it later renders the kit's number and date components again (`useKitLocale` does the same for yours):
 *
 *   configureLocale({ locale: "en-US", currency: "USD", weekStartsOn: 1, fyStartMonth: 0 });
 *
 * The defaults read the Indian way: en-IN grouping (1,23,456), rupees, weeks from Sunday, the year from April.
 */
import { useSyncExternalStore } from "react";

export type KitLocale = {
  /** a BCP 47 tag for Intl number and date formatting */
  locale: string;
  /** an ISO 4217 code for money() */
  currency: string;
  /** the first day of a calendar week: 0 = Sunday … 6 = Saturday */
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** the financial year's first month: 0 = January … 11 = December (3 = April) */
  fyStartMonth: number;
};

const DEFAULTS: KitLocale = { locale: "en-IN", currency: "INR", weekStartsOn: 0, fyStartMonth: 3 };
let current: KitLocale = { ...DEFAULTS };
const listeners = new Set<() => void>();

/** Sets the locale; the kit's components that show numbers or dates render again with it. */
export function configureLocale(l: Partial<KitLocale>) {
  const next = { ...current, ...l };
  if ((Object.keys(next) as Array<keyof KitLocale>).every((k) => next[k] === current[k])) return;
  current = next;
  listeners.forEach((fn) => fn());
}
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
/**
 * The locale in force, rendering the component again when `configureLocale` changes it. The kit's own components
 * use it; call it in a component of yours that formats with `num()` / `money()` / `date()` if the locale can change
 * while the app runs.
 */
export const useKitLocale = (): Readonly<KitLocale> => useSyncExternalStore(subscribe, kitLocale, kitLocale);
/** the locale in force */
export const kitLocale = (): Readonly<KitLocale> => current;
/** a number in the kit's locale ("1,23,456" with en-IN) */
export const localeNumber = (n: number, opts?: Intl.NumberFormatOptions) => n.toLocaleString(current.locale, opts);
