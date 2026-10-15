import { X } from "lucide-react";
import { type KeyboardEvent as ReactKeyboardEvent, type ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { DIALOG_Z } from "./floating.js";

/**
 * The one dialog of the kit (the `.inv-backdrop` / `.inv-frame` parts): a centred frame over a dim backdrop for the few
 * things a slide-over cannot hold — a form whose table needs the width (a create form), a confirm that needs fields.
 * Details stay slide-overs. It sits above the panels and the file viewer, under toasts and popovers.
 *
 * Esc, one step at a time: an open list or popover inside it closes first (its own handler); a focused text field is
 * left (blurred) next, so a stray Esc never throws a typed form away; then the dialog closes — the top one only, and
 * never the slide-over or the page behind it (panel.tsx, table.tsx and listpage.tsx stand aside while one is open).
 * Focus moves into the dialog on open, Tab stays inside it, and focus returns where it was on close.
 */

/** an open dialog's backdrop: other Esc handlers stand aside while one is in the document */
/** @internal */
export const DIALOG_SELECTOR = ".inv-backdrop";
/** lists and popovers that take the first Esc (an autocomplete list, a kit Pop, the calendar, a row menu, ⌘K) */
/** @internal */
// a layer fading out (data-status="close") is already closed: it must not hold Esc or the page keys for its last 100 ms
export const LIST_OPEN_SELECTOR =
  '.ui-pop:not([data-status="close"]), .daterange-pop:not([data-status="close"]), .ctxmenu, .cmdk';
/** @internal */
export const dialogOpen = () => !!document.querySelector(DIALOG_SELECTOR);
/** @internal */
export const listOpen = () => !!document.querySelector(LIST_OPEN_SELECTOR);

const NOT_TEXT = new Set([
  "checkbox",
  "radio",
  "button",
  "submit",
  "reset",
  "range",
  "color",
  "file",
  "image",
]);
/** a field the reader types into (a checkbox is not: Esc there goes on to close) */
/** @internal */
export const isTextEntry = (el: Element | null): el is HTMLElement =>
  !!el &&
  (el.tagName === "INPUT"
    ? !NOT_TEXT.has((el as HTMLInputElement).type)
    : el.tagName === "TEXTAREA" ||
      el.tagName === "SELECT" ||
      (el as HTMLElement).isContentEditable);

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type DialogSize = "sm" | "md" | "lg" | "xl";

export function Dialog({
  open,
  title,
  size = "md",
  onClose,
  toolbar,
  footer,
  label,
  children,
}: {
  open: boolean;
  title: ReactNode;
  /** sm 420 px (a question) · md 900 px · lg 1100 px · xl 1280 px, never wider than the window */
  size?: DialogSize;
  onClose: () => void;
  /** extra controls in the title row, before the close button */
  toolbar?: ReactNode;
  /** a row pinned under the scrolling body (the form's Save) */
  footer?: ReactNode;
  /** the accessible name when the title is not plain text */
  label?: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return createPortal(
    <DialogFrame
      title={title}
      size={size}
      onClose={onClose}
      toolbar={toolbar}
      footer={footer}
      label={label}
    >
      {children}
    </DialogFrame>,
    document.body,
  );
}

function DialogFrame({
  title,
  size,
  onClose,
  toolbar,
  footer,
  label,
  children,
}: {
  title: ReactNode;
  size: DialogSize;
  onClose: () => void;
  toolbar?: ReactNode;
  footer?: ReactNode;
  label?: string;
  children: ReactNode;
}) {
  const titleId = useId();
  const backdrop = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  // focus in on open (a [data-autofocus] field, else the frame), back where it was on close
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const f = frame.current;
    const first = f?.querySelector<HTMLElement>("[data-autofocus]");
    (first ?? f)?.focus({ preventScroll: true });
    return () => {
      if (before && before.isConnected) before.focus({ preventScroll: true });
    };
  }, []);

  // Esc: a list first, then a focused text field, then this dialog when it is the top one
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      const all = document.querySelectorAll(DIALOG_SELECTOR);
      if (all[all.length - 1] !== backdrop.current) return;
      if (listOpen()) return;
      const a = document.activeElement;
      e.preventDefault();
      if (isTextEntry(a) && frame.current?.contains(a)) {
        (a as HTMLElement).blur();
        frame.current.focus({ preventScroll: true });
        return;
      }
      close.current();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // Tab stays inside the frame (a popover portalled out of it keeps its own focus)
  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key !== "Tab" || !frame.current) return;
    if (!(e.target instanceof Node) || !frame.current.contains(e.target))
      return;
    const els = Array.from(
      frame.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!els.length) return;
    const first = els[0]!;
    const last = els[els.length - 1]!;
    if (e.shiftKey && (document.activeElement === first || document.activeElement === frame.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // a press that starts and ends on the backdrop closes (a drag out of a field does not)
  const downOnBackdrop = useRef(false);
  return (
    <div
      ref={backdrop}
      className="inv-backdrop"
      style={{ zIndex: DIALOG_Z }}
      onMouseDown={(e) => {
        downOnBackdrop.current = e.target === e.currentTarget;
      }}
      onMouseUp={(e) => {
        if (downOnBackdrop.current && e.target === e.currentTarget)
          close.current();
        downOnBackdrop.current = false;
      }}
    >
      <div
        ref={frame}
        className={`inv-frame ${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={label ? undefined : titleId}
        aria-label={label}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div className="inv-toolbar">
          <span className="inv-title" id={titleId}>
            {title}
          </span>
          <span className="grow" />
          {toolbar}
          <button
            type="button"
            className="ui-iconbtn"
            onClick={() => close.current()}
            aria-label="Close"
            title="Close (Esc)"
          >
            <X />
          </button>
        </div>
        <div className="inv-body">{children}</div>
        {footer && <div className="inv-foot">{footer}</div>}
      </div>
    </div>
  );
}
