import { type Tone } from "../core/types";

/** the status dot; `needs` draws the "needs you" ring around it (a person's input is what the row waits for) */
export const Dot = ({
  tone = "neutral",
  title,
  needs,
}: {
  tone?: Tone;
  title?: string;
  needs?: boolean;
}) => (
  <span className={`ui-dot ${tone} ${needs ? "needs" : ""}`} title={title} />
);

export function HealthBar({
  segments,
  labels,
}: {
  segments: Array<Tone | "neutral">;
  labels?: [string, string, string];
}) {
  return (
    <div>
      <div className="ui-health">
        {segments.map((s, i) => (
          <span key={i} className={s} />
        ))}
      </div>
      {labels && (
        <div className="ui-health-labels">
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
          <span>{labels[2]}</span>
        </div>
      )}
    </div>
  );
}
