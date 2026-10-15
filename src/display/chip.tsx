import type { CSSProperties, MouseEvent, ReactNode } from "react";

/**
 * The kit's one status / tone chip. `.ui-chip` coloured by a theme
 * variable, so it reads in dark and light alike. Pages map their statuses to a tone (`statusTone` covers the usual
 * words) instead of keeping their own colour tables.
 */

export type ChipTone = "ok" | "warn" | "error" | "muted" | "accent" | "neutral" | "purple";

export const TONE_VAR: Record<ChipTone, string> = {
  ok: "var(--c-ok)",
  warn: "var(--c-warn)",
  error: "var(--c-error)",
  muted: "var(--c-muted)",
  neutral: "var(--c-muted)",
  accent: "var(--c-accent)",
  purple: "var(--c-purple)",
};

export function ToneChip({
  tone,
  title,
  children,
  className,
  style,
  dim,
  onClick,
}: {
  tone: ChipTone;
  title?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** faded (an unused provider, a past item) */
  dim?: boolean;
  /** makes the chip a button (a store, an order count that opens something) */
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  const c = TONE_VAR[tone] ?? TONE_VAR.muted;
  const cls = `ui-chip${onClick ? " clickable" : ""}${dim ? " dim" : ""}${className ? ` ${className}` : ""}`;
  const look: CSSProperties = { color: c, background: `color-mix(in srgb, ${c} 14%, transparent)`, ...style };
  return onClick ? (
    <button type="button" className={cls} title={title} style={look} onClick={onClick}>
      {children}
    </button>
  ) : (
    <span className={cls} title={title} style={look}>
      {children}
    </span>
  );
}

const OK = /^(active|approved|done|completed?|delivered|paid|verified|present|success|settled|checked|closed|yes|ready|in[_ ]?stock|accepted)$/;
const WARN = /^(pending|draft|requested|waiting|partial|hold|on[_ ]?hold|grace|due|late|in[_ ]?progress|processing|review|half[_ ]?day|extra[_ ]?time|scheduled)$/;
const ERROR = /^(rejected|cancel+ed|failed|error|expired|overdue|blocked|missing|absent|marked[_ ]?absent|declined|deleted|refused)$/;
const MUTED = /^(inactive|none|no|unknown|n\/a|archived|disabled|not[_ ]?required)$/;

/**
 * the usual tone of a status word (`APPROVED` → ok, `pending` → warn, `Rejected` → error); `fallback` otherwise.
 * `overrides` gives a page's own words first (`{ ORDER_OUT: "ok", PLACED: "accent" }`, any case).
 */
export function statusTone(
  status: string | null | undefined,
  fallback: ChipTone = "accent",
  overrides?: Record<string, ChipTone>,
): ChipTone {
  const s = String(status ?? "").trim().toLowerCase();
  if (!s) return "muted";
  if (overrides) {
    const hit = Object.entries(overrides).find(([k]) => k.trim().toLowerCase() === s);
    if (hit) return hit[1];
  }
  if (OK.test(s)) return "ok";
  if (WARN.test(s)) return "warn";
  if (ERROR.test(s)) return "error";
  if (MUTED.test(s)) return "muted";
  return fallback;
}

/**
 * "MARKED_ABSENT" → "Marked absent": status words for people, not enums. `keep` lists abbreviations that stay in
 * capitals ("MO_APPROVED" with keep ["MO"] → "MO approved").
 */
export const statusLabel = (s: string | null | undefined, keep: ReadonlyArray<string> = []) => {
  if (!s) return "—";
  const words = String(s).replace(/[_-]+/g, " ").trim().split(/\s+/);
  const kept = new Set(keep.map((k) => k.toUpperCase()));
  return words
    .map((w, i) => (kept.has(w.toUpperCase()) ? w.toUpperCase() : i === 0 ? w[0]!.toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()))
    .join(" ");
};

/** A status as a chip, toned and worded the usual way; pass `tone` / `label` to override. */
export function StatusChip({
  status,
  tone,
  label,
  title,
  tones,
  keep,
  onClick,
}: {
  status: string | null | undefined;
  tone?: ChipTone;
  label?: ReactNode;
  title?: string;
  /** a page's own status → tone words, before the usual ones */
  tones?: Record<string, ChipTone>;
  /** abbreviations kept in capitals in the label */
  keep?: ReadonlyArray<string>;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  if (!status && !label) return <span className="ui-muted">—</span>;
  return (
    <ToneChip tone={tone ?? statusTone(status, "accent", tones)} title={title} onClick={onClick}>
      {label ?? statusLabel(status, keep)}
    </ToneChip>
  );
}
