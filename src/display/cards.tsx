import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import { type Tone } from "../core/types.js";
import { Dot, HealthBar } from "./dot.js";

/**
 * An overview card: name + type icon, status dot + sub-label, 24h health bar, provider chip, capability icons. With
 * `onClick` the card is a button (Enter or Space opens it); without, it is plain content.
 */
export function EntityCard({
  name,
  icon: Icon,
  tone,
  subLabel,
  segments,
  timeLabels,
  provider,
  icons,
  offline,
  onClick,
}: {
  name: string;
  icon: LucideIcon;
  tone: Tone;
  subLabel: string;
  segments: Array<Tone>;
  timeLabels: [string, string, string];
  provider?: { initial: string; label: string };
  icons: Array<{ icon: LucideIcon; label: string; value: ReactNode }>;
  offline?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`mds-card mds-ecard ${offline ? "offline" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="name">
        {name} <Icon aria-hidden />
      </div>
      <div className={`sub ${offline ? "mds-dim" : ""}`}>
        <Dot tone={tone} /> {subLabel}
      </div>
      <HealthBar segments={segments} labels={timeLabels} />
      {provider && (
        <div className={`prov ${offline ? "mds-dim" : ""}`}>
          <span className="logo">{provider.initial}</span> {provider.label}
        </div>
      )}
      {offline ? (
        <div
          className="mds-muted"
          style={{
            fontSize: "var(--mds-fs-sm)",
            borderTop: "1px solid var(--mds-c-border)",
            paddingTop: "var(--mds-sp-2)",
          }}
        >
          Quiet
        </div>
      ) : (
        <div className="icons">
          {icons.map((i) => {
            const I = i.icon;
            return (
              <span key={i.label} title={i.label}>
                <I aria-label={i.label} role="img" /> {i.value}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
