import { type LucideIcon } from "lucide-react";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { date } from "../core/date.js";
import { type Tone } from "../core/types.js";
import { HealthBar } from "./dot.js";

/**
 * Chart pieces drawn as plain SVG (no chart library): an area/line chart with a faint grid and no title,
 * stacked per-entity health timelines, and the horizontal icon strip of "top" tiles.
 */

export type SeriesLine = {
  key: string;
  label: string;
  /** a CSS colour; the theme's chart colours by default */
  color?: string;
  points: Array<{ x: string; y: number }>;
};

const fmtShort = (v: number) =>
  Math.abs(v) >= 1000
    ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`
    : Number.isInteger(v)
      ? String(v)
      : v.toFixed(1);

const ISO_DAY = /^\d{4}-\d{2}-\d{2}/;
/** "2026-10-15" → "15 Oct"; anything else as it is */
const defaultFormatX = (x: string) => (ISO_DAY.test(x) ? date(x.slice(0, 10)).format("DD MMM") : x);

// series colours from the theme (light and dark), never fixed hex
const PALETTE = [
  "var(--mds-c-accent)",
  "var(--mds-c-ok)",
  "var(--mds-c-warn)",
  "var(--mds-c-error)",
  "var(--mds-c-purple)",
  "color-mix(in srgb, var(--mds-c-accent) 55%, var(--mds-c-ok))",
  "color-mix(in srgb, var(--mds-c-error) 55%, var(--mds-c-purple))",
];

/** the element's width in px, following resizes (800 until it is measured); a callback ref, so it also catches an
 * element that appears after the first render (the chart once its data arrives) */
function useWidth<T extends HTMLElement>() {
  const [w, setW] = useState(800);
  const ro = useRef<ResizeObserver | null>(null);
  const ref = useCallback((el: T | null) => {
    ro.current?.disconnect();
    ro.current = null;
    if (!el || typeof ResizeObserver === "undefined") return;
    const o = new ResizeObserver(([e]) => {
      const next = Math.round(e!.contentRect.width);
      if (next > 0) setW(next);
    });
    o.observe(el);
    ro.current = o;
  }, []);
  return [ref, w] as const;
}

/**
 * Several series on one x axis. The x values are labels in order: day strings ("2026-10-15") are sorted and read
 * "15 Oct"; anything else keeps the order it first appears in (`formatX` changes how a label reads). A missing point
 * counts as 0. Hover shows the values under the pointer.
 */
export function SeriesChart({
  series,
  height = 220,
  unit = "",
  empty = "No data in this range.",
  label = "Chart",
  formatX = defaultFormatX,
}: {
  series: Array<SeriesLine>;
  height?: number;
  /** after each value in the legend ("kg", " trips") */
  unit?: string;
  empty?: string;
  /** the chart's accessible name ("Orders per day") */
  label?: string;
  /** how an x value reads on the axis and in the legend */
  formatX?: (x: string) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [box, W] = useWidth<HTMLDivElement>();
  const days = useMemo(() => {
    const xs = Array.from(new Set(series.flatMap((s) => s.points.map((p) => p.x))));
    return xs.every((v) => ISO_DAY.test(v)) ? xs.sort() : xs;
  }, [series]);
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
  if (!days.length) return <div className="mds-empty">{empty}</div>;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * niceMax);
  // about one label per 90 px of width
  const labelEvery = Math.max(1, Math.ceil(days.length / Math.max(2, Math.floor((W - padL - padR) / 90))));
  const step = (W - padL - padR) / Math.max(1, days.length - 1);
  return (
    <div className="mds-chart" ref={box} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} style={{ display: "block", width: "100%", height }}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--mds-c-border)" strokeWidth="1" />
            <text x={padL - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--mds-c-muted)">
              {fmtShort(t)}
            </text>
          </g>
        ))}
        {days.map((d, i) =>
          i % labelEvery === 0 ? (
            <text key={d} x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--mds-c-muted)">
              {formatX(d)}
            </text>
          ) : null,
        )}
        {series.map((s, si) => {
          const map = new Map(s.points.map((p) => [p.x, p.y]));
          const pts = days.map((d, i) => [x(i), y(map.get(d) ?? 0)] as const);
          const color = s.color ?? PALETTE[si % PALETTE.length];
          const line = pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
          const area = `${line} L${pts[pts.length - 1]![0].toFixed(1)},${y(0)} L${pts[0]![0].toFixed(1)},${y(0)} Z`;
          return (
            <g key={s.key}>
              {series.length === 1 && <path d={area} fill={color} fillOpacity="0.08" />}
              <path d={line} fill="none" stroke={color} strokeWidth="1.6" />
            </g>
          );
        })}
        {hover != null && (
          <line x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} stroke="var(--mds-c-muted)" strokeDasharray="3 3" />
        )}
        {days.map((d, i) => (
          <rect
            key={d}
            x={days.length <= 1 ? padL : x(i) - step / 2}
            y={padT}
            width={days.length <= 1 ? W - padL - padR : step}
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
              <span className="swatch" style={{ background: s.color ?? PALETTE[si % PALETTE.length] }} />
              {s.label}
              <span className="mds-num mds-muted">
                {hover != null ? `${formatX(days[hover]!)} · ` : "total "}
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

/** One health timeline per row (a site, a device, a job); a row with `onOpen` has a chevron and opens on a click, Enter or Space. */
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

/** Horizontal strip of tiles: a count above the icon, a truncated label below; a tile with `onClick` is a button. */
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
        {items.map((i) => {
          const body = (
            <>
              <span className="mds-tile-value mds-num">{i.value}</span>
              <Icon aria-hidden />
              <span className="mds-tile-label">{i.label}</span>
            </>
          );
          // a tile is a button only when it does something
          return i.onClick ? (
            <button type="button" key={i.key} className="mds-tile" onClick={i.onClick} title={i.label}>
              {body}
            </button>
          ) : (
            <span key={i.key} className="mds-tile static" title={i.label}>
              {body}
            </span>
          );
        })}
      </div>
    </div>
  );
}
