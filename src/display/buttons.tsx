import { Check, Copy, type LucideIcon, Plus } from "lucide-react";
import { type ButtonHTMLAttributes, type Ref, useState } from "react";

/** Copies `text` to the clipboard; a tick shows for a moment after. `label` names it ("Copy UTR"). */
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="mds-iconbtn copy"
      style={{ width: 20, height: 20 }}
      title={label}
      aria-label={done ? "Copied" : label}
      onClick={(e) => {
        e.stopPropagation();
        void navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        });
      }}
    >
      {done ? (
        <Check aria-hidden style={{ width: 12, height: 12 }} />
      ) : (
        <Copy aria-hidden style={{ width: 12, height: 12 }} />
      )}
    </button>
  );
}

/**
 * The small in-cell action: a pencil, sliders or trash icon beside the value it acts on — inline, 20 px,
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
      className={`mds-iconbtn sm ${danger ? "danger" : ""} ${className ?? ""}`}
      title={label}
      aria-label={label}
      {...rest}
    >
      <Icon aria-hidden />
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
      className={`mds-link nowrap ${className ?? ""}`}
      {...rest}
    >
      <Plus aria-hidden /> {label}
    </button>
  );
}
