/**
 * The date control every list uses, after the ERP web's FlexiDateRange: one field that reads like a date, a calendar
 * where a range is two clicks on the same grid, a Day / Range switch and the shortcuts the office reaches for (today,
 * yesterday, 7 and 30 days, this and last month, financial year, all time). Values are YYYY-MM-DD strings kept in the
 * URL; a blank side is open-ended. The calendar is the kit's own (it replaced react-datepicker; same look and keys).
 */
import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import { Calendar, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { date, type KitDate } from "./date";
import { isInsideLayer } from "./floating";

export type RangeValue = { from?: string; to?: string };
export type PresetKey =
  "today" | "yesterday" | "7d" | "30d" | "month" | "last_month" | "fy" | "all";
type Mode = "day" | "range";

const D = "YYYY-MM-DD";
const FMT = "MMM D, YYYY";
export const dateOnly = (v: unknown) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined;
const fmt = (d: Date | string) => date(d).format(FMT);
const iso = (d: KitDate | Date) => date(d).format(D);

/** Indian financial year: 1 Apr to 31 Mar. */
const fyBounds = (now = date()) => {
  const y = now.month() >= 3 ? now.year() : now.year() - 1;
  return {
    from: date(new Date(y, 3, 1)).format(D),
    to: date(new Date(y + 1, 2, 31)).format(D),
  };
};
export const presetRange = (key: PresetKey, now = date()): RangeValue => {
  const t = now.format(D);
  switch (key) {
    case "today":
      return { from: t, to: t };
    case "yesterday": {
      const y = now.subtract(1, "day").format(D);
      return { from: y, to: y };
    }
    case "7d":
      return { from: now.subtract(6, "day").format(D), to: t };
    case "30d":
      return { from: now.subtract(29, "day").format(D), to: t };
    case "month":
      return {
        from: now.startOf("month").format(D),
        to: now.endOf("month").format(D),
      };
    case "last_month": {
      const m = now.subtract(1, "month");
      return {
        from: m.startOf("month").format(D),
        to: m.endOf("month").format(D),
      };
    }
    case "fy":
      return fyBounds(now);
    case "all":
      return {};
  }
};
const PRESETS: Array<{ key: PresetKey; label: string; title: string }> = [
  { key: "today", label: "Today", title: "Today" },
  { key: "yesterday", label: "Yesterday", title: "Yesterday" },
  { key: "7d", label: "7 days", title: "Last 7 days" },
  { key: "30d", label: "30 days", title: "Last 30 days" },
  { key: "month", label: "This month", title: "This month" },
  { key: "last_month", label: "Last month", title: "Last month" },
  { key: "fy", label: "This FY", title: "This financial year (Apr to Mar)" },
  { key: "all", label: "All", title: "No date limit" },
];
const same = (a: RangeValue, b: RangeValue) =>
  (a.from ?? "") === (b.from ?? "") && (a.to ?? "") === (b.to ?? "");
const presetOf = (v: RangeValue, now = date()): PresetKey | null =>
  PRESETS.find((p) => same(v, presetRange(p.key, now)))?.key ?? null;

/** How the field reads a value: the dates, as the ERP page shows them; blank means every date. */
export const rangeLabel = (v: RangeValue): string => {
  if (!v.from && !v.to) return "All time";
  if (v.from && v.to)
    return v.from === v.to ? fmt(v.from) : `${fmt(v.from)} – ${fmt(v.to)}`;
  return v.from ? `${fmt(v.from)} → …` : `… → ${fmt(v.to!)}`;
};


const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** The month grid: six weeks from the Sunday on or before the 1st, as react-datepicker drew it. */
function Month({
  view,
  setView,
  mode,
  value,
  draft,
  hover,
  setHover,
  onPick,
  onEscape,
}: {
  view: KitDate;
  setView: (d: KitDate) => void;
  mode: Mode;
  value: RangeValue;
  draft: KitDate | null;
  hover: KitDate | null;
  setHover: (d: KitDate | null) => void;
  onPick: (d: KitDate) => void;
  onEscape: () => void;
}) {
  const today = iso(date());
  const first = view.startOf("month");
  const start = first.subtract(first.day(), "day");
  const days = Array.from({ length: 42 }, (_, i) => start.add(i, "day"));
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
        <div className="daterange-dows" aria-hidden>
          {DOW.map((d) => (
            <span key={d} className="daterange-dow">
              {d}
            </span>
          ))}
        </div>
      </div>
      <div className="daterange-grid" role="grid" aria-label={view.format("MMMM YYYY")} ref={grid} onKeyDown={onKey}>
        {Array.from({ length: 6 }, (_, w) => (
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
                  onClick={() => onPick(d)}
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

function Trigger({
  label,
  pending,
  empty,
  onClear,
  open,
  ...rest
}: {
  label: string;
  pending?: boolean;
  empty?: boolean;
  onClear?: (e: MouseEvent) => void;
  open: boolean;
} & Record<string, unknown>) {
  return (
    <button
      {...rest}
      type="button"
      className="ui-btn daterange"
      aria-haspopup="dialog"
      aria-expanded={open}
      title="Pick a day, or click a start and an end for a range"
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

/**
 * The control. `allowAll` off means "every date" is not offered (pages that must have a window, like the sheet);
 * `presets` narrows the shortcut row.
 */
export function DateRange({
  value,
  onChange,
  allowAll = true,
  emptyLabel = "All time",
  presets,
}: {
  value: RangeValue;
  onChange: (v: RangeValue) => void;
  allowAll?: boolean;
  emptyLabel?: string;
  presets?: Array<PresetKey>;
}) {
  const [open, setOpenState] = useState(false);
  const [mode, setMode] = useState<Mode>(
    value.from && value.to && value.from !== value.to ? "range" : "day",
  );
  const [draft, setDraft] = useState<KitDate | null>(null); // the first click of a range, until the second
  const [hover, setHover] = useState<KitDate | null>(null);
  const [view, setView] = useState<KitDate>(() => date(value.from).isValid() ? date(value.from).startOf("month") : date().startOf("month"));
  const isSet = !!(value.from || value.to);
  const active = presetOf(value);
  const shown = PRESETS.filter(
    (p) =>
      (allowAll || p.key !== "all") && (!presets || presets.includes(p.key)),
  );
  const close = () => {
    setOpenState(false);
    setDraft(null);
    setHover(null);
  };
  const setOpen = (v: boolean) => {
    if (!v) return close();
    // open on the picked month (or this month)
    setView(date(value.from).isValid() ? date(value.from).startOf("month") : date().startOf("month"));
    setDraft(null);
    setHover(null);
    setOpenState(true);
  };
  const commit = (v: RangeValue) => {
    onChange(v);
    close();
  };
  const commitRange = (a: KitDate, b: KitDate) => {
    const [s, e] = a.valueOf() <= b.valueOf() ? [a, b] : [b, a];
    commit({ from: iso(s), to: iso(e) });
  };
  const onPick = (d: KitDate) => {
    if (mode === "day") return commit({ from: iso(d), to: iso(d) });
    if (draft) return commitRange(draft, d);
    setDraft(d);
    setHover(null);
  };
  const label = draft
    ? hover
      ? `${fmt(draft.valueOf() <= hover.valueOf() ? draft.toDate() : hover.toDate())} – ${fmt(draft.valueOf() <= hover.valueOf() ? hover.toDate() : draft.toDate())}`
      : `${fmt(draft.toDate())} → …`
    : isSet
      ? rangeLabel(value)
      : emptyLabel;

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [offset(10), flip({ padding: 8 }), shift({ padding: 8 })],
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useDismiss(context, { outsidePress: (e) => !isInsideLayer(e.target), bubbles: { escapeKey: false } }),
  ]);

  const footer = (
    <div className="daterange-foot">
      <div className="ui-seg" role="tablist" style={{ alignSelf: "stretch" }}>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "day"}
          className={mode === "day" ? "active" : ""}
          onClick={() => {
            setMode("day");
            setDraft(null);
            setHover(null);
          }}
        >
          Day
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "range"}
          className={mode === "range" ? "active" : ""}
          onClick={() => setMode("range")}
        >
          Range
        </button>
      </div>
      <div
        className="daterange-shortcuts"
        // two even rows whatever the number of shortcuts; one row when there are only a few
        style={{
          gridTemplateColumns: `repeat(${shown.length > 3 ? Math.ceil(shown.length / 2) : shown.length}, minmax(0, 1fr))`,
        }}
      >
        {shown.map((p) => (
          <button
            key={p.key}
            type="button"
            title={p.title}
            className={active === p.key ? "active" : ""}
            onClick={() => {
              if (p.key !== "today" && p.key !== "yesterday" && p.key !== "all")
                setMode("range");
              commit(presetRange(p.key));
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
  return (
    <div className="daterange-root">
      <div className="daterange-wrap">
        <Trigger
          ref={refs.setReference}
          label={label}
          pending={!!draft}
          empty={!isSet && !draft}
          open={open}
          onClear={allowAll ? () => commit({}) : undefined}
          // a second click on the field closes the calendar
          {...getReferenceProps({ onClick: () => setOpen(!open) })}
        />
      </div>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} initialFocus={-1} returnFocus>
            <div
              ref={refs.setFloating}
              className="daterange-pop"
              style={{ ...floatingStyles, zIndex: 2000 }}
              {...getFloatingProps()}
            >
              <div className="daterange-cal" role="dialog" aria-label="Pick dates">
                <Month
                  view={view}
                  setView={setView}
                  mode={mode}
                  value={value}
                  draft={draft}
                  hover={hover}
                  setHover={setHover}
                  onPick={onPick}
                  onEscape={close}
                />
                {footer}
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}
