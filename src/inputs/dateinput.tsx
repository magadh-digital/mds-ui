/**
 * One date in a form (a bill date, an expiry): the kit's calendar under a field that reads "Oct 15, 2026", instead of
 * the browser's <input type="date"> that looks different in every browser. Value is "YYYY-MM-DD" or "" (none).
 * `min` / `max` grey out the days outside (and the arrow keys stop there); Today and Clear sit under the calendar.
 * `label` names the field for screen readers, read with the date ("Bill date, Oct 15, 2026"); inside a FormRow the
 * row's label does that.
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
import { date, type KitDate } from "../core/date.js";
import { isInsideLayer, LAYER_Z, useLayerMotion } from "../overlay/floating.js";
import { CalendarMonth, DateTrigger, iso } from "./calendar.js";
import { useFieldControl } from "./field.js";

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
  label,
  id,
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
  /** the field's accessible name, read before the date */
  label?: string;
  id?: string;
}) {
  const { id: fieldId, field } = useFieldControl(id);
  const bad = invalid ?? field?.invalid ?? false;
  const picked = value && date(value).isValid() ? value : "";
  const [open, setOpenState] = useState(false);
  const startView = () => (picked ? date(picked) : date()).startOf("month");
  const [view, setView] = useState<KitDate>(startView);
  const setOpen = (v: boolean) => {
    if (v) setView(startView());
    setOpenState(v);
  };
  const out = (k: string) => (!!min && k < min) || (!!max && k > max);
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
    <div className={`mds-daterange-root mds-dateinput${bad ? " invalid" : ""}`}>
      <div className="mds-daterange-wrap">
        <DateTrigger
          ref={refs.setReference}
          id={fieldId}
          label={picked ? date(picked).format(format) : placeholder}
          name={label}
          labelledBy={field?.labelId}
          aria-describedby={field?.describedBy}
          empty={!picked}
          open={open}
          disabled={disabled}
          aria-invalid={bad || undefined}
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
              className="mds-daterange-pop"
              data-status={motion.status}
              style={{ ...floatingStyles, ...motion.styles, zIndex: LAYER_Z }}
              {...getFloatingProps()}
            >
              <div className="mds-daterange-cal" role="dialog" aria-label={label ? `Pick ${label}` : "Pick a date"}>
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
                  min={min}
                  max={max}
                />
                <div className="mds-daterange-foot mds-dateinput-foot">
                  <button type="button" className="mds-link" disabled={out(today)} onClick={() => pick(date())}>
                    Today
                  </button>
                  {clearable && picked && (
                    <button type="button" className="mds-link" onClick={() => { onChange(""); setOpenState(false); }}>
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
