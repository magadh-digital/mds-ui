/**
 * What every floating layer of the kit shares (popovers, the tooltip, the Autocomplete list, the calendar), on
 * Floating UI: a layer tree so a picker inside a popover inside a panel closes one level at a time, the rule for which
 * clicks count as "outside", and how a trigger element takes the layer's props.
 */
import {
  FloatingTree,
  useFloatingParentNodeId,
  useMergeRefs,
  type Placement,
} from "@floating-ui/react";
import {
  cloneElement,
  isValidElement,
  type HTMLProps,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

export type { Placement };

/** z-index of the layers: above the slide-over panels and the sticky table header (as the old Chakra layers) */
export const LAYER_Z = 1500;
export const TIP_Z = 1800;

/**
 * Clicks inside these are not "outside" for an open popover: layers the kit portals to <body> that are not children in
 * the layer tree (the row menu, a toast), and anything marked `data-kit-layer`.
 */
const INSIDE = ".ctxmenu, .ui-ac-pop, .daterange-pop, [data-kit-layer]";
export const isInsideLayer = (target: EventTarget | null) =>
  !!(target as Element | null)?.closest?.(INSIDE);

/** Wraps a top-level layer in a FloatingTree; nested ones join their parent's tree. */
export function LayerTree({ children }: { children: ReactNode }) {
  const parent = useFloatingParentNodeId();
  return parent === null ? <FloatingTree>{children}</FloatingTree> : <>{children}</>;
}

/**
 * The trigger: the given element itself takes the ref and props (the old `asChild`), keeping its own handlers;
 * a non-element trigger (text) is wrapped in a span.
 */
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
