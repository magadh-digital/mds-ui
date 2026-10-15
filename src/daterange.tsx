/**
 * The date control every list uses, after the ERP web's FlexiDateRange (react-datepicker underneath, as there): one
 * field that reads like a date, a calendar where a range is two clicks on the same grid, a Day / Range switch and the
 * shortcuts the office reaches for (today, yesterday, 7 and 30 days, this and last month, financial year, all time).
 * Values are YYYY-MM-DD strings kept in the URL; a blank side is open-ended.
 */
import dayjs from "dayjs";
import { Calendar, X } from "lucide-react";
import { forwardRef, useRef, useState, type MouseEvent } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export type RangeValue = { from?: string; to?: string };
export type PresetKey =
  "today" | "yesterday" | "7d" | "30d" | "month" | "last_month" | "fy" | "all";
type Mode = "day" | "range";

const D = "YYYY-MM-DD";
const FMT = "MMM D, YYYY";
export const dateOnly = (v: unknown) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined;
const toDate = (v?: string) => (v ? dayjs(v).startOf("day").toDate() : null);
const fmt = (d: Date | string) => dayjs(d).format(FMT);

/** Indian financial year: 1 Apr to 31 Mar. */
const fyBounds = (now = dayjs()) => {
  const y = now.month() >= 3 ? now.year() : now.year() - 1;
  return {
    from: dayjs(new Date(y, 3, 1)).format(D),
    to: dayjs(new Date(y + 1, 2, 31)).format(D),
  };
};
export const presetRange = (key: PresetKey, now = dayjs()): RangeValue => {
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
const presetOf = (v: RangeValue, now = dayjs()): PresetKey | null =>
  PRESETS.find((p) => same(v, presetRange(p.key, now)))?.key ?? null;

/** How the field reads a value: the dates, as the ERP page shows them; blank means every date. */
export const rangeLabel = (v: RangeValue): string => {
  if (!v.from && !v.to) return "All time";
  if (v.from && v.to)
    return v.from === v.to ? fmt(v.from) : `${fmt(v.from)} – ${fmt(v.to)}`;
  return v.from ? `${fmt(v.from)} → …` : `… → ${fmt(v.to!)}`;
};

// the library hands its own className (the click-outside ignore marker) and handlers to the custom input; both must be kept
const Trigger = forwardRef<
  HTMLButtonElement,
  {
    label: string;
    pending?: boolean;
    empty?: boolean;
    onClick?: () => void;
    onClear?: (e: MouseEvent) => void;
    className?: string;
  }
>(function Trigger(
  { label, pending, empty, onClick, onClear, className },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={`ui-btn daterange ${className ?? ""}`}
      onClick={onClick}
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
      <Calendar
        style={{
          width: 14,
          height: 14,
          color: "var(--c-muted)",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          flex: 1,
          textAlign: "left",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
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
          style={{
            display: "inline-grid",
            placeItems: "center",
            color: "var(--c-muted)",
            borderRadius: 999,
          }}
        >
          <X style={{ width: 12, height: 12 }} />
        </span>
      )}
    </button>
  );
});

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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pressedOwnButton = useRef(false);
  const [mode, setMode] = useState<Mode>(
    value.from && value.to && value.from !== value.to ? "range" : "day",
  );
  const [draft, setDraft] = useState<Date | null>(null); // the first click of a range, until the second
  const [hover, setHover] = useState<Date | null>(null);
  const isSet = !!(value.from || value.to);
  const active = presetOf(value);
  const shown = PRESETS.filter(
    (p) =>
      (allowAll || p.key !== "all") && (!presets || presets.includes(p.key)),
  );
  const close = () => {
    setOpen(false);
    setDraft(null);
    setHover(null);
  };
  const commit = (v: RangeValue) => {
    onChange(v);
    close();
  };
  const commitRange = (a: Date, b: Date) => {
    const [s, e] = a <= b ? [a, b] : [b, a];
    commit({ from: dayjs(s).format(D), to: dayjs(e).format(D) });
  };
  const label = draft
    ? hover
      ? `${fmt(draft <= hover ? draft : hover)} – ${fmt(draft <= hover ? hover : draft)}`
      : `${fmt(draft)} → …`
    : isSet
      ? rangeLabel(value)
      : emptyLabel;

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
  const shared = {
    open,
    // the button toggles: a second click on it closes the calendar
    onInputClick: () => {
      pressedOwnButton.current = false;
      setDraft(null);
      setHover(null);
      setOpen((o) => !o);
    },
    // a press on this picker's own button is not "outside": the button's click toggles instead
    onClickOutside: (e: { target: EventTarget | null }) => {
      if (rootRef.current?.contains(e.target as Node)) {
        pressedOwnButton.current = true;
        return;
      }
      close();
    },
    // the library closes on that same press; skip it so the button's click (onInputClick) decides
    onCalendarClose: () => {
      if (pressedOwnButton.current) return;
      close();
    },
    customInput: (
      <Trigger
        label={label}
        pending={!!draft}
        empty={!isSet && !draft}
        onClear={allowAll ? () => commit({}) : undefined}
      />
    ),
    wrapperClassName: "daterange-wrap",
    calendarClassName: "daterange-cal",
    portalId: "daterange-portal",
    showPopperArrow: false,
    dateFormat: "dd/MM/yyyy",
  };
  return (
    <div className="daterange-root" ref={rootRef}>
      {mode === "day" ? (
        <DatePicker
          {...shared}
          selected={toDate(value.from)}
          onChange={(d: Date | null) =>
            d && commit({ from: dayjs(d).format(D), to: dayjs(d).format(D) })
          }
          shouldCloseOnSelect
        >
          {footer}
        </DatePicker>
      ) : (
        <DatePicker
          {...shared}
          selectsRange
          swapRange
          shouldCloseOnSelect={false}
          startDate={draft ?? toDate(value.from)}
          endDate={draft ? null : toDate(value.to)}
          onDayMouseEnter={(d: Date) => {
            if (draft) setHover(d);
          }}
          onChange={(dates: [Date | null, Date | null]) => {
            const [start, end] = dates;
            if (!start) return;
            if (draft && end) return commitRange(draft, end);
            if (draft && !end) return commitRange(draft, start); // the library hands back the second click as a new start when it precedes the first
            setDraft(start);
            setHover(null);
          }}
        >
          {footer}
        </DatePicker>
      )}
    </div>
  );
}
