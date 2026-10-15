import { type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Term } from "../display/term.js";
import { FieldContext, joinIds } from "./field.js";

/**
 * Label-left / control-right row. The label names the kit control inside (Input, Select, Textarea, Autocomplete,
 * DateInput, FileInput) and `hint` / `error` describe it (aria-describedby); an `error` marks it invalid. For a control
 * that is not the kit's, pass its id as `htmlFor`.
 */
export function FormRow({
  label,
  hint,
  required,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  /** the id of the control the label names, when it is not a kit control */
  htmlFor?: string;
  children: ReactNode;
}) {
  const base = useId();
  const labelId = `${base}-label`;
  const hintId = `${base}-hint`;
  const errorId = `${base}-error`;
  const [controls, setControls] = useState<Array<string>>([]);
  const register = useCallback((id: string) => {
    setControls((c) => (c.includes(id) ? c : [...c, id]));
    return () => setControls((c) => c.filter((x) => x !== id));
  }, []);
  const field = useMemo(
    () => ({ labelId, describedBy: joinIds(hint && hintId, error && errorId), invalid: !!error, register }),
    [labelId, hint, hintId, error, errorId, register],
  );
  return (
    <div className={`frow-f ${error ? "has-error" : ""}`}>
      <div className="frow-label">
        <label id={labelId} htmlFor={htmlFor ?? controls[0]}>
          <Term label={label} />
          {required && (
            <span className="ui-muted" aria-hidden>
              {" "}*
            </span>
          )}
          {required && <span className="sr-only"> (required)</span>}
        </label>
        {hint && (
          <span className="frow-hint" id={hintId}>
            {hint}
          </span>
        )}
      </div>
      <div className="frow-control">
        <FieldContext.Provider value={field}>{children}</FieldContext.Provider>
        {error && (
          <div className="ui-error" id={errorId}>
            {error}
          </div>
        )}
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
        type="button"
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
                    type="button"
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

/**
 * A text input that reports its value on blur or Enter, for inline edits in rows. A new `value` from the caller shows
 * only while the field is not being edited, so a refetch never overwrites what is being typed.
 */
export function InlineInput({
  value,
  onCommit,
  placeholder,
  type = "text",
  width,
  label,
}: {
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "password";
  width?: string;
  /** the accessible name, when no visible label names the field */
  label?: string;
}) {
  const [v, setV] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  const editing = useRef(false);
  useEffect(() => {
    if (!editing.current) setV(value);
  }, [value]);
  return (
    <input
      ref={ref}
      className="ui-input"
      style={width ? { width } : undefined}
      type={type}
      value={v}
      placeholder={placeholder}
      aria-label={label}
      onFocus={() => {
        editing.current = true;
      }}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => {
        editing.current = false;
        if (v !== value) onCommit(v);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") ref.current?.blur();
        if (e.key === "Escape") setV(value);
      }}
    />
  );
}
