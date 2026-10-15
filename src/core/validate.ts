import { useCallback, useState } from "react";
import { date } from "./date.js";
import { localeNumber } from "./locale.js";

/**
 * Form checks that run before Send, so the form says what is wrong per field while the person is still on it; the
 * service's field list is the safety net and lands on the same fields.
 * Pure: a rule takes a value and gives a sentence or null.
 */

/** An error that names the refused fields (an API's 400 with a field list); any error with a `fields` array qualifies. */
type FieldsError = { fields: Array<{ field: string; message: string }> };
const hasFields = (e: unknown): e is FieldsError =>
  !!e && typeof e === "object" && Array.isArray((e as FieldsError).fields);

export type FieldErrors = Record<string, string>;
export type Rule = (v: string | number | null | undefined) => string | null;

const blank = (v: unknown) =>
  v == null || (typeof v === "string" && v.trim() === "");
const num = (v: unknown) => (blank(v) ? null : Number(v));
const fmt = (n: number) => localeNumber(n);

export const required =
  (what = "this"): Rule =>
  (v) =>
    blank(v) ? `${what} is required` : null;
/** a number in [min, max] (`unit` is named in the sentence); `integer` wants a whole number, `positive` more than 0 */
export const numberIn =
  (
    o: {
      min?: number;
      max?: number;
      unit?: string;
      integer?: boolean;
      positive?: boolean;
    } = {},
  ): Rule =>
  (v) => {
    if (blank(v)) return null;
    const n = num(v);
    if (n == null || !Number.isFinite(n)) return "must be a number";
    const u = o.unit ? ` ${o.unit}` : "";
    if (o.positive && n <= 0 && !(o.min != null && o.min > 0)) return "must be more than 0";
    if (o.min != null && n < o.min) return `at least ${fmt(o.min)}${u}`;
    if (o.max != null && n > o.max) return `at most ${fmt(o.max)}${u}`;
    if (o.integer && !Number.isInteger(n)) return "must be a whole number";
    return null;
  };
/** a real calendar day written YYYY-MM-DD (2026-02-30 and 2026-13-45 are refused) */
export const dateLike: Rule = (v) => {
  if (blank(v)) return null;
  const s = String(v).trim();
  // a date that rolls over (30 Feb reads as 2 Mar) does not print back as itself
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && date(s).format("YYYY-MM-DD") === s ? null : "must be a date like 2026-09-13";
};
export const digits =
  (n: number, what = "number"): Rule =>
  (v) =>
    blank(v) || new RegExp(`^\\d{${n}}$`).test(String(v).trim())
      ? null
      : `${what} must be ${n} digits`;
export const maxLen =
  (n: number): Rule =>
  (v) =>
    blank(v) || String(v).length <= n ? null : `at most ${n} characters`;
export const all =
  (...rules: Array<Rule>): Rule =>
  (v) =>
    rules.map((r) => r(v)).find((m) => m != null) ?? null;

/** Runs one rule per field and keeps the failures; `{}` means the form may be sent. */
export function check(
  values: Record<string, unknown>,
  rules: Record<string, Rule>,
): FieldErrors {
  const out: FieldErrors = {};
  for (const [k, rule] of Object.entries(rules)) {
    const m = rule(values[k] as string | number | null | undefined);
    if (m) out[k] = m;
  }
  return out;
}

/**
 * The form's error state: `set(check(...))` before sending, `fromError(e)` when the service refuses (its fields land
 * under the same keys; a nested `lines.0.qty` lands under both the full path and its leaf), `clear()` on success.
 * `first` is the sentence a toast or the Send button can show.
 */
export function useFormErrors() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [general, setGeneral] = useState<string | null>(null);
  const set = useCallback((e: FieldErrors) => {
    setErrors(e);
    setGeneral(null);
  }, []);
  const clear = useCallback(() => {
    setErrors({});
    setGeneral(null);
  }, []);
  const fromError = useCallback((e: unknown) => {
    if (hasFields(e) && e.fields.length) {
      const next: FieldErrors = {};
      for (const f of e.fields) {
        next[f.field] = f.message;
        const leaf = f.field.split(".").pop()!;
        if (!next[leaf]) next[leaf] = f.message;
      }
      setErrors(next);
      setGeneral(null);
    } else {
      setGeneral(e instanceof Error ? e.message : "Something went wrong");
    }
  }, []);
  const has = Object.keys(errors).length > 0;
  const first = has ? `${Object.values(errors)[0]}` : general;
  return {
    errors,
    general,
    set,
    clear,
    fromError,
    has,
    first,
    at: (k: string) => errors[k],
  };
}
