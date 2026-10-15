import { Check, Copy, type LucideIcon, Plus } from "lucide-react";
import { type ButtonHTMLAttributes, type Ref, useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="ui-iconbtn copy"
      style={{ width: 20, height: 20 }}
      title="Copy"
      onClick={(e) => {
        e.stopPropagation();
        void navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        });
      }}
    >
      {done ? (
        <Check style={{ width: 12, height: 12 }} />
      ) : (
        <Copy style={{ width: 12, height: 12 }} />
      )}
    </button>
  );
}

/**
 * The small in-cell action (21 Sep 2026): a pencil, sliders or trash icon beside the value it acts on — inline, 20 px,
 * the label as tooltip and aria-label, red on hover when `danger`. Use it as a popover / confirm trigger (`ref` passes
 * through) or with `onClick`. Never a text link for edit / delete inside a table.
 */
export function IconAction({
  ref,
  icon: Icon,
  label,
  danger,
  className,
  ...rest
}: {
  ref?: Ref<HTMLButtonElement>;
  icon: LucideIcon;
  label: string;
  danger?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      ref={ref}
      type="button"
      className={`ui-iconbtn sm ${danger ? "danger" : ""} ${className ?? ""}`}
      title={label}
      aria-label={label}
      {...rest}
    >
      <Icon />
    </button>
  );
}
/** The "+ Add …" link that opens a popover or a form: a leading plus that stays on the link's line. */
export function AddLink({
  ref,
  label,
  className,
  ...rest
}: {
  ref?: Ref<HTMLButtonElement>;
  label: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      ref={ref}
      type="button"
      className={`ui-link nowrap ${className ?? ""}`}
      {...rest}
    >
      <Plus /> {label}
    </button>
  );
}
