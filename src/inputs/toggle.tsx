import { type ReactNode } from "react";

export type ToggleOption<T extends string> = {
  value: T;
  label: ReactNode;
  /** shown after the label, muted: how many rows have this value */
  count?: number;
  title?: string;
};
/**
 * A toggle button group for a filter with 2–4 choices (status, yes/no, type): every choice visible, one click to
 * pick. Nothing picked means no filter (all rows); clicking the picked choice again clears it. There is no "All"
 * button. Longer lists use a select or an Autocomplete instead.
 */
export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<ToggleOption<T>>;
  /** the picked choice, or "" for none (no filter) */
  value: T | "";
  onChange: (v: T | "") => void;
  /** accessible name of the group */
  label?: string;
}) {
  return (
    <div className="ui-seg ui-toggle" role="group" aria-label={label}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            className={on ? "active" : ""}
            title={o.title ?? (on ? "Click again to show all" : undefined)}
            onClick={() => onChange(on ? "" : o.value)}
          >
            {o.label}
            {o.count != null && (
              <span className="ui-toggle-count ui-num">
                {o.count.toLocaleString("en-IN")}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
