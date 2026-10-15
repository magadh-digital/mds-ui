import { type FloatingContext, FloatingTree, type Placement, useFloatingParentNodeId, useMergeRefs, useTransitionStatus, useTransitionStyles } from "@floating-ui/react";
import { cloneElement, type HTMLProps, isValidElement, type ReactElement, type ReactNode, type Ref } from "react";

/**
 * What every floating layer of the kit shares (popovers, the tooltip, the Autocomplete list, the calendar), on
 * Floating UI: a layer tree so a picker inside a popover inside a panel closes one level at a time, the rule for which
 * clicks count as "outside", and how a trigger element takes the layer's props.
 */

export type { Placement };

/*
 * The kit's stacking order, bottom to top. Slide-over panels sit at 10–30 and the file viewer at 1000 (display/);
 * a dialog opened from the viewer must cover it, a toast must show over a dialog, and a popover, list or tooltip
 * opened inside any of them must sit above it. The date pickers use LAYER_Z.
 */
// z-index of a dialog's backdrop (overlay/dialog.tsx): above the file viewer (1000)
/** @internal */
export const DIALOG_Z = 1100;
// z-index of the ⌘K palette's overlay: above a dialog
/** @internal */
export const PALETTE_Z = 1200;
// z-index of the row / context menu: above a dialog, so a menu opened inside one shows
/** @internal */
export const MENU_Z = 1300;
// z-index of the toasts: above dialogs, the palette and menus
/** @internal */
export const TOAST_Z = 1400;
// z-index of popovers and lists: above the panels, dialogs, menus and the sticky table header
/** @internal */
export const LAYER_Z = 1500;
// z-index of a tooltip: above everything it can describe
/** @internal */
export const TIP_Z = 1800;

/**
 * Clicks inside these are not "outside" for an open popover: layers the kit portals to <body> that are not children in
 * the layer tree (the row menu, a toast), and anything marked `data-kit-layer`.
 */
const INSIDE = ".ctxmenu, .ui-ac-pop, .daterange-pop, .toasts, [data-kit-layer]";
/** @internal */
export const isInsideLayer = (target: EventTarget | null) =>
  !!(target as Element | null)?.closest?.(INSIDE);

const ORIGIN: Record<string, string> = { top: "bottom", bottom: "top", left: "right", right: "left" };
const reduced = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
/**
 * The open / close motion every layer shares: a 150 ms fade with a slight scale from the
 * side it opens on (100 ms out), none when the reader asks for reduced motion. The layer stays mounted while it fades
 * out (`isMounted`) and carries `data-status` (initial / open / close). The floating element is positioned by top/left
 * (`transform: false`), so the scale is free.
 */
/** @internal */
export function useLayerMotion(context: FloatingContext, kind: "pop" | "tip" | "list" = "pop") {
  const off = reduced();
  const duration = off ? 0 : kind === "tip" ? { open: 120, close: 80 } : kind === "list" ? { open: 120, close: 90 } : { open: 150, close: 100 };
  const { status } = useTransitionStatus(context, { duration });
  const motion = useTransitionStyles(context, {
    duration,
    initial: { opacity: 0, transform: kind === "list" ? "translateY(-4px)" : "scale(0.96)" },
    // a layer on its way out takes no clicks: the next control under it gets them
    close: { opacity: 0, transform: kind === "list" ? "translateY(-4px)" : "scale(0.96)", pointerEvents: "none" },
    common: ({ side }) => ({ transformOrigin: ORIGIN[side] ?? "top", transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)" }),
  });
  return { ...motion, status };
}

/** Wraps a top-level layer in a FloatingTree; nested ones join their parent's tree. */
/** @internal */
export function LayerTree({ children }: { children: ReactNode }) {
  const parent = useFloatingParentNodeId();
  return parent === null ? <FloatingTree>{children}</FloatingTree> : <>{children}</>;
}

/**
 * The trigger: the given element itself takes the ref and props (as an `asChild` would), keeping its own handlers;
 * a non-element trigger (text) is wrapped in a span.
 */
/** @internal */
export function Trigger({
  children,
  setRef,
  getProps,
}: {
  children: ReactNode;
  setRef: Ref<Element>;
  getProps: (user?: HTMLProps<Element>) => Record<string, unknown>;
}) {
  const el = isValidElement(children)
    ? (children as ReactElement<Record<string, unknown> & { ref?: Ref<Element> }>)
    : null;
  const ref = useMergeRefs([setRef, el?.props.ref ?? null]);
  if (!el) return <span ref={ref as Ref<HTMLSpanElement>} {...getProps()}>{children}</span>;
  return cloneElement(el, { ...getProps(el.props as HTMLProps<Element>), ref });
}
