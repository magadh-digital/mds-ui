import {
  FloatingFocusManager,
  FloatingNode,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  type Placement,
} from "@floating-ui/react";
import { Check, Copy, Plus, type LucideIcon } from "lucide-react";
import {
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { X } from "lucide-react";
import { LAYER_Z, LayerTree, TIP_Z, Trigger, isInsideLayer, useLayerMotion } from "./floating";

export type Tone = "ok" | "warn" | "error" | "accent" | "neutral";

/** A hover / focus hint (250 ms in, 50 ms out), drawn in `.ui-tip`. */
export function Tip({
  label,
  children,
  placement = "bottom",
}: {
  label: ReactNode;
  children: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });
  const motion = useLayerMotion(context, "tip");
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { delay: { open: 250, close: 50 }, move: false }),
    useFocus(context),
    useDismiss(context),
    useRole(context, { role: "tooltip" }),
  ]);
  return (
    <>
      <Trigger setRef={refs.setReference} getProps={getReferenceProps}>
        {children}
      </Trigger>
      {motion.isMounted && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            className="ui-tip"
            data-status={motion.status}
            style={{ ...floatingStyles, ...motion.styles, zIndex: TIP_Z }}
            {...getFloatingProps()}
          >
            {label}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

type PopPlacement = "bottom-end" | "bottom-start" | "top-start" | "top-end";

/**
 * The one floating surface behind Pop, EditPop and HoverPop: positioned under its trigger, mounted only while open,
 * closed by Escape or a press outside (a picker or menu the popover opened does not count as outside).
 */
function PopLayer({
  trigger,
  open,
  setOpen,
  placement,
  hover,
  focus = true,
  className,
  style,
  children,
}: {
  trigger: ReactNode;
  open: boolean;
  setOpen: (v: boolean) => void;
  placement: Placement;
  /** opened and closed by the caller's hover timers instead of a click */
  hover?: { onEnter: () => void; onLeave: () => void };
  /** move focus into the popover (and back to the trigger on close) */
  focus?: boolean;
  className: string;
  style: CSSProperties;
  children: ReactNode;
}) {
  const nodeId = useFloatingNodeId();
  const { refs, floatingStyles, context } = useFloating({
    nodeId,
    open,
    onOpenChange: setOpen,
    placement,
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });
  const motion = useLayerMotion(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context, { enabled: !hover }),
    useDismiss(context, {
      outsidePress: (e) => !isInsideLayer(e.target),
      bubbles: { escapeKey: false },
    }),
    useRole(context, { role: "dialog" }),
  ]);
  const body = (
    <div
      ref={refs.setFloating}
      className={className}
      data-status={motion.status}
      style={{ ...floatingStyles, ...motion.styles, zIndex: LAYER_Z, ...style }}
      onMouseEnter={hover?.onEnter}
      onMouseLeave={hover?.onLeave}
      {...getFloatingProps()}
    >
      {children}
    </div>
  );
  return (
    <FloatingNode id={nodeId}>
      <Trigger setRef={refs.setReference} getProps={getReferenceProps}>
        {trigger}
      </Trigger>
      {motion.isMounted && (
        <FloatingPortal>
          {focus ? (
            <FloatingFocusManager context={context} modal={false} initialFocus={0} returnFocus>
              {body}
            </FloatingFocusManager>
          ) : (
            body
          )}
        </FloatingPortal>
      )}
    </FloatingNode>
  );
}

/** Small popover with the console's surface styling. */
export function Pop({
  trigger,
  children,
  placement = "bottom-end",
  width,
}: {
  trigger: ReactNode;
  children: ReactNode;
  placement?: "bottom-end" | "bottom-start" | "top-start";
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <LayerTree>
      <PopLayer
        trigger={trigger}
        open={open}
        setOpen={setOpen}
        placement={placement}
        className="ui-pop"
        style={{ width: width ?? "auto", minWidth: 180 }}
      >
        {children}
      </PopLayer>
    </LayerTree>
  );
}

/**
 * A small editor in a popover (21 Sep 2026): quantity, rate, attributes, a vehicle, a gift, an access row — anything
 * that used to open a second slide-over. The body mounts only while open (its queries fire then, not with the panel)
 * and receives `close`; a title row with × sits above it.
 */
export function EditPop({
  trigger,
  title,
  width = "380px",
  placement = "bottom-end",
  children,
}: {
  trigger: ReactNode;
  title?: string;
  width?: string;
  placement?: PopPlacement;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <LayerTree>
      <PopLayer
        trigger={trigger}
        open={open}
        setOpen={setOpen}
        placement={placement}
        className="ui-pop ui-editpop"
        style={{ width, maxWidth: "92vw", minWidth: 180 }}
      >
        {title && (
          <div className="ui-editpop-title">
            <span>{title}</span>
            <button type="button" className="ui-iconbtn sm" aria-label="Close" onClick={close}>
              <X />
            </button>
          </div>
        )}
        {children(close)}
      </PopLayer>
    </LayerTree>
  );
}

/** A popover that opens on hover (and focus), for a summary behind a cell; the body mounts only while open, so a list of 200 rows costs nothing until a row is hovered. */
export function HoverPop({
  trigger,
  children,
  placement = "bottom-start",
  width,
  delay = 300,
}: {
  trigger: ReactNode;
  children: ReactNode;
  placement?: "bottom-end" | "bottom-start" | "top-start";
  width?: string;
  delay?: number;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const show = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 150);
  };
  return (
    <LayerTree>
      <PopLayer
        trigger={
          <span
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            {trigger}
          </span>
        }
        open={open}
        setOpen={setOpen}
        placement={placement}
        hover={{ onEnter: show, onLeave: hide }}
        focus={false}
        className="ui-pop"
        style={{ width: width ?? "auto", minWidth: 220, fontSize: "var(--fs-sm)" }}
      >
        {children}
      </PopLayer>
    </LayerTree>
  );
}

/** the status dot; `needs` draws the "needs you" ring around it (a person's input is what the row waits for) */
export const Dot = ({
  tone = "neutral",
  title,
  needs,
}: {
  tone?: Tone;
  title?: string;
  needs?: boolean;
}) => (
  <span className={`ui-dot ${tone} ${needs ? "needs" : ""}`} title={title} />
);

export function HealthBar({
  segments,
  labels,
}: {
  segments: Array<Tone | "neutral">;
  labels?: [string, string, string];
}) {
  return (
    <div>
      <div className="ui-health">
        {segments.map((s, i) => (
          <span key={i} className={s} />
        ))}
      </div>
      {labels && (
        <div className="ui-health-labels">
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
          <span>{labels[2]}</span>
        </div>
      )}
    </div>
  );
}

export function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: ReactNode }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="ui-seg" role="tablist">
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          role="tab"
          aria-selected={o.value === value}
          className={o.value === value ? "active" : ""}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Pills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="ui-pills">
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          className={o.value === value ? "active" : ""}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({
  on,
  onChange,
  label,
  hideLabel,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
  /** icon-only use; the label stays for screen readers */ hideLabel?: boolean;
}) {
  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`ui-switch ${on ? "on" : ""}`}
      onClick={() => onChange(!on)}
    />
  );
  if (hideLabel) return control;
  return (
    <label className="ui-switch-row">
      {control}
      <span>{label}</span>
    </label>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="ui-iconbtn copy"
      style={{ width: 20, height: 20 }}
      title="Copy"
      onClick={(e) => {
        e.stopPropagation();
        void navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        });
      }}
    >
      {done ? (
        <Check style={{ width: 12, height: 12 }} />
      ) : (
        <Copy style={{ width: 12, height: 12 }} />
      )}
    </button>
  );
}

export function Skeleton({ w = "60%" }: { w?: string }) {
  return <div className="ui-skel" style={{ width: w }} />;
}

/**
 * The small in-cell action (21 Sep 2026): a pencil, sliders or trash icon beside the value it acts on — inline, 20 px,
 * the label as tooltip and aria-label, red on hover when `danger`. Use it as a popover / confirm trigger (`ref` passes
 * through) or with `onClick`. Never a text link for edit / delete inside a table.
 */
export function IconAction({
  ref,
  icon: Icon,
  label,
  danger,
  className,
  ...rest
}: {
  ref?: Ref<HTMLButtonElement>;
  icon: LucideIcon;
  label: string;
  danger?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      ref={ref}
      type="button"
      className={`ui-iconbtn sm ${danger ? "danger" : ""} ${className ?? ""}`}
      title={label}
      aria-label={label}
      {...rest}
    >
      <Icon />
    </button>
  );
}
/** The "+ Add …" link that opens a popover or a form: a leading plus that stays on the link's line. */
export function AddLink({
  ref,
  label,
  className,
  ...rest
}: {
  ref?: Ref<HTMLButtonElement>;
  label: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      ref={ref}
      type="button"
      className={`ui-link nowrap ${className ?? ""}`}
      {...rest}
    >
      <Plus /> {label}
    </button>
  );
}

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
 */
export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<ToggleOption<T>>;
  /** the picked choice, or "" for none (no filter) */
  value: T | "";
  onChange: (v: T | "") => void;
  /** accessible name of the group */
  label?: string;
}) {
  return (
    <div className="ui-seg ui-toggle" role="group" aria-label={label}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            className={on ? "active" : ""}
            title={o.title ?? (on ? "Click again to show all" : undefined)}
            onClick={() => onChange(on ? "" : o.value)}
          >
            {o.label}
            {o.count != null && (
              <span className="ui-toggle-count ui-num">
                {o.count.toLocaleString("en-IN")}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
