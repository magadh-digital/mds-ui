/**
 * One date in a form (a bill date, an expiry): the kit's calendar under a field that reads "Oct 15, 2026", instead of
 * the browser's <input type="date"> that looks different in every browser. Value is "YYYY-MM-DD" or "" (none).
 * `min` / `max` grey out the days outside; Today and Clear sit under the calendar.
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
import { useState } from "react";
import { date, type KitDate } from "../core/date";
import { isInsideLayer, useLayerMotion } from "../overlay/floating";
import { CalendarMonth, DateTrigger, iso } from "./calendar";

export function DateInput({
  value,
  onChange,
  min,
  max,
  placeholder = "Pick a date",
  clearable = true,
  disabled,
  invalid,
  format = "MMM D, YYYY",
  ariaLabel,
}: {
  /** "YYYY-MM-DD", or "" / undefined for none */
  value: string | null | undefined;
  onChange: (value: string) => void;
  /** the earliest day that can be picked ("YYYY-MM-DD") */
  min?: string;
  /** the latest day that can be picked ("YYYY-MM-DD") */
  max?: string;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  /** how the field shows the date (date().format tokens) */
  format?: string;
  ariaLabel?: string;
}) {
  const picked = value && date(value).isValid() ? value : "";
  const [open, setOpenState] = useState(false);
  const startView = () => (picked ? date(picked) : date()).startOf("month");
  const [view, setView] = useState<KitDate>(startView);
  const setOpen = (v: boolean) => {
    if (v) setView(startView());
    setOpenState(v);
  };
  const out = (k: string) => (min && k < min) || (max && k > max) ? true : false;
  const pick = (d: KitDate) => {
    onChange(iso(d));
    setOpenState(false);
  };
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
  const today = iso(date());
  return (
    <div className={`daterange-root dateinput${invalid ? " invalid" : ""}`}>
      <div className="daterange-wrap">
        <DateTrigger
          ref={refs.setReference}
          label={picked ? date(picked).format(format) : placeholder}
          empty={!picked}
          open={open}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          hint="Pick a date"
          onClear={clearable && !disabled ? () => onChange("") : undefined}
          {...getReferenceProps({ onClick: () => !disabled && setOpen(!open) })}
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
              <div className="daterange-cal" role="dialog" aria-label={ariaLabel ?? "Pick a date"}>
                <CalendarMonth
                  view={view}
                  setView={setView}
                  mode="day"
                  value={{ from: picked || undefined }}
                  draft={null}
                  hover={null}
                  setHover={() => {}}
                  onPick={pick}
                  onEscape={() => setOpenState(false)}
                  isDisabled={out}
                />
                <div className="daterange-foot dateinput-foot">
                  <button type="button" className="ui-link" disabled={out(today)} onClick={() => pick(date())}>
                    Today
                  </button>
                  {clearable && picked && (
                    <button type="button" className="ui-link" onClick={() => { onChange(""); setOpenState(false); }}>
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}
