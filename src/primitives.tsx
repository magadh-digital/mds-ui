import { Popover, Portal, Tooltip } from "@chakra-ui/react";
import { Check, Copy, Plus, type LucideIcon } from "lucide-react";
import {
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { X } from "lucide-react";

export type Tone = "ok" | "warn" | "error" | "accent" | "neutral";

export function Tip({
  label,
  children,
  placement = "bottom",
}: {
  label: ReactNode;
  children: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <Tooltip.Root openDelay={250} closeDelay={50} positioning={{ placement }}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content
            className="ui-tip"
            bg="var(--c-text)"
            color="var(--c-canvas)"
            fontSize="var(--fs-xs)"
            px="7px"
            py="3px"
            borderRadius="4px"
          >
            {label}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}

const isPortalledPicker = (e: {
  detail?: { originalEvent?: { target?: EventTarget | null } };
  target?: EventTarget | null;
}) => {
  const target = (e.detail?.originalEvent?.target ?? e.target) as HTMLElement | null;
  return !!target?.closest?.(
    '#daterange-portal, .react-datepicker-popper, .react-datepicker, .daterange-cal, [data-scope="menu"][data-part="content"], [data-scope="combobox"][data-part="content"], .ui-ac-pop'
  );
};

/** Small popover with the console's surface styling. */
export function Pop({
  trigger,
  children,
  placement = "bottom-end",
  width,
}: {
  trigger: ReactNode;
  children: ReactNode;
  placement?: "bottom-end" | "bottom-start" | "top-start";
  width?: string;
}) {
  return (
    <Popover.Root
      positioning={{ placement }}
      lazyMount
      unmountOnExit
      onInteractOutside={(e) => {
        if (isPortalledPicker(e)) e.preventDefault();
      }}
      onPointerDownOutside={(e) => {
        if (isPortalledPicker(e)) e.preventDefault();
      }}
      onFocusOutside={(e) => {
        if (isPortalledPicker(e)) e.preventDefault();
      }}
    >
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            className="ui-pop"
            width={width ?? "auto"}
            minW="180px"
            bg="var(--c-surface)"
            color="var(--c-text)"
            borderWidth="1px"
            borderColor="var(--c-border)"
            boxShadow="var(--shadow-pop)"
            p="var(--sp-2)"
            borderRadius="var(--radius-md)"
          >
            {children}
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}

/**
 * A small editor in a popover (21 Sep 2026): quantity, rate, attributes, a vehicle, a gift, an access row — anything
 * that used to open a second slide-over. The body mounts only while open (its queries fire then, not with the panel)
 * and receives `close`; a title row with × sits above it.
 */
export function EditPop({
  trigger,
  title,
  width = "380px",
  placement = "bottom-end",
  children,
}: {
  trigger: ReactNode;
  title?: string;
  width?: string;
  placement?: "bottom-end" | "bottom-start" | "top-start" | "top-end";
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <Popover.Root
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      positioning={{ placement }}
      lazyMount
      unmountOnExit
      onInteractOutside={(e) => {
        if (isPortalledPicker(e)) e.preventDefault();
      }}
      onPointerDownOutside={(e) => {
        if (isPortalledPicker(e)) e.preventDefault();
      }}
      onFocusOutside={(e) => {
        if (isPortalledPicker(e)) e.preventDefault();
      }}
    >
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            className="ui-pop ui-editpop"
            width={width}
            maxW="92vw"
            minW="180px"
            bg="var(--c-surface)"
            color="var(--c-text)"
            borderWidth="1px"
            borderColor="var(--c-border)"
            boxShadow="var(--shadow-pop)"
            p="var(--sp-2)"
            borderRadius="var(--radius-md)"
          >
            {title && (
              <div className="ui-editpop-title">
                <span>{title}</span>
                <button
                  type="button"
                  className="ui-iconbtn sm"
                  aria-label="Close"
                  onClick={close}
                >
                  <X />
                </button>
              </div>
            )}
            {open && children(close)}
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}

/** A popover that opens on hover (and focus), for a summary behind a cell; the body mounts only while open, so a list of 200 rows costs nothing until a row is hovered. */
export function HoverPop({
  trigger,
  children,
  placement = "bottom-start",
  width,
  delay = 300,
}: {
  trigger: ReactNode;
  children: ReactNode;
  placement?: "bottom-end" | "bottom-start" | "top-start";
  width?: string;
  delay?: number;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const show = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 150);
  };
  return (
    <Popover.Root
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      positioning={{ placement }}
      lazyMount
      unmountOnExit
      autoFocus={false}
    >
      <Popover.Trigger asChild>
        <span
          onMouseEnter={show}
          onMouseLeave={hide}
          onFocus={show}
          onBlur={hide}
          style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          {trigger}
        </span>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            className="ui-pop"
            onMouseEnter={show}
            onMouseLeave={hide}
            width={width ?? "auto"}
            minW="220px"
            bg="var(--c-surface)"
            color="var(--c-text)"
            borderWidth="1px"
            borderColor="var(--c-border)"
            boxShadow="var(--shadow-pop)"
            p="var(--sp-2)"
            borderRadius="var(--radius-md)"
            fontSize="var(--fs-sm)"
          >
            {children}
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}

/** the status dot; `needs` draws the "needs you" ring around it (a person's input is what the row waits for) */
export const Dot = ({
  tone = "neutral",
  title,
  needs,
}: {
  tone?: Tone;
  title?: string;
  needs?: boolean;
}) => (
  <span className={`ui-dot ${tone} ${needs ? "needs" : ""}`} title={title} />
);

export function HealthBar({
  segments,
  labels,
}: {
  segments: Array<Tone | "neutral">;
  labels?: [string, string, string];
}) {
  return (
    <div>
      <div className="ui-health">
        {segments.map((s, i) => (
          <span key={i} className={s} />
        ))}
      </div>
      {labels && (
        <div className="ui-health-labels">
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
          <span>{labels[2]}</span>
        </div>
      )}
    </div>
  );
}

export function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: ReactNode }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="ui-seg" role="tablist">
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          role="tab"
          aria-selected={o.value === value}
          className={o.value === value ? "active" : ""}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Pills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="ui-pills">
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          className={o.value === value ? "active" : ""}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

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

export function Skeleton({ w = "60%" }: { w?: string }) {
  return <div className="ui-skel" style={{ width: w }} />;
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

export type ToggleOption<T extends string> = {
  value: T;
  label: ReactNode;
  /** shown after the label, muted: how many rows have this value */
  count?: number;
  title?: string;
};
/**
 * A toggle button group for a filter with 2–4 choices (status, yes/no, type): every choice visible, one click to
 * pick. Nothing picked means no filter (all rows); clicking the picked choice again clears it. There is no "All"
 * button. Longer lists use a select or an Autocomplete instead.
 */
export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<ToggleOption<T>>;
  /** the picked choice, or "" for none (no filter) */
  value: T | "";
  onChange: (v: T | "") => void;
  /** accessible name of the group */
  label?: string;
}) {
  return (
    <div className="ui-seg ui-toggle" role="group" aria-label={label}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            className={on ? "active" : ""}
            title={o.title ?? (on ? "Click again to show all" : undefined)}
            onClick={() => onChange(on ? "" : o.value)}
          >
            {o.label}
            {o.count != null && (
              <span className="ui-toggle-count ui-num">
                {o.count.toLocaleString("en-IN")}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
