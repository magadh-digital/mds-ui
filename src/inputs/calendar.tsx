/**
 * The calendar the date controls share: one month grid (CalendarMonth), the field that opens it (DateTrigger), and the
 * YYYY-MM-DD helper. DateRange picks a day or a range with it, DateInput a single day. The week starts on the kit
 * locale's `weekStartsOn`; month and weekday names come from Intl in the kit's locale.
 */
import { Calendar, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type Ref } from "react";
import { date, type KitDate } from "../core/date.js";
import { kitLocale } from "../core/locale.js";

/** @internal a day as the controls store it: "2026-10-15" */
export const iso = (d: KitDate | Date) => date(d).format("YYYY-MM-DD");

/** the Intl formatters for one locale: the title, the weekday heads (Sunday first) and a day's spoken name */
function names(locale: string) {
  const title = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const long = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const short = new Intl.DateTimeFormat(locale, { weekday: "short" });
  // 1 Jan 2023 was a Sunday; English heads read two letters ("Su Mo Tu"), as the grid always showed
  const dows = Array.from({ length: 7 }, (_, i) => {
    const n = short.format(new Date(2023, 0, 1 + i));
    return /^en\b/i.test(locale) ? n.slice(0, 2) : n;
  });
  return { title: (d: KitDate) => title.format(d.toDate()), long: (d: KitDate) => long.format(d.toDate()), dows };
}

/**
 * @internal
 * The month grid: the weeks from the week start on or before the 1st to the week end on or after the last day.
 * Days outside `min` / `max` are greyed and cannot be picked (aria-disabled, so the keyboard still reads them), and
 * the arrow keys stop at those bounds.
 */
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
  min,
  max,
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
  /** the earliest day that can be picked ("YYYY-MM-DD") */
  min?: string;
  /** the latest day that can be picked ("YYYY-MM-DD") */
  max?: string;
}) {
  const { locale, weekStartsOn } = kitLocale();
  const t = useMemo(() => names(locale), [locale]);
  const today = iso(date());
  const first = view.startOf("month");
  const lead = (first.day() - weekStartsOn + 7) % 7;
  const start = first.subtract(lead, "day");
  // only the weeks this month needs (five for most months, four or six for some), as react-datepicker showed
  const weeks = Math.ceil((lead + first.daysInMonth()) / 7);
  const days = Array.from({ length: weeks * 7 }, (_, i) => start.add(i, "day"));
  const out = (k: string) => (!!min && k < min) || (!!max && k > max);
  const clamp = (d: KitDate) => {
    const k = iso(d);
    if (min && k < min) return date(min);
    if (max && k > max) return date(max);
    return d;
  };
  // the keyboard's day: the picked day in view, else today in view, else the 1st
  const [focusState, setFocus] = useState<string>(() => {
    const pickIn = value.from && date(value.from).isSame(view, "month") ? value.from : null;
    return pickIn ?? (date().isSame(view, "month") ? today : iso(first));
  });
  // Prev / Next (or a new view from outside) moved the month: the keyboard's day follows into it, on the same date
  // where the month has one, so one cell is always reachable by Tab
  const focus = date(focusState).isSame(view, "month")
    ? focusState
    : iso(first.add(Math.min(date(focusState).date(), first.daysInMonth()) - 1, "day"));
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
    const back = (f.day() - weekStartsOn + 7) % 7; // days since the week's first day
    const step: Record<string, () => KitDate> = {
      ArrowLeft: () => f.subtract(1, "day"),
      ArrowRight: () => f.add(1, "day"),
      ArrowUp: () => f.subtract(1, "week"),
      ArrowDown: () => f.add(1, "week"),
      PageUp: () => f.subtract(1, e.shiftKey ? "year" : "month"),
      PageDown: () => f.add(1, e.shiftKey ? "year" : "month"),
      Home: () => f.subtract(back, "day"),
      End: () => f.add(6 - back, "day"),
    };
    if (step[e.key]) {
      e.preventDefault();
      const d = clamp(step[e.key]!());
      go(d);
      if (draft) setHover(d);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onEscape();
    }
  };

  const title = t.title(view);
  return (
    <div className="mds-daterange-month">
      <div className="mds-daterange-head">
        <button type="button" className="mds-daterange-nav prev" aria-label="Previous month" onClick={() => setView(view.subtract(1, "month"))} />
        <div className="mds-daterange-title" aria-live="polite">
          {title}
        </div>
        <button type="button" className="mds-daterange-nav next" aria-label="Next month" onClick={() => setView(view.add(1, "month"))} />
      </div>
      <div className="mds-daterange-dows" aria-hidden>
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} className="mds-daterange-dow">
            {t.dows[(weekStartsOn + i) % 7]}
          </span>
        ))}
      </div>
      <div className="mds-daterange-grid" role="grid" aria-label={title} ref={grid} onKeyDown={onKey}>
        {Array.from({ length: weeks }, (_, w) => (
          <div key={w} role="row" className="mds-daterange-week">
            {days.slice(w * 7, w * 7 + 7).map((d) => {
              const k = iso(d);
              const inRange = lo != null && hi != null && k >= lo && k <= hi;
              const edge = k === lo || k === hi;
              const off = out(k);
              const cls = [
                "mds-daterange-day",
                !d.isSame(view, "month") && "outside",
                k === today && "today",
                inRange && "in-range",
                edge && "edge",
                k === focus && "kb",
                off && "disabled",
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
                  aria-label={t.long(d)}
                  aria-disabled={off || undefined}
                  onMouseEnter={() => draft && !off && setHover(d)}
                  onFocus={() => setFocus(k)}
                  onClick={() => !off && onPick(d)}
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

const setRef = <T,>(ref: Ref<T> | undefined, el: T | null) => {
  if (typeof ref === "function") ref(el);
  else if (ref) (ref as { current: T | null }).current = el;
};

/**
 * @internal
 * The field that opens the calendar, with the clear × as a sibling button (not inside it). `name` is the field's
 * accessible name (read with the date: "Bill date, Oct 15, 2026"); `labelledBy` names it by a visible label instead.
 */
export function DateTrigger({
  ref,
  label,
  pending,
  empty,
  onClear,
  open,
  hint = "Pick a day, or click a start and an end for a range",
  name,
  labelledBy,
  ...rest
}: {
  ref?: Ref<HTMLButtonElement>;
  label: string;
  pending?: boolean;
  empty?: boolean;
  onClear?: (e: MouseEvent) => void;
  open: boolean;
  /** the field's hover text */
  hint?: string;
  /** the accessible name, read before the date */
  name?: string;
  /** the id of a visible label that names the field, read before the date */
  labelledBy?: string;
} & Record<string, unknown>) {
  const textId = useId();
  const own = useRef<HTMLButtonElement | null>(null);
  const clearable = !!onClear && !empty;
  return (
    <>
      <button
        {...rest}
        ref={(el) => {
          own.current = el;
          setRef(ref, el);
        }}
        type="button"
        className="mds-btn daterange"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={name ? `${name}, ${label}` : undefined}
        aria-labelledby={!name && labelledBy ? `${labelledBy} ${textId}` : undefined}
        title={hint}
        style={{
          width: "100%",
          justifyContent: "flex-start",
          borderColor: "var(--mds-c-border)",
          color: empty ? "var(--mds-c-muted)" : "var(--mds-c-text)",
          fontWeight: empty || pending ? 400 : 600,
          fontStyle: pending ? "italic" : "normal",
          paddingRight: clearable ? 28 : undefined,
        }}
      >
        <Calendar aria-hidden style={{ width: 14, height: 14, color: "var(--mds-c-muted)", flexShrink: 0 }} />
        <span id={textId} style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </span>
      </button>
      {clearable && (
        <button
          type="button"
          className="mds-daterange-clear"
          aria-label={name ? `Clear ${name}` : "Clear date"}
          title="Clear"
          onClick={(e) => {
            onClear!(e);
            own.current?.focus();
          }}
        >
          <X aria-hidden />
        </button>
      )}
    </>
  );
}
