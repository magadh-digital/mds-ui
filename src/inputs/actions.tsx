import { type ReactNode } from "react";
import { type Action } from "../core/types";
import { ActionConfirm } from "../overlay/confirm";

/**
 * Panel actions: at most two outlined buttons (`primary` fills the one that matters), the rest as text links
 * in a second row. Disabled actions carry a title that says why. An action may bring its own element
 * (a ConfirmPop) instead of an onClick.
 */
export function ActionRow({
  buttons,
  links,
}: {
  buttons: Array<Action>;
  links?: Array<Action>;
}) {
  return (
    <div className="vstack" style={{ gap: "var(--sp-2)" }}>
      {buttons.length > 0 && (
        <div className="hstack">
          {buttons.slice(0, 2).map((a) =>
            a.element ? (
              <span key={a.key} style={{ flex: 1, display: "flex" }}>
                {a.element}
              </span>
            ) : a.confirm ? (
              <span key={a.key} style={{ flex: 1, display: "flex" }}>
                <ActionConfirm
                  a={a}
                  trigger={
                    <button
                      className={`ui-btn ${a.primary ? "primary" : ""} ${a.danger ? "danger" : ""}`}
                      style={{ flex: 1, justifyContent: "center" }}
                      disabled={a.disabled}
                      title={a.title}
                    >
                      {a.icon}
                      {a.label}
                    </button>
                  }
                />
              </span>
            ) : (
              <button
                key={a.key}
                className={`ui-btn ${a.primary ? "primary" : ""} ${a.danger ? "danger" : ""}`}
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => void a.onClick?.()}
                disabled={a.disabled}
                title={a.title}
              >
                {a.icon}
                {a.label}
              </button>
            ),
          )}
        </div>
      )}
      {links && links.length > 0 && (
        <div
          className="hstack"
          style={{ flexWrap: "wrap", gap: "var(--sp-3)" }}
        >
          {links.map((a) =>
            a.element ? (
              <span key={a.key}>{a.element}</span>
            ) : a.confirm ? (
              <span key={a.key}>
                <ActionConfirm
                  a={a}
                  trigger={
                    <button
                      className="ui-link"
                      disabled={a.disabled}
                      title={a.title}
                    >
                      {a.label}
                    </button>
                  }
                />
              </span>
            ) : (
              <button
                key={a.key}
                className="ui-link"
                onClick={() => void a.onClick?.()}
                disabled={a.disabled}
                title={a.title}
              >
                {a.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Shown above the table while rows are selected. `actions` are the ones every selected row shares (see
 * `commonActions` in listpage.tsx): the first `primary` fills, one more is outlined, the rest are links; a `confirm`
 * asks first and names the count. `total` + `onSelectAll` offer "Select all N matching" when only a page is picked.
 * `children` is for inputs the action needs (a UTR, a note). Esc clears the selection when the panel is closed.
 */
export function BulkBar({
  count,
  total,
  onSelectAll,
  summary,
  actions,
  children,
  onClear,
  unit = "selected",
}: {
  count: number;
  total?: number;
  onSelectAll?: () => void;
  summary?: ReactNode;
  actions?: Array<Action>;
  children?: ReactNode;
  onClear: () => void;
  unit?: string;
}) {
  if (count === 0) return null;
  const list = (actions ?? []).filter(
    (a) => a.onClick || a.confirm || a.element,
  );
  const buttons = [
    ...list.filter((a) => a.primary),
    ...list.filter((a) => !a.primary),
  ].slice(0, 2);
  const links = list.filter((a) => !buttons.includes(a));
  const extra = (
    <span className="ui-num">
      Applies to {count} {unit}.
    </span>
  );
  const render = (a: Action, asLink: boolean) => {
    const cls = asLink
      ? "ui-link"
      : `ui-btn ${a.primary ? "primary" : ""} ${a.danger ? "danger" : ""}`;
    if (a.element) return <span key={a.key}>{a.element}</span>;
    if (a.confirm)
      return (
        <ActionConfirm
          key={a.key}
          a={a}
          extra={extra}
          trigger={
            <button className={cls} disabled={a.disabled} title={a.title}>
              {!asLink && a.icon}
              {a.label}
            </button>
          }
        />
      );
    return (
      <button
        key={a.key}
        className={cls}
        onClick={() => void a.onClick?.()}
        disabled={a.disabled}
        title={a.title}
      >
        {!asLink && a.icon}
        {a.label}
      </button>
    );
  };
  return (
    <div className="bulkbar" role="region" aria-label="Selection">
      <span style={{ fontWeight: 600 }} className="ui-num">
        {count.toLocaleString("en-IN")} {unit}
      </span>
      {summary && <span className="ui-muted ui-num">{summary}</span>}
      {total != null && total > count && onSelectAll && (
        <button className="ui-link" onClick={onSelectAll}>
          Select all {total.toLocaleString("en-IN")}
        </button>
      )}
      <span style={{ flex: 1 }} />
      {links.map((a) => render(a, true))}
      {children}
      {buttons.map((a) => render(a, false))}
      <button className="ui-link" onClick={onClear} title="Esc">
        Clear
      </button>
    </div>
  );
}
