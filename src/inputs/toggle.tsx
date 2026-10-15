import { type ReactNode } from "react";
import { localeNumber } from "../core/locale.js";

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
 *
 * `multiple` picks several (the dashboard's product chips): `value` is the picked values in the options' order.
 * `clearable={false}` keeps one choice always picked (a form field, not a filter).
 */
type Common<T extends string> = {
  options: Array<ToggleOption<T>>;
  /** accessible name of the group */
  label?: string;
};
type Single<T extends string> = Common<T> & {
  multiple?: false;
  /** the picked choice, or "" for none (no filter) */
  value: T | "";
  onChange: (v: T | "") => void;
  /** a second click on the picked choice clears it (default); off for a field that must keep a value */
  clearable?: boolean;
};
type Multiple<T extends string> = Common<T> & {
  multiple: true;
  /** the picked choices; none picked means no filter */
  value: Array<T>;
  onChange: (v: Array<T>) => void;
};
export function ToggleGroup<T extends string>(props: Single<T> | Multiple<T>) {
  const { options, label } = props;
  const isOn = (v: T) => (props.multiple ? props.value.includes(v) : props.value === v);
  const press = (v: T) => {
    if (props.multiple) {
      const next = isOn(v) ? props.value.filter((x) => x !== v) : [...props.value, v];
      // keep the options' order, whatever the click order
      props.onChange(options.map((o) => o.value).filter((x) => next.includes(x)));
    } else if (isOn(v)) {
      if (props.clearable !== false) props.onChange("");
    } else props.onChange(v);
  };
  const hint = (on: boolean) =>
    props.multiple ? undefined : on && props.clearable !== false ? "Click again to show all" : undefined;
  return (
    <div className={`mds-seg mds-toggle${props.multiple ? " multiple" : ""}`} role="group" aria-label={label}>
      {options.map((o) => {
        const on = isOn(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            className={on ? "active" : ""}
            title={o.title ?? hint(on)}
            onClick={() => press(o.value)}
          >
            {o.label}
            {o.count != null && (
              <span className="mds-toggle-count mds-num">
                {localeNumber(o.count)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
