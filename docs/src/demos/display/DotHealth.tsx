// demo: Dot in every tone, the "needs you" ring, and a HealthBar for a day
import { Dot, HealthBar, type Tone } from "@mds/ui";

// one segment per hour, midnight to midnight
const DAY: Array<Tone> = [
  ...Array<Tone>(7).fill("neutral"),
  "ok", "ok", "ok", "warn", "ok", "ok", "ok", "error", "error", "ok", "ok", "ok", "warn",
  ...Array<Tone>(4).fill("neutral"),
];

export default function DotHealth() {
  return (
    <div className="mds-vstack" style={{ gap: 16, maxWidth: 420 }}>
      <div className="mds-hstack" style={{ gap: 16, flexWrap: "wrap" }}>
        <span className="mds-hstack"><Dot tone="ok" /> Online</span>
        <span className="mds-hstack"><Dot tone="warn" /> Slow</span>
        <span className="mds-hstack"><Dot tone="error" /> Offline</span>
        <span className="mds-hstack"><Dot tone="accent" /> Weighing</span>
        <span className="mds-hstack"><Dot tone="neutral" /> No data</span>
        <span className="mds-hstack"><Dot tone="warn" needs label="Approval waiting" /> PO-3310</span>
      </div>
      <HealthBar segments={DAY} labels={["00:00", "12:00", "24:00"]} />
    </div>
  );
}
