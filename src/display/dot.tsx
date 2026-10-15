import { type Tone } from "../core/types.js";

/** the plain word for a tone, for screen readers (the colour alone says nothing to them) */
const TONE_WORD: Record<Tone, string> = {
  ok: "good",
  warn: "warning",
  error: "problem",
  accent: "active",
  neutral: "no data",
};

/**
 * The status dot; `needs` draws the "needs you" ring around it (a person's input is what the row waits for).
 * `label` (or `title`) is what it means, read by screen readers; without either the dot is decoration beside a word
 * that already says it, and screen readers skip it.
 */
export const Dot = ({
  tone = "neutral",
  title,
  label,
  needs,
}: {
  tone?: Tone;
  /** hover text; also the accessible name when there is no `label` */
  title?: string;
  /** what the dot means ("Online"), read by screen readers */
  label?: string;
  needs?: boolean;
}) => {
  const name = label ?? title;
  return (
    <span
      className={`ui-dot ${tone} ${needs ? "needs" : ""}`}
      title={title}
      role={name ? "img" : undefined}
      aria-label={name ? `${name}${needs ? ", needs you" : ""}` : undefined}
      aria-hidden={name ? undefined : true}
    />
  );
};

/**
 * A row of coloured segments (a day's health, hour by hour). Screen readers hear a count per tone ("Health: 20 good,
 * 3 warning, 1 problem"), or `label` when given.
 */
export function HealthBar({
  segments,
  labels,
  label,
}: {
  segments: Array<Tone>;
  labels?: [string, string, string];
  /** the accessible name; defaults to the count of segments per tone */
  label?: string;
}) {
  const counts = new Map<Tone, number>();
  for (const s of segments) counts.set(s, (counts.get(s) ?? 0) + 1);
  const summary = label ?? `Health: ${[...counts].map(([t, n]) => `${n} ${TONE_WORD[t] ?? t}`).join(", ") || "no data"}`;
  return (
    <div>
      <div className="ui-health" role="img" aria-label={labels ? `${summary} (${labels[0]} to ${labels[2]})` : summary}>
        {segments.map((s, i) => (
          <span key={i} className={s} />
        ))}
      </div>
      {labels && (
        <div className="ui-health-labels" aria-hidden>
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
          <span>{labels[2]}</span>
        </div>
      )}
    </div>
  );
}
