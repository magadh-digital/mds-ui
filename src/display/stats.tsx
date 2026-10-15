/**
 * A page's headline figures inline in its Toolbar (the children slot, before the buttons): "12 present · 3 absent".
 * A figure with `onClick` is a button (a filter shortcut). Pages never put a band of figures above the table.
 */
import type { ReactNode } from "react";
import type { Tone } from "../core/types";

export type ToolbarStat = {
  label: string;
  value: ReactNode;
  /** a muted part after the value ("/ 40") */
  sub?: ReactNode;
  tone?: Tone;
  title?: string;
  key?: string;
  onClick?: () => void;
};

export function ToolbarStats({ items }: { items: Array<ToolbarStat> }) {
  if (!items.length) return null;
  return (
    <div className="ui-tstats">
      {items.map((t) => {
        const body = (
          <>
            <span className={`ui-tstat-v ui-num ${t.tone ?? ""}`}>
              {t.value}
              {t.sub != null && <span className="ui-tstat-s">{t.sub}</span>}
            </span>
            <span className="ui-tstat-l">{t.label}</span>
          </>
        );
        return t.onClick ? (
          <button key={t.key ?? t.label} type="button" className="ui-tstat" title={t.title} onClick={t.onClick}>
            {body}
          </button>
        ) : (
          <span key={t.key ?? t.label} className="ui-tstat" title={t.title}>
            {body}
          </span>
        );
      })}
    </div>
  );
}
