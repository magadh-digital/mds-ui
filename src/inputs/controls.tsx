/**
 * The basic controls as components, so an app never has to know the kit's class names: Button, IconButton, LinkButton,
 * Input, Select, Textarea, Checkbox. Each takes the native element's props (and `ref`) plus a few of its own.
 *
 * `invalid` marks a field as wrong: the class `invalid` (red border) and `aria-invalid`. Inside a FormRow the row's
 * label names the field, its hint / error describe it, and a row with an `error` marks it invalid.
 */
import { Loader2 } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  Ref,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { localeNumber, useKitLocale } from "../core/locale.js";
import { joinIds, useFieldControl } from "./field.js";

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** outline (default), the one filled `primary` action of a view, or `danger` for destructive ones */
  variant?: "outline" | "primary" | "danger";
  size?: "md" | "sm";
  /** an icon before the label (a lucide icon element) */
  icon?: ReactNode;
  /** shows a spinner and blocks clicks while an action runs */
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
};
export function Button({ variant = "outline", size = "md", icon, loading, className, children, disabled, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx("mds-btn", variant !== "outline" && variant, size === "sm" && "sm", className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 className="mds-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** what it does, read by screen readers and shown on hover */
  label: string;
  children: ReactNode;
  size?: "md" | "sm";
  danger?: boolean;
  active?: boolean;
  ref?: Ref<HTMLButtonElement>;
};
/** An icon-only button; `label` names it. */
export function IconButton({ label, size = "md", danger, active, className, children, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={rest.title ?? label}
      aria-pressed={active ?? undefined}
      className={cx("mds-iconbtn", size === "sm" && "sm", danger && "danger", active && "active", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/** A button that reads like a link (a quiet action inside text or a footer). */
export function LinkButton({ className, type = "button", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { ref?: Ref<HTMLButtonElement> }) {
  return <button type={type} className={cx("mds-link", className)} {...rest} />;
}

/** the id, invalid state and aria-describedby a field control gets from its props and the FormRow around it */
function useFieldProps(id: string | undefined, invalid: boolean | undefined, describedBy: string | undefined) {
  const { id: own, field } = useFieldControl(id);
  const bad = invalid ?? field?.invalid ?? false;
  return { id: own, bad, describedBy: joinIds(describedBy, field?.describedBy) };
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** marks the field as wrong (red border, aria-invalid) */
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
};
export function Input({ invalid, className, id, "aria-describedby": describedBy, ...rest }: InputProps) {
  const f = useFieldProps(id, invalid, describedBy);
  return (
    <input
      id={f.id}
      className={cx("mds-input", f.bad && "invalid", className)}
      aria-invalid={f.bad || undefined}
      aria-describedby={f.describedBy}
      {...rest}
    />
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean; ref?: Ref<HTMLTextAreaElement> };
export function Textarea({ invalid, className, rows = 3, id, "aria-describedby": describedBy, ...rest }: TextareaProps) {
  const f = useFieldProps(id, invalid, describedBy);
  return (
    <textarea
      rows={rows}
      id={f.id}
      className={cx("mds-input mds-textarea", f.bad && "invalid", className)}
      aria-invalid={f.bad || undefined}
      aria-describedby={f.describedBy}
      {...rest}
    />
  );
}

export type SelectOption = { value: string; label: string; disabled?: boolean };
type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  /** the choices; or pass <option> children */
  options?: Array<SelectOption>;
  /** a first, empty choice ("All", "Pick one…") */
  placeholder?: string;
  invalid?: boolean;
  children?: ReactNode;
  ref?: Ref<HTMLSelectElement>;
};
/** A short fixed list (5 or more choices; 2–4 is a ToggleGroup, a searchable list an Autocomplete). */
export function Select({ options, placeholder, invalid, className, children, id, "aria-describedby": describedBy, ...rest }: SelectProps) {
  const f = useFieldProps(id, invalid, describedBy);
  return (
    <select
      id={f.id}
      className={cx("mds-select", f.bad && "invalid", className)}
      aria-invalid={f.bad || undefined}
      aria-describedby={f.describedBy}
      {...rest}
    >
      {placeholder != null && <option value="">{placeholder}</option>}
      {options?.map((o) => (
        <option key={o.value} value={o.value} disabled={o.disabled}>
          {o.label}
        </option>
      ))}
      {children}
    </select>
  );
}

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** a muted count after the label (a filter list) */
  count?: number;
  /** marks it as wrong (red box and label, aria-invalid): a terms box that must be ticked */
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
};
export function Checkbox({
  label,
  checked,
  onChange,
  count,
  disabled,
  className,
  invalid,
  id,
  "aria-describedby": describedBy,
  ...rest
}: CheckboxProps) {
  useKitLocale(); // render again when the locale changes
  const f = useFieldProps(id, invalid, describedBy);
  return (
    <label className={cx("mds-check", disabled && "disabled", f.bad && "invalid", className)}>
      <input
        type="checkbox"
        id={f.id}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-invalid={f.bad || undefined}
        aria-describedby={f.describedBy}
        {...rest}
      />
      <span>{label}</span>
      {count != null && <span className="count">{localeNumber(count)}</span>}
    </label>
  );
}
