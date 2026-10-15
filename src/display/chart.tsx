import { type LucideIcon } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { type Tone } from "../core/types.js";
import { HealthBar } from "./dot.js";

/**
 * Chart pieces drawn as plain SVG (no chart library): an area/line chart with a faint grid and no title,
 * stacked per-entity health timelines, and the horizontal icon strip of "top" tiles.
 */

export type SeriesLine = {
  key: string;
  label: string;
  color?: string;
  points: Array<{ x: string; y: number }>;
};

const fmtShort = (v: number) =>
  Math.abs(v) >= 1000
    ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`
    : Number.isInteger(v)
      ? String(v)
      : v.toFixed(1);

/** Several series on one x axis (day strings, sorted). Hover shows the values of the day under the cursor. */
export function SeriesChart({
  series,
  height = 220,
  unit = "",
  empty = "No data in this range.",
}: {
  series: Array<SeriesLine>;
  height?: number;
  unit?: string;
  empty?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const days = useMemo(
    () =>
      Array.from(
        new Set(series.flatMap((s) => s.points.map((p) => p.x))),
      ).sort(),
    [series],
  );
  const W = 800;
  const H = height;
  const padL = 44;
  const padR = 12;
  const padT = 10;
  const padB = 24;
  const max = Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.y)));
  const niceMax = (() => {
    const p = 10 ** Math.floor(Math.log10(max));
    const m = max / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
  })();
  const x = (i: number) =>
    padL +
    (days.length <= 1
      ? (W - padL - padR) / 2
      : (i * (W - padL - padR)) / (days.length - 1));
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / niceMax);
  const palette = [
    "var(--mds-c-accent)",
    "var(--mds-c-ok)",
    "var(--mds-c-warn)",
    "var(--mds-c-error)",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
  ];
  if (!days.length) return <div className="mds-empty">{empty}</div>;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * niceMax);
  const labelEvery = Math.max(1, Math.ceil(days.length / 8));
  return (
    <div className="mds-chart" onMouseLeave={() => setHover(null)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Series chart"
        style={{ width: "100%", height }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--mds-c-border)"
              strokeWidth="1"
            />
            <text
              x={padL - 6}
              y={y(t) + 4}
              textAnchor="end"
              fontSize="11"
              fill="var(--mds-c-muted)"
            >
              {fmtShort(t)}
            </text>
          </g>
        ))}
        {days.map((d, i) =>
          i % labelEvery === 0 ? (
            <text
              key={d}
              x={x(i)}
              y={H - 6}
              textAnchor="middle"
              fontSize="11"
              fill="var(--mds-c-muted)"
            >
              {d.slice(5)}
            </text>
          ) : null,
        )}
        {series.map((s, si) => {
          const map = new Map(s.points.map((p) => [p.x, p.y]));
          const pts = days.map((d, i) => [x(i), y(map.get(d) ?? 0)] as const);
          const color = s.color ?? palette[si % palette.length];
          const line = pts
            .map(
              ([px, py], i) =>
                `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`,
            )
            .join(" ");
          const area = `${line} L${pts[pts.length - 1]![0].toFixed(1)},${y(0)} L${pts[0]![0].toFixed(1)},${y(0)} Z`;
          return (
            <g key={s.key}>
              {series.length === 1 && (
                <path d={area} fill={color} fillOpacity="0.08" />
              )}
              <path
                d={line}
                fill="none"
                stroke={color}
                strokeWidth="1.6"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}
        {hover != null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={padT}
            y2={H - padB}
            stroke="var(--mds-c-muted)"
            strokeDasharray="3 3"
          />
        )}
        {days.map((d, i) => (
          <rect
            key={d}
            x={x(i) - (W - padL - padR) / Math.max(1, days.length - 1) / 2}
            y={padT}
            width={(W - padL - padR) / Math.max(1, days.length - 1) || W}
            height={H - padT - padB}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>
      <div className="mds-chart-legend">
        {series.map((s, si) => {
          const v =
            hover != null
              ? (s.points.find((p) => p.x === days[hover])?.y ?? 0)
              : s.points.reduce((a, p) => a + p.y, 0);
          return (
            <span key={s.key} className="mds-chart-key">
              <span
                className="swatch"
                style={{ background: s.color ?? palette[si % palette.length] }}
              />
              {s.label}
              <span className="mds-num mds-muted">
                {hover != null ? `${days[hover]} · ` : "total "}
                {fmtShort(v)}
                {unit}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** One health timeline per entity (site, transporter…), each with a chevron to open it (a click, Enter or Space). */
export function Timelines({
  rows,
  labels,
}: {
  rows: Array<{
    key: string;
    label: ReactNode;
    segments: Array<Tone>;
    onOpen?: () => void;
    right?: ReactNode;
  }>;
  labels?: [string, string, string];
}) {
  return (
    <div className="mds-timelines">
      {rows.map((r) => (
        <div
          key={r.key}
          className={`mds-timeline ${r.onOpen ? "clickable" : ""}`}
          onClick={r.onOpen}
          role={r.onOpen ? "button" : undefined}
          tabIndex={r.onOpen ? 0 : undefined}
          onKeyDown={
            r.onOpen
              ? (e) => {
                  if (e.target !== e.currentTarget) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    r.onOpen!();
                  }
                }
              : undefined
          }
        >
          <span className="mds-tl-label">{r.label}</span>
          <span>
            <HealthBar segments={r.segments} labels={labels} />
          </span>
          <span className="mds-tl-right mds-num mds-muted">{r.right}</span>
          {r.onOpen && <span className="mds-chev" aria-hidden />}
        </div>
      ))}
    </div>
  );
}

/** Horizontal strip of 40 px tiles: a count above, a truncated label below. */
export function IconStrip({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: Array<{
    key: string;
    label: string;
    value: ReactNode;
    onClick?: () => void;
  }>;
  icon: LucideIcon;
}) {
  return (
    <div className="mds-strip">
      <div className="mds-label">{title}</div>
      <div className="mds-strip-tiles">
        {items.length === 0 && <span className="mds-muted">—</span>}
        {items.map((i) => (
          <button
            type="button"
            key={i.key}
            className="mds-tile"
            onClick={i.onClick}
            title={i.label}
          >
            <span className="mds-tile-value mds-num">{i.value}</span>
            <Icon aria-hidden />
            <span className="mds-tile-label">{i.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
