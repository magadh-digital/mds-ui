/** Small status pieces: Spinner (something is loading), Progress (how far a job is), Kbd (a key to press). */
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import type { Tone } from "../core/types";

/** A turning icon; `label` is read by screen readers (and shown beside it when `showLabel`). */
export function Spinner({ size = 16, label = "Loading", showLabel }: { size?: number; label?: string; showLabel?: boolean }) {
  return (
    <span className="ui-spinner" role="status" aria-live="polite">
      <Loader2 className="ui-spin" style={{ width: size, height: size }} aria-hidden />
      {showLabel ? <span>{label}</span> : <span className="sr-only">{label}</span>}
    </span>
  );
}

/**
 * A bar from 0 to 100; `value={null}` is a job with no known end (the bar slides). `label` names it for screen readers
 * and shows above it with the percentage.
 */
export function Progress({ value, tone = "accent", label, showValue = true }: { value: number | null; tone?: Tone; label?: string; showValue?: boolean }) {
  const v = value == null ? null : Math.max(0, Math.min(100, value));
  return (
    <div className={`ui-progress ${tone}`}>
      {(label || (showValue && v != null)) && (
        <div className="ui-progress-head">
          {label && <span>{label}</span>}
          {showValue && v != null && <span className="ui-num">{Math.round(v)}%</span>}
        </div>
      )}
      <div
        className={`ui-progress-track${v == null ? " indeterminate" : ""}`}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v ?? undefined}
      >
        <div className="ui-progress-bar" style={v == null ? undefined : { width: `${v}%` }} />
      </div>
    </div>
  );
}

/** A key, as the shortcut hints draw it: <Kbd>/</Kbd>, <Kbd>⌘</Kbd><Kbd>K</Kbd>. */
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="ui-kbd">{children}</kbd>;
}
