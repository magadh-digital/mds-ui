import type { CSSProperties, MouseEvent, ReactNode } from "react";
import type { Tone } from "../core/types.js";

/**
 * The kit's one status / tone chip. `.mds-chip` coloured by a theme
 * variable, so it reads in dark and light alike. Pages map their statuses to a tone (`statusTone` covers the usual
 * words) instead of keeping their own colour tables.
 */

/** every kit `Tone`, plus a quiet `muted` and a `purple` for tags */
export type ChipTone = Tone | "muted" | "purple";

/** @internal */
export const TONE_VAR: Record<ChipTone, string> = {
  ok: "var(--mds-c-ok)",
  warn: "var(--mds-c-warn)",
  error: "var(--mds-c-error)",
  muted: "var(--mds-c-muted)",
  neutral: "var(--mds-c-muted)",
  accent: "var(--mds-c-accent)",
  purple: "var(--mds-c-purple)",
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
  const cls = `mds-chip${onClick ? " clickable" : ""}${dim ? " mds-dim" : ""}${className ? ` ${className}` : ""}`;
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
const WARN = /^(pending|draft|requested|waiting|partial|hold|on[_ ]?hold|grace|due|late|in[_ ]?progress|processing|review|scheduled)$/;
const ERROR = /^(rejected|cancel+ed|failed|error|expired|overdue|blocked|missing|absent|declined|deleted|refused)$/;
const MUTED = /^(inactive|none|no|unknown|n\/a|archived|disabled|not[_ ]?required)$/;

/**
 * the usual tone of a status word (`APPROVED` → ok, `pending` → warn, `Rejected` → error); `fallback` otherwise.
 * `overrides` gives a page's own words first (`{ ORDER_OUT: "ok", HALF_DAY: "warn" }`, any case).
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
  // "ON_HOLD", "on-hold" and "on hold" are one word to the lists below, as they are to statusLabel
  const w = s.replace(/[\s_-]+/g, "_");
  if (OK.test(w)) return "ok";
  if (WARN.test(w)) return "warn";
  if (ERROR.test(w)) return "error";
  if (MUTED.test(w)) return "muted";
  return fallback;
}

/**
 * "ON_HOLD" → "On hold": status words for people, not enums. `keep` lists abbreviations that stay in
 * capitals ("MO_APPROVED" with keep ["MO"] → "MO approved"). Nothing to show ("", "-", "__") reads "—".
 */
export const statusLabel = (s: string | null | undefined, keep: ReadonlyArray<string> = []) => {
  const words = String(s ?? "")
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "—";
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
  if (!status && !label) return <span className="mds-muted">—</span>;
  return (
    <ToneChip tone={tone ?? statusTone(status, "accent", tones)} title={title} onClick={onClick}>
      {label ?? statusLabel(status, keep)}
    </ToneChip>
  );
}
