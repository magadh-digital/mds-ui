/**
 * Tabs for sections of one page or panel ("Details · Logs · Files"), with optional counts. The caller renders the
 * active section. Arrow keys move between tabs (Home / End to the ends), as the ARIA tabs pattern asks. For a 2–4
 * choice filter or a view switch use ToggleGroup / Seg instead.
 */
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { localeNumber } from "../core/locale.js";

export type TabItem<T extends string> = { value: T; label: ReactNode; count?: number; disabled?: boolean };

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: Array<TabItem<T>>;
  value: T;
  onChange: (v: T) => void;
  /** accessible name of the tab list */
  label?: string;
}) {
  const list = useRef<HTMLDivElement>(null);
  const enabled = tabs.filter((t) => !t.disabled);
  const onKey = (e: KeyboardEvent) => {
    const i = enabled.findIndex((t) => t.value === value);
    const to =
      e.key === "ArrowRight" ? enabled[(i + 1) % enabled.length]
      : e.key === "ArrowLeft" ? enabled[(i - 1 + enabled.length) % enabled.length]
      : e.key === "Home" ? enabled[0]
      : e.key === "End" ? enabled[enabled.length - 1]
      : undefined;
    if (!to) return;
    e.preventDefault();
    onChange(to.value);
    list.current?.querySelector<HTMLButtonElement>(`[data-tab="${CSS.escape(to.value)}"]`)?.focus();
  };
  return (
    <div className="mds-tabs" role="tablist" aria-label={label} ref={list} onKeyDown={onKey}>
      {tabs.map((t) => {
        const on = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            data-tab={t.value}
            aria-selected={on}
            tabIndex={on ? 0 : -1}
            disabled={t.disabled}
            className={on ? "active" : ""}
            onClick={() => onChange(t.value)}
          >
            {t.label}
            {t.count != null && <span className="mds-tabs-count mds-num">{localeNumber(t.count)}</span>}
          </button>
        );
      })}
    </div>
  );
}
