/** An on / off switch; `label` names it (and shows beside it unless `hideLabel`). */
export function Switch({
  checked,
  onChange,
  label,
  hideLabel,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** icon-only use; the label stays for screen readers */ hideLabel?: boolean;
  disabled?: boolean;
}) {
  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`mds-switch ${checked ? "on" : ""}`}
      onClick={() => onChange(!checked)}
    />
  );
  if (hideLabel) return control;
  return (
    <label className="mds-switch-row">
      {control}
      <span>{label}</span>
    </label>
  );
}
