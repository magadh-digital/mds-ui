import { Term } from "./term";
import type { MenuAnchor } from "./menu";
/**
 * Pattern F pieces (label-left rows, dirty save bar), the confirm popover, the panel action row,
 * the bulk-selection bar, a mini table and the settings section card. All sizes come from tokens.css.
 */
import { AlertTriangle, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ColumnDef, SortingState, VisibilityState } from "@tanstack/react-table";
import { DenseTable } from "./table";
import { Pop } from "./primitives";

/** Label-left / control-right row (guide §4.F). `hint` renders the ⓘ tooltip text under the label. */
export function FormRow({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className={`frow-f ${error ? "has-error" : ""}`}>
      <div className="frow-label">
        <span>
          <Term label={label} />
          {required && <span className="ui-muted"> *</span>}
        </span>
        {hint && <span className="frow-hint">{hint}</span>}
      </div>
      <div className="frow-control">
        {children}
        {error && <div className="ui-error">{error}</div>}
      </div>
    </div>
  );
}

/** Appears only while the form is dirty; the single filled button on the screen. */
export function SaveBar({
  dirty,
  saving,
  onSave,
  onReset,
  label = "Save changes",
}: {
  dirty: boolean;
  saving?: boolean;
  onSave: () => void;
  onReset: () => void;
  label?: string;
}) {
  if (!dirty) return null;
  return (
    <div className="savebar">
      <span className="ui-muted">Unsaved changes</span>
      <span style={{ flex: 1 }} />
      <button
        type="button"
        className="ui-link"
        onClick={onReset}
        disabled={saving}
      >
        Discard
      </button>
      <button
        type="button"
        className="ui-btn primary"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? "Saving…" : label}
      </button>
    </div>
  );
}

/**
 * Destructive or irreversible actions ask in a small popover (guide §5.4), optionally with a reason.
 * `trigger` is the link/button that opens it.
 */
export function ConfirmPop({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  reason,
  danger,
  typed,
  onConfirm,
  placement = "bottom-end",
}: {
  trigger: ReactNode;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  reason?: { label: string; required?: boolean };
  danger?: boolean;
  /** the word the person must type to enable the button (a destructive delete: "DELETE") */
  typed?: string;
  onConfirm: (reason: string) => void | Promise<void>;
  placement?: "bottom-end" | "bottom-start" | "top-start";
}) {
  const [text, setText] = useState("");
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Pop
      trigger={trigger}
      placement={placement}
      width="calc(var(--panel-w) * 0.8)"
    >
      <div className="confirm">
        <div className="confirm-title">
          {danger && <AlertTriangle />}
          {title}
        </div>
        {description && <div className="ui-muted">{description}</div>}
        {reason && (
          <textarea
            className="ui-input ui-textarea"
            placeholder={reason.label}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
          />
        )}
        {typed && (
          <input
            className="ui-input"
            placeholder={`Type ${typed} to confirm`}
            aria-label={`Type ${typed} to confirm`}
            value={word}
            onChange={(e) => setWord(e.target.value)}
            autoFocus
          />
        )}
        <div className="hstack" style={{ justifyContent: "flex-end" }}>
          <button
            className={`ui-btn ${danger ? "danger" : ""}`}
            disabled={
              busy ||
              (reason?.required && !text.trim()) ||
              (!!typed && word.trim() !== typed)
            }
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm(text.trim());
                setText("");
                setWord("");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </Pop>
  );
}

/** What a confirm asks; the same spec drives ConfirmPop (panel, bulk bar) and the inline confirm of the context menu. */
export type ConfirmSpec = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  reason?: { label: string; required?: boolean };
  /** the word to type before the button enables (destructive deletes: "DELETE") */
  typed?: string;
};

/**
 * One action model for three surfaces: the panel's ActionRow, the row's context menu and the BulkBar. `confirm` makes the
 * surface ask first (the reason, if any, reaches onClick); `element` is an escape hatch for the panel only.
 */
export type Action = {
  key: string;
  label: string;
  onClick?: (reason?: string) => void | Promise<unknown>;
  disabled?: boolean;
  title?: string;
  primary?: boolean;
  danger?: boolean;
  icon?: ReactNode;
  /** the icon for menus (a lucide component) */ lucide?: LucideIcon;
  confirm?: ConfirmSpec;
  element?: ReactNode;
};

/** The confirm popover for an action that carries a `confirm` spec; `trigger` is the button or link. */
export function ActionConfirm({
  a,
  trigger,
  extra,
}: {
  a: Action;
  trigger: ReactNode;
  extra?: ReactNode;
}) {
  const c = a.confirm!;
  return (
    <ConfirmPop
      trigger={trigger}
      title={c.title}
      description={
        extra ? (
          <>
            {c.description}
            {c.description ? " " : ""}
            {extra}
          </>
        ) : (
          c.description
        )
      }
      confirmLabel={c.confirmLabel}
      reason={c.reason}
      typed={c.typed}
      danger={c.danger ?? a.danger}
      onConfirm={(r) => Promise.resolve(a.onClick?.(r)).then(() => undefined)}
    />
  );
}

/**
 * Panel actions: at most two outlined buttons (`primary` fills the one that matters), the rest as text links
 * in a second row. Disabled actions carry a title that says why (guide §4.D). An action may bring its own element
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
 * Pattern K: shown above the table while rows are selected. `actions` are the ones every selected row shares (see
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

export type MiniCol<T> = {
  key: string;
  header: string;
  align?: "right" | "acts";
  cell: (row: T) => ReactNode;
  width?: string;
};

/**
 * A small, already-loaded table inside a panel, form or settings card. It is the page table (`DenseTable`) in its
 * `bare` mode, so panels and pages share one table: the same cells, chips, row menu and highlights, with compact rows
 * and no pager, sorting or column menu. Columns are plain `{ key, header, cell }`.
 */
export function MiniTable<T>({
  rows,
  cols,
  rowKey,
  empty = "Nothing here.",
  onRowClick,
  onRowContextMenu,
  className,
  rowClassName,
}: {
  rows: Array<T>;
  cols: Array<MiniCol<T>>;
  rowKey: (r: T) => string;
  /** the empty row's text; `null` shows no row at all */
  empty?: ReactNode;
  onRowClick?: (r: T) => void;
  /** `rows2` for two-line rows */
  className?: string;
  /** right-click or the `.` key on a row opens the same menu kit as the page tables (pattern J) */
  onRowContextMenu?: (r: T, at: MenuAnchor) => void;
  /** a class per row (`warn`, `error`, `on`): highlights a suspect or picked row */
  rowClassName?: (r: T) => string;
}) {
  const columns = useMemo<Array<ColumnDef<T, unknown>>>(
    () =>
      cols.map((c) => ({
        id: c.key,
        header: () => <Term label={c.header} />,
        cell: ({ row }) => c.cell(row.original),
        enableSorting: false,
        enableResizing: false,
        meta: {
          align: c.align ? "right" : "left",
          cls: c.align === "acts" ? "acts" : undefined,
        },
        ...(c.width ? { size: parseInt(c.width, 10) || undefined } : {}),
      })),
    [cols],
  );
  const twoLine = /\brows2\b/.test(className ?? "");
  if (rows.length === 0 && empty === null) return null;
  return (
    <DenseTable<T>
      bare
      label="mini"
      columns={columns}
      data={rows}
      getRowId={rowKey}
      sorting={NO_SORT}
      onSortingChange={noop}
      pagination={{ pageIndex: 0, pageSize: Math.max(rows.length, 1) }}
      onPaginationChange={noop}
      manual
      rowCount={rows.length}
      columnVisibility={NO_HIDDEN}
      loading={false}
      emptyText={empty}
      onRowClick={onRowClick}
      onRowContextMenu={onRowContextMenu}
      rowClassName={rowClassName}
      lines={twoLine ? 2 : 1}
      className={`mini-table ${(className ?? "").replace(/\brows2\b/, "").trim()}`.trim()}
      enableColumnResizing={false}
    />
  );
}
const NO_SORT: SortingState = [];
const NO_HIDDEN: VisibilityState = {};
const noop = () => {};

export function SettingsSection({
  title,
  description,
  links,
  defaultOpen = true,
  children,
}: {
  title: string;
  description?: string;
  links?: Array<{
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    title?: string;
  }>;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="ui-card ssec">
      <button
        className="ssec-head"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="ssec-title">{title}</span>
        {description && <span className="ui-muted">{description}</span>}
        <span style={{ flex: 1 }} />
        <span className={`chev ${open ? "open" : ""}`} />
      </button>
      {open && (
        <div className="ssec-body">
          {children}
          {links && links.length > 0 && (
            <div className="ssec-links">
              {links.map((l, i) => (
                <span key={l.label}>
                  {i > 0 && <span className="ui-muted"> | </span>}
                  <button
                    className="ui-link"
                    onClick={l.onClick}
                    disabled={l.disabled}
                    title={l.title}
                  >
                    {l.label}
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** A text input that reports its value on blur or Enter, for inline edits in rows. */
export function InlineInput({
  value,
  onCommit,
  placeholder,
  type = "text",
  width,
}: {
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "password";
  width?: string;
}) {
  const [v, setV] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => setV(value), [value]);
  return (
    <input
      ref={ref}
      className="ui-input"
      style={width ? { width } : undefined}
      type={type}
      value={v}
      placeholder={placeholder}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v !== value && onCommit(v)}
      onKeyDown={(e) => {
        if (e.key === "Enter") ref.current?.blur();
        if (e.key === "Escape") setV(value);
      }}
    />
  );
}
