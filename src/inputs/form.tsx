import { type ReactNode, useEffect, useRef, useState } from "react";
import { Term } from "../display/term";

/** Label-left / control-right row. `hint` renders the ⓘ tooltip text under the label. */
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
