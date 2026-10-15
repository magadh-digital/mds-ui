/**
 * The calendar the date controls share: one month grid (CalendarMonth), the field that opens it (DateTrigger), and the
 * YYYY-MM-DD helper. DateRange picks a day or a range with it, DateInput a single day.
 */
import { Calendar, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { date, type KitDate } from "../core/date.js";

/** a day as the controls store it: "2026-10-15" */
export const iso = (d: KitDate | Date) => date(d).format("YYYY-MM-DD");

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** The month grid: the weeks from the Sunday on or before the 1st to the Saturday on or after the last day. */
export function CalendarMonth({
  view,
  setView,
  mode,
  value,
  draft,
  hover,
  setHover,
  onPick,
  onEscape,
  isDisabled,
}: {
  view: KitDate;
  setView: (d: KitDate) => void;
  mode: "day" | "range";
  value: { from?: string; to?: string };
  draft: KitDate | null;
  hover: KitDate | null;
  setHover: (d: KitDate | null) => void;
  onPick: (d: KitDate) => void;
  onEscape: () => void;
  /** days that cannot be picked (before `min`, after `max`): greyed and skipped */
  isDisabled?: (iso: string) => boolean;
}) {
  const today = iso(date());
  const first = view.startOf("month");
  const start = first.subtract(first.day(), "day");
  // only the weeks this month needs (five for most months, four or six for some), as react-datepicker showed
  const weeks = Math.ceil((first.day() + first.daysInMonth()) / 7);
  const days = Array.from({ length: weeks * 7 }, (_, i) => start.add(i, "day"));
  // the keyboard's day: the picked day in view, else today in view, else the 1st
  const [focus, setFocus] = useState<string>(() => {
    const pickIn = value.from && date(value.from).isSame(view, "month") ? value.from : null;
    return pickIn ?? (date().isSame(view, "month") ? today : iso(first));
  });
  const grid = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    grid.current?.querySelector<HTMLButtonElement>(`[data-day="${focus}"]`)?.focus();
  }, [focus, view]);

  // what is lit: a range being picked (first click + hover), or the saved value
  const [lo, hi] = (() => {
    if (draft) {
      const other = hover ?? draft;
      return draft.valueOf() <= other.valueOf() ? [iso(draft), iso(other)] : [iso(other), iso(draft)];
    }
    if (mode === "day") return [value.from ?? null, value.from ?? null];
    return [value.from ?? null, value.to ?? value.from ?? null];
  })();

  const go = (d: KitDate) => {
    moved.current = true;
    if (!d.isSame(view, "month")) setView(d.startOf("month"));
    setFocus(iso(d));
  };
  const onKey = (e: KeyboardEvent) => {
    const f = date(focus);
    const step: Record<string, () => KitDate> = {
      ArrowLeft: () => f.subtract(1, "day"),
      ArrowRight: () => f.add(1, "day"),
      ArrowUp: () => f.subtract(1, "week"),
      ArrowDown: () => f.add(1, "week"),
      PageUp: () => f.subtract(1, e.shiftKey ? "year" : "month"),
      PageDown: () => f.add(1, e.shiftKey ? "year" : "month"),
      Home: () => f.subtract(f.day(), "day"),
      End: () => f.add(6 - f.day(), "day"),
    };
    if (step[e.key]) {
      e.preventDefault();
      const d = step[e.key]!();
      go(d);
      if (draft) setHover(d);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onEscape();
    }
  };

  return (
    <div className="daterange-month">
      <div className="daterange-head">
        <button
          type="button"
          className="daterange-nav prev"
          aria-label="Previous month"
          onClick={() => setView(view.subtract(1, "month"))}
        />
        <div className="daterange-title" aria-live="polite">
          {view.format("MMMM YYYY")}
        </div>
        <button
          type="button"
          className="daterange-nav next"
          aria-label="Next month"
          onClick={() => setView(view.add(1, "month"))}
        />
      </div>
      <div className="daterange-dows" aria-hidden>
        {DOW.map((d) => (
          <span key={d} className="daterange-dow">
            {d}
          </span>
        ))}
      </div>
      <div className="daterange-grid" role="grid" aria-label={view.format("MMMM YYYY")} ref={grid} onKeyDown={onKey}>
        {Array.from({ length: weeks }, (_, w) => (
          <div key={w} role="row" className="daterange-week">
            {days.slice(w * 7, w * 7 + 7).map((d) => {
              const k = iso(d);
              const inRange = lo != null && hi != null && k >= lo && k <= hi;
              const edge = k === lo || k === hi;
              const cls = [
                "daterange-day",
                !d.isSame(view, "month") && "outside",
                k === today && "today",
                inRange && "in-range",
                edge && "edge",
                k === focus && "kb",
                isDisabled?.(k) && "disabled",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={k}
                  type="button"
                  role="gridcell"
                  className={cls}
                  data-day={k}
                  tabIndex={k === focus ? 0 : -1}
                  aria-selected={edge || undefined}
                  aria-current={k === today ? "date" : undefined}
                  aria-label={d.format("dddd, D MMMM YYYY")}
                  onMouseEnter={() => draft && setHover(d)}
                  onFocus={() => setFocus(k)}
                  disabled={isDisabled?.(k)}
                  aria-disabled={isDisabled?.(k) || undefined}
                  onClick={() => !isDisabled?.(k) && onPick(d)}
                >
                  {d.date()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DateTrigger({
  label,
  pending,
  empty,
  onClear,
  open,
  hint = "Pick a day, or click a start and an end for a range",
  ...rest
}: {
  label: string;
  pending?: boolean;
  empty?: boolean;
  onClear?: (e: MouseEvent) => void;
  open: boolean;
  /** the field's hover text */
  hint?: string;
} & Record<string, unknown>) {
  return (
    <button
      {...rest}
      type="button"
      className="ui-btn daterange"
      aria-haspopup="dialog"
      aria-expanded={open}
      title={hint}
      style={{
        width: "100%",
        justifyContent: "flex-start",
        borderColor: "var(--c-border)",
        color: empty ? "var(--c-muted)" : "var(--c-text)",
        fontWeight: empty || pending ? 400 : 600,
        fontStyle: pending ? "italic" : "normal",
      }}
    >
      <Calendar style={{ width: 14, height: 14, color: "var(--c-muted)", flexShrink: 0 }} />
      <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
      {onClear && !empty && (
        <span
          role="button"
          aria-label="Clear date"
          title="Clear"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClear(e);
          }}
          style={{ display: "inline-grid", placeItems: "center", color: "var(--c-muted)", borderRadius: 999 }}
        >
          <X style={{ width: 12, height: 12 }} />
        </span>
      )}
    </button>
  );
}

