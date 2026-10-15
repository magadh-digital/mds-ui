import { autoUpdate, flip, FloatingFocusManager, FloatingNode, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useFloatingNodeId, useInteractions, useRole } from "@floating-ui/react";
import { type CSSProperties, type MutableRefObject, type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { isInsideLayer, LAYER_Z, LayerTree, Trigger, useLayerMotion } from "./floating.js";

/** Where a popover opens against its trigger (Pop, EditPop, HoverPop, ConfirmPop); it flips when there is no room. */
export type PopPlacement = "bottom-end" | "bottom-start" | "top-start" | "top-end";

/** a field a person types or picks in: EditPop focuses the first one on open */
const FIELD =
  'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"]';
const TABBABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

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
  focusField,
  label,
  labelledBy,
  className,
  style,
  children,
}: {
  trigger: ReactNode;
  open: boolean;
  setOpen: (v: boolean) => void;
  placement: PopPlacement;
  /** opened and closed by the caller's hover timers instead of a click */
  hover?: { onEnter: () => void; onLeave: () => void };
  /** move focus into the popover (and back to the trigger on close) */
  focus?: boolean;
  /** focus the first field in the popover on open (else its first tabbable element) */
  focusField?: boolean;
  /** the dialog's accessible name */
  label?: string;
  /** the id of the element that names the dialog (wins over `label`) */
  labelledBy?: string;
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
  // read by the focus manager when it opens (a getter, so it sees the body as rendered)
  const fieldFocus = useMemo<MutableRefObject<HTMLElement | null>>(
    () => ({
      get current() {
        const el = refs.floating.current;
        return el?.querySelector<HTMLElement>(FIELD) ?? el?.querySelector<HTMLElement>(TABBABLE) ?? null;
      },
      set current(_v) {
        /* read only */
      },
    }),
    [refs.floating],
  );
  const body = (
    <div
      ref={refs.setFloating}
      className={className}
      data-status={motion.status}
      style={{ ...floatingStyles, ...motion.styles, zIndex: LAYER_Z, ...style }}
      onMouseEnter={hover?.onEnter}
      onMouseLeave={hover?.onLeave}
      {...getFloatingProps()}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
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
            <FloatingFocusManager context={context} modal={false} initialFocus={focusField ? fieldFocus : 0} returnFocus>
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

/** Open state that a parent may own (`open` + `onOpenChange`) or leave to the component. */
function useOpenState(open?: boolean, onOpenChange?: (open: boolean) => void) {
  const [inner, setInner] = useState(false);
  const controlled = open !== undefined;
  const value = controlled ? open : inner;
  const set = (v: boolean) => {
    if (!controlled) setInner(v);
    onOpenChange?.(v);
  };
  return [value, set] as const;
}

/**
 * Small popover with the kit's surface styling. It opens and closes itself; pass `open` + `onOpenChange` to own the
 * state (to close it from inside, after a save).
 */
export function Pop({
  trigger,
  children,
  placement = "bottom-end",
  width,
  label,
  open,
  onOpenChange,
}: {
  trigger: ReactNode;
  children: ReactNode;
  placement?: PopPlacement;
  width?: string;
  /** the popover's accessible name (what a screen reader says when focus moves in) */
  label?: string;
  /** controlled open state; leave out to let the popover keep its own */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setOpen] = useOpenState(open, onOpenChange);
  return (
    <LayerTree>
      <PopLayer
        trigger={trigger}
        open={isOpen}
        setOpen={setOpen}
        placement={placement}
        label={label}
        className="ui-pop"
        style={{ width: width ?? "auto", minWidth: 180 }}
      >
        {children}
      </PopLayer>
    </LayerTree>
  );
}

/**
 * A small editor in a popover: a quantity, a rate, a few attributes, an access row — anything that would otherwise open
 * a second slide-over. The body mounts only while open (its queries fire then, not with the panel) and receives
 * `close`; a title row with × sits above it and names the popover. Focus moves to the body's first field.
 */
export function EditPop({
  trigger,
  title,
  label,
  width = "380px",
  placement = "bottom-end",
  children,
}: {
  trigger: ReactNode;
  title?: string;
  /** the accessible name when there is no `title` */
  label?: string;
  width?: string;
  placement?: PopPlacement;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const close = () => setOpen(false);
  return (
    <LayerTree>
      <PopLayer
        trigger={trigger}
        open={open}
        setOpen={setOpen}
        placement={placement}
        focusField
        labelledBy={title ? titleId : undefined}
        label={label}
        className="ui-pop ui-editpop"
        style={{ width, maxWidth: "92vw", minWidth: 180 }}
      >
        {title && (
          <div className="ui-editpop-title">
            <span id={titleId}>{title}</span>
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
  label,
}: {
  trigger: ReactNode;
  children: ReactNode;
  placement?: PopPlacement;
  width?: string;
  delay?: number;
  /** the popover's accessible name */
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
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
        label={label}
        className="ui-pop"
        style={{ width: width ?? "auto", minWidth: 220, fontSize: "var(--fs-sm)" }}
      >
        {children}
      </PopLayer>
    </LayerTree>
  );
}
