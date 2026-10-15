/**
 * The basic controls as components, so an app never has to know the kit's class names: Button, IconButton, LinkButton,
 * Input, Select, Textarea, Checkbox. Each takes the native element's props (and `ref`) plus a few of its own.
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
      className={cx("ui-btn", variant !== "outline" && variant, size === "sm" && "sm", className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 className="ui-spin" aria-hidden /> : icon}
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
      className={cx("ui-iconbtn", size === "sm" && "sm", danger && "danger", active && "active", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/** A button that reads like a link (a quiet action inside text or a footer). */
export function LinkButton({ className, type = "button", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { ref?: Ref<HTMLButtonElement> }) {
  return <button type={type} className={cx("ui-link", className)} {...rest} />;
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** marks the field as wrong (red border, aria-invalid) */
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
};
export function Input({ invalid, className, ...rest }: InputProps) {
  return <input className={cx("ui-input", invalid && "fail", className)} aria-invalid={invalid || undefined} {...rest} />;
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean; ref?: Ref<HTMLTextAreaElement> };
export function Textarea({ invalid, className, rows = 3, ...rest }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cx("ui-input ui-textarea", invalid && "fail", className)}
      aria-invalid={invalid || undefined}
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
export function Select({ options, placeholder, invalid, className, children, ...rest }: SelectProps) {
  return (
    <select className={cx("ui-select", invalid && "fail", className)} aria-invalid={invalid || undefined} {...rest}>
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
  ref?: Ref<HTMLInputElement>;
};
export function Checkbox({ label, checked, onChange, count, disabled, className, ...rest }: CheckboxProps) {
  return (
    <label className={cx("ui-check", disabled && "disabled", className)}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} {...rest} />
      <span>{label}</span>
      {count != null && <span className="count">{count.toLocaleString("en-IN")}</span>}
    </label>
  );
}
