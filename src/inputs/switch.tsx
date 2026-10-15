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
      className={`ui-switch ${checked ? "on" : ""}`}
      onClick={() => onChange(!checked)}
    />
  );
  if (hideLabel) return control;
  return (
    <label className="ui-switch-row">
      {control}
      <span>{label}</span>
    </label>
  );
}
