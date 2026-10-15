import { autoUpdate, flip, FloatingFocusManager, FloatingPortal, offset, shift, useDismiss, useFloating, useInteractions } from "@floating-ui/react";
import { useState } from "react";
import { date, type KitDate } from "../core/date";
import { CalendarMonth as Month, DateTrigger as Trigger, iso } from "./calendar";
import { isInsideLayer, useLayerMotion } from "../overlay/floating";

/**
 * The date control every list uses, one field that reads like a date, a calendar
 * where a range is two clicks on the same grid, a Day / Range switch and the shortcuts the office reaches for (today,
 * yesterday, 7 and 30 days, this and last month, financial year, all time). Values are YYYY-MM-DD strings kept in the
 * URL; a blank side is open-ended. The calendar is the kit's own (it replaced react-datepicker; same look and keys).
 */

export type RangeValue = { from?: string; to?: string };
export type PresetKey =
  "today" | "yesterday" | "7d" | "30d" | "month" | "last_month" | "fy" | "all";
type Mode = "day" | "range";

const D = "YYYY-MM-DD";
const FMT = "MMM D, YYYY";
export const dateOnly = (v: unknown) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined;
const fmt = (d: Date | string) => date(d).format(FMT);

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

/** How the field reads a value: the dates, short; blank means every date. */
export const rangeLabel = (v: RangeValue): string => {
  if (!v.from && !v.to) return "All time";
  if (v.from && v.to)
    return v.from === v.to ? fmt(v.from) : `${fmt(v.from)} – ${fmt(v.to)}`;
  return v.from ? `${fmt(v.from)} → …` : `… → ${fmt(v.to!)}`;
};


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
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
  });
  const motion = useLayerMotion(context);
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
      {motion.isMounted && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} initialFocus={-1} returnFocus>
            <div
              ref={refs.setFloating}
              className="daterange-pop"
              data-status={motion.status}
              style={{ ...floatingStyles, ...motion.styles, zIndex: 2000 }}
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
