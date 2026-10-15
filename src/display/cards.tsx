import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import { type Tone } from "../core/types.js";
import { Dot, HealthBar } from "./dot.js";

/**
 * An overview card for one thing being watched (a device, a site, a job): name + type icon, status dot + sub-label, a
 * health bar over time, an optional source chip, and figures with icons. `offline` dims it and shows `offlineNote` in
 * place of the figures. With `onClick` the card is a button (Enter or Space opens it); without, it is plain content.
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
  offlineNote = "No recent activity",
  onClick,
}: {
  name: string;
  icon: LucideIcon;
  tone: Tone;
  subLabel: string;
  /** the health bar, oldest first: one tone per slot (an hour, a day) */
  segments: Array<Tone>;
  /** under the bar: start, middle, end ("24h ago", "12h", "now") */
  timeLabels: [string, string, string];
  /** where it comes from: a letter in a badge and a name */
  provider?: { initial: string; label: string };
  /** the figures along the bottom, each with an icon */
  icons: Array<{ icon: LucideIcon; label: string; value: ReactNode }>;
  offline?: boolean;
  /** shown in place of the figures while `offline` */
  offlineNote?: ReactNode;
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
          {offlineNote}
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
