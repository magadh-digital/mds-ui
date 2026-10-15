/**
 * The console's one status / tone chip (owner, 15 Oct 2026: one component per job). `.ui-chip` coloured by a theme
 * variable, so it reads in dark and light alike. Pages map their statuses to a tone (`statusTone` covers the usual
 * words) instead of keeping their own colour tables.
 */
import type { ReactNode } from "react";

export type ChipTone = "ok" | "warn" | "error" | "muted" | "accent" | "neutral";

export const TONE_VAR: Record<ChipTone, string> = {
  ok: "var(--c-ok)",
  warn: "var(--c-warn)",
  error: "var(--c-error)",
  muted: "var(--c-muted)",
  neutral: "var(--c-muted)",
  accent: "var(--c-accent)",
};

export function ToneChip({
  tone,
  title,
  children,
  className,
}: {
  tone: ChipTone;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const c = TONE_VAR[tone] ?? TONE_VAR.muted;
  return (
    <span
      className={`ui-chip${className ? ` ${className}` : ""}`}
      title={title}
      style={{
        color: c,
        background: `color-mix(in srgb, ${c} 14%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

const OK = /^(active|approved|done|completed?|delivered|paid|verified|present|success|settled|checked|closed|yes|ready|in[_ ]?stock|accepted)$/;
const WARN = /^(pending|draft|requested|waiting|partial|hold|on[_ ]?hold|grace|due|late|in[_ ]?progress|processing|review|half[_ ]?day|extra[_ ]?time|scheduled)$/;
const ERROR = /^(rejected|cancel+ed|failed|error|expired|overdue|blocked|missing|absent|marked[_ ]?absent|declined|deleted|refused)$/;
const MUTED = /^(inactive|none|no|unknown|n\/a|archived|disabled|not[_ ]?required)$/;

/** the usual tone of a status word (`APPROVED` → ok, `pending` → warn, `Rejected` → error); `fallback` otherwise */
export function statusTone(status: string | null | undefined, fallback: ChipTone = "accent"): ChipTone {
  const s = String(status ?? "").trim().toLowerCase();
  if (!s) return "muted";
  if (OK.test(s)) return "ok";
  if (WARN.test(s)) return "warn";
  if (ERROR.test(s)) return "error";
  if (MUTED.test(s)) return "muted";
  return fallback;
}

/** "MARKED_ABSENT" → "Marked absent": status words for people, not enums */
export const statusLabel = (s: string | null | undefined) =>
  s
    ? String(s)
        .replace(/[_-]+/g, " ")
        .toLowerCase()
        .replace(/^./, (c) => c.toUpperCase())
    : "—";

/** A status as a chip, toned and worded the usual way; pass `tone` / `label` to override. */
export function StatusChip({
  status,
  tone,
  label,
  title,
}: {
  status: string | null | undefined;
  tone?: ChipTone;
  label?: ReactNode;
  title?: string;
}) {
  if (!status && !label) return <span className="ui-muted">—</span>;
  return (
    <ToneChip tone={tone ?? statusTone(status)} title={title}>
      {label ?? statusLabel(status)}
    </ToneChip>
  );
}
