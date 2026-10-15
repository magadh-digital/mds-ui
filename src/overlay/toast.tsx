import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { type FocusEvent, type KeyboardEvent, type MouseEvent, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { TOAST_Z } from "./floating.js";

/**
 * Small one-line toasts, bottom-right, auto-dismiss. No library: a tiny store + one portal.
 *
 *   toast.ok("Saved")                 3 s
 *   toast.error("Could not save")     6 s, announced at once (role="alert")
 *   toast.show("info", "Syncing…", Infinity)   stays until dismissed
 *
 * A toast waits while it is hovered or focused; click it, press Esc on it, or use its × to dismiss it.
 */

export type ToastKind = "ok" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; text: string };

let seq = 0;
let items: Array<ToastItem> = [];
const EMPTY: Array<ToastItem> = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};

// the auto-dismiss timers, kept outside React so a toast fired before the host mounts still times out
const MAX_DELAY = 2_147_483_647; // setTimeout fires at once past this (a 32-bit overflow)
type Timer = { left: number; since: number; handle?: ReturnType<typeof setTimeout> };
const timers = new Map<number, Timer>();
const start = (id: number) => {
  const t = timers.get(id);
  if (!t || t.handle !== undefined) return;
  t.since = Date.now();
  t.handle = setTimeout(() => toast.dismiss(id), t.left);
};
const pause = (id: number) => {
  const t = timers.get(id);
  if (!t || t.handle === undefined) return;
  clearTimeout(t.handle);
  t.handle = undefined;
  t.left = Math.max(0, t.left - (Date.now() - t.since));
};

export const toast = {
  /** shows a toast for `ms` (error 6 s, others 3 s); `Infinity` (or any span too long for a timer) keeps it until dismissed */
  show(kind: ToastKind, text: string, ms = kind === "error" ? 6000 : 3000) {
    const id = ++seq;
    items = [...items, { id, kind, text }];
    if (Number.isFinite(ms) && ms <= MAX_DELAY) {
      timers.set(id, { left: Math.max(0, ms), since: Date.now() });
      start(id);
    }
    emit();
    return id;
  },
  ok: (text: string, ms?: number) => toast.show("ok", text, ms),
  error: (text: string, ms?: number) => toast.show("error", text, ms),
  info: (text: string, ms?: number) => toast.show("info", text, ms),
  dismiss(id: number) {
    pause(id);
    timers.delete(id);
    if (!items.some((t) => t.id === id)) return;
    items = items.filter((t) => t.id !== id);
    emit();
  },
};

// true once mounted in a browser (false on the server and in the hydrating render), so the portal never runs on the server
const noop = () => () => {};
const useMounted = () => useSyncExternalStore(noop, () => true, () => false);

function ToastRow({ t }: { t: ToastItem }) {
  const held = (el: HTMLElement) => el.matches(":hover") || el.contains(document.activeElement);
  return (
    <div
      className={`toast ${t.kind}`}
      tabIndex={0}
      onClick={() => toast.dismiss(t.id)}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Escape" || e.key === "Enter" || e.key === "Delete") {
          e.preventDefault();
          e.stopPropagation();
          toast.dismiss(t.id);
        }
      }}
      onMouseEnter={() => pause(t.id)}
      onMouseLeave={(e: MouseEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(document.activeElement)) start(t.id);
      }}
      onFocus={() => pause(t.id)}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        if (!el.contains(e.relatedTarget as Node | null) && !held(el)) start(t.id);
      }}
    >
      {t.kind === "ok" ? <CheckCircle2 /> : t.kind === "error" ? <XCircle /> : <Info />}
      <span>{t.text}</span>
      <button
        type="button"
        className="toast-x"
        aria-label="Dismiss"
        tabIndex={-1}
        onClick={(e) => {
          e.stopPropagation();
          toast.dismiss(t.id);
        }}
      >
        <X />
      </button>
    </div>
  );
}

/**
 * Mount once in the root layout. Its two live regions stay in the page even with no toast showing, so a screen reader
 * hears the first one: errors are assertive (role="alert"), the others polite (role="status").
 */
export function Toaster() {
  const list = useSyncExternalStore(subscribe, () => items, () => EMPTY);
  const mounted = useMounted();
  if (!mounted) return null;
  const errors = list.filter((t) => t.kind === "error");
  const others = list.filter((t) => t.kind !== "error");
  return createPortal(
    <div className="toasts" style={{ zIndex: TOAST_Z }}>
      <div className="toasts-region" role="status" aria-live="polite">
        {others.map((t) => (
          <ToastRow key={t.id} t={t} />
        ))}
      </div>
      <div className="toasts-region" role="alert" aria-live="assertive">
        {errors.map((t) => (
          <ToastRow key={t.id} t={t} />
        ))}
      </div>
    </div>,
    document.body,
  );
}
