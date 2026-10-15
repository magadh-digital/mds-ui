import { type LucideIcon } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { type Tone } from "../core/types";
import { HealthBar } from "./dot";

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
    "var(--c-accent)",
    "var(--c-ok)",
    "var(--c-warn)",
    "var(--c-error)",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
  ];
  if (!days.length) return <div className="ui-empty">{empty}</div>;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * niceMax);
  const labelEvery = Math.max(1, Math.ceil(days.length / 8));
  return (
    <div className="chart" onMouseLeave={() => setHover(null)}>
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
              stroke="var(--c-border)"
              strokeWidth="1"
            />
            <text
              x={padL - 6}
              y={y(t) + 4}
              textAnchor="end"
              fontSize="11"
              fill="var(--c-muted)"
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
              fill="var(--c-muted)"
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
            stroke="var(--c-muted)"
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
      <div className="chart-legend">
        {series.map((s, si) => {
          const v =
            hover != null
              ? (s.points.find((p) => p.x === days[hover])?.y ?? 0)
              : s.points.reduce((a, p) => a + p.y, 0);
          return (
            <span key={s.key} className="chart-key">
              <span
                className="swatch"
                style={{ background: s.color ?? palette[si % palette.length] }}
              />
              {s.label}
              <span className="ui-num ui-muted">
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

/** One health timeline per entity (site, transporter…), each with a chevron to open it. */
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
    <div className="timelines">
      {rows.map((r) => (
        <div
          key={r.key}
          className={`timeline ${r.onOpen ? "clickable" : ""}`}
          onClick={r.onOpen}
        >
          <span className="tl-label">{r.label}</span>
          <span className="tl-bar">
            <HealthBar segments={r.segments} labels={labels} />
          </span>
          <span className="tl-right ui-num ui-muted">{r.right}</span>
          {r.onOpen && <span className="chev" />}
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
    <div className="strip">
      <div className="ui-label">{title}</div>
      <div className="strip-tiles">
        {items.length === 0 && <span className="ui-muted">—</span>}
        {items.map((i) => (
          <button
            key={i.key}
            className="tile"
            onClick={i.onClick}
            title={i.label}
          >
            <span className="tile-value ui-num">{i.value}</span>
            <Icon />
            <span className="tile-label">{i.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
