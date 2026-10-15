import { Check } from "lucide-react";
import { type KeyboardEvent, type ReactNode } from "react";

/**
 * A view switch (List / Board, Day / Range): one choice always picked. It is a radio group: Tab reaches the picked
 * choice, ← → (and Home / End) pick the next one.
 */
export function Seg<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: Array<{ value: T; label: ReactNode }>;
  value: T;
  onChange: (v: T) => void;
  /** accessible name of the group */
  label?: string;
  className?: string;
}) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = options.findIndex((o) => o.value === value);
    const n = options.length;
    const to =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? (i + 1) % n
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (i - 1 + n) % n
      : e.key === "Home" ? 0
      : e.key === "End" ? n - 1
      : -1;
    if (to < 0 || !n) return;
    e.preventDefault();
    onChange(options[to]!.value);
    (e.currentTarget.children[to] as HTMLElement | undefined)?.focus();
  };
  return (
    <div className={`mds-seg${className ? ` ${className}` : ""}`} role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            type="button"
            key={o.value}
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            className={on ? "active" : ""}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Small pill buttons for one choice; the picked pill is pressed and carries a tick (not colour alone). */
export function Pills<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
  /** accessible name of the group */
  label?: string;
}) {
  return (
    <div className="mds-pills" role="group" aria-label={label}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button type="button" key={o.value} aria-pressed={on} className={on ? "active" : ""} onClick={() => onChange(o.value)}>
            {on && <Check aria-hidden />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
