import { useEffect, useLayoutEffect } from "react";

/**
 * Saved choices (column picks and widths, page order, appearance) are read AFTER mount, never in a `useState`
 * initialiser, so a server render and the first client render agree. The read runs in a layout effect in the browser,
 * which lands before the first paint (no flash of the defaults), and in a plain effect on the server (no warning).
 */

/** @internal useLayoutEffect in the browser, useEffect on the server */
export const useClientLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** @internal a plain object (not an array, not null) */
export const isRecord = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

/** @internal the strings of an array; anything else is [] */
export const stringList = (v: unknown): Array<string> =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

/** @internal the parsed JSON under `key`, or undefined when missing, unreadable or storage is blocked */
export function readSaved(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? undefined : (JSON.parse(raw) as unknown);
  } catch {
    return undefined;
  }
}

/** @internal saves `value` as JSON under `key`; `undefined` removes it. A private window just keeps it for the visit. */
export function writeSaved(key: string, value: unknown) {
  try {
    if (value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or full storage: the choice lasts this visit */
  }
}
