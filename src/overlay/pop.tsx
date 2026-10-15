import { autoUpdate, flip, FloatingFocusManager, FloatingNode, FloatingPortal, offset, type Placement, shift, useClick, useDismiss, useFloating, useFloatingNodeId, useInteractions, useRole } from "@floating-ui/react";
import { type CSSProperties, type ReactNode, useRef, useState } from "react";
import { X } from "lucide-react";
import { isInsideLayer, LAYER_Z, LayerTree, Trigger, useLayerMotion } from "./floating.js";

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

/** Small popover with the kit's surface styling. */
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
 * A small editor in a popover: quantity, rate, attributes, a vehicle, a gift, an access row — anything
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
