export function Switch({
  on,
  onChange,
  label,
  hideLabel,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
  /** icon-only use; the label stays for screen readers */ hideLabel?: boolean;
}) {
  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`ui-switch ${on ? "on" : ""}`}
      onClick={() => onChange(!on)}
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
