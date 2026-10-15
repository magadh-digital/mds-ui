import { type ReactNode } from "react";
import { type Action } from "../core/types.js";
import { ActionConfirm } from "../overlay/confirm.js";
import { localeNumber, useKitLocale } from "../core/locale.js";

/**
 * Panel actions: at most two outlined buttons (`primary` fills the one that matters), the rest as text links
 * in a second row; `buttons` past the second join the front of that row rather than being dropped. Disabled actions carry a title that says why. An action may bring its own element
 * (a ConfirmPop) instead of an onClick.
 */
export function ActionRow({
  buttons,
  links,
}: {
  buttons: Array<Action>;
  links?: Array<Action>;
}) {
  const rest = [...buttons.slice(2), ...(links ?? [])];
  return (
    <div className="mds-vstack" style={{ gap: "var(--mds-sp-2)" }}>
      {buttons.length > 0 && (
        <div className="mds-hstack">
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
                    <button type="button"
                      className={`mds-btn ${a.primary ? "primary" : ""} ${a.danger ? "danger" : ""}`}
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
              <button type="button"
                key={a.key}
                className={`mds-btn ${a.primary ? "primary" : ""} ${a.danger ? "danger" : ""}`}
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
      {rest.length > 0 && (
        <div
          className="mds-hstack"
          style={{ flexWrap: "wrap", gap: "var(--mds-sp-3)" }}
        >
          {rest.map((a) =>
            a.element ? (
              <span key={a.key}>{a.element}</span>
            ) : a.confirm ? (
              <span key={a.key}>
                <ActionConfirm
                  a={a}
                  trigger={
                    <button type="button"
                      className="mds-link"
                      disabled={a.disabled}
                      title={a.title}
                    >
                      {a.label}
                    </button>
                  }
                />
              </span>
            ) : (
              <button type="button"
                key={a.key}
                className="mds-link"
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
 * the page): the first `primary` fills, one more is outlined, the rest are links; a `confirm`
 * asks first and names the count. `total` + `onSelectAll` offer "Select all N matching" when only a page is picked.
 * `children` is for inputs the action needs (a UTR, a note). With a DenseTable, Esc clears the selection when the panel is closed.
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
  useKitLocale(); // render again when the locale changes
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
    <span className="mds-num">
      Applies to {count} {unit}.
    </span>
  );
  const render = (a: Action, asLink: boolean) => {
    const cls = asLink
      ? "mds-link"
      : `mds-btn ${a.primary ? "primary" : ""} ${a.danger ? "danger" : ""}`;
    if (a.element) return <span key={a.key}>{a.element}</span>;
    if (a.confirm)
      return (
        <ActionConfirm
          key={a.key}
          a={a}
          extra={extra}
          trigger={
            <button type="button" className={cls} disabled={a.disabled} title={a.title}>
              {!asLink && a.icon}
              {a.label}
            </button>
          }
        />
      );
    return (
      <button type="button"
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
    <div className="mds-bulkbar" role="region" aria-label="Selection">
      <span style={{ fontWeight: 600 }} className="mds-num">
        {localeNumber(count)} {unit}
      </span>
      {summary && <span className="mds-muted mds-num">{summary}</span>}
      {total != null && total > count && onSelectAll && (
        <button type="button" className="mds-link" onClick={onSelectAll}>
          Select all {localeNumber(total)}
        </button>
      )}
      <span style={{ flex: 1 }} />
      {links.map((a) => render(a, true))}
      {children}
      {buttons.map((a) => render(a, false))}
      <button type="button" className="mds-link" onClick={onClear} title="Esc">
        Clear
      </button>
    </div>
  );
}
