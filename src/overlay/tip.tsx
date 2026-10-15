import { autoUpdate, flip, FloatingPortal, offset, shift, useDismiss, useFloating, useFocus, useHover, useInteractions, useRole } from "@floating-ui/react";
import { type ReactNode, useState } from "react";
import { TIP_Z, Trigger, useLayerMotion } from "./floating.js";

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
