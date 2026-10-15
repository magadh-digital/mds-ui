import { ChevronDown, ChevronUp, Info, type LucideIcon, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { type ReactNode, type Ref, useEffect, useRef, useState } from "react";
import { localeNumber } from "../core/locale.js";
import { type Tone } from "../core/types.js";
import { Dot } from "../display/dot.js";
import { Term } from "../display/term.js";

export function Sidebar({
  collapsed,
  children,
  footer,
}: {
  collapsed: boolean;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <aside
      className={`mds-sidebar ${collapsed ? "collapsed" : ""}`}
      aria-hidden={collapsed}
      // a collapsed sidebar is off screen: its filters must not take focus
      inert={collapsed}
    >
      <div className="scroll">{children}</div>
      {footer && <div className="foot">{footer}</div>}
    </aside>
  );
}

export function SidebarTop({ children }: { children: ReactNode }) {
  return <div className="top">{children}</div>;
}

export function CollapseButton({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="mds-iconbtn"
      onClick={onToggle}
      aria-label={collapsed ? "Show filters" : "Hide filters"}
      title={collapsed ? "Show filters" : "Hide filters"}
    >
      {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
    </button>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder = "Search",
  autoFocus,
  inputRef,
  minChars,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  /** characters before the search is sent; read from a "(3+ characters)" placeholder when not given */ minChars?: number;
}) {
  const min = minChars ?? Number((/(\d+)\+/.exec(placeholder) ?? [])[1] ?? 0);
  const short = min > 1 && value.length > 0 && value.length < min;
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="mds-search">
        <Search />
        <input
          ref={inputRef}
          className="mds-input"
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          // coming back to a box that already holds a search selects it all: type to search again, Backspace to
          // clear. The click that focused the box must not drop the caret and undo that selection; a second click
          // inside the box places the caret as usual.
          onFocus={(e) => {
            const el = e.currentTarget;
            if (!el.value) return;
            el.select();
            el.dataset.justFocused = "1";
          }}
          onMouseUp={(e) => {
            const el = e.currentTarget;
            if (el.dataset.justFocused) {
              e.preventDefault();
              delete el.dataset.justFocused;
            }
          }}
          onBlur={(e) => {
            delete e.currentTarget.dataset.justFocused;
          }}
          onKeyDown={(e) => {
            // Esc leaves the box (the text stays); `/` from anywhere comes back with the text selected
            if (e.key === "Escape") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          aria-label={placeholder}
          aria-keyshortcuts="/"
        />
        {!value && <kbd className="mds-search-kbd" aria-hidden>/</kbd>}
      </div>
      {short && (
        <div className="mds-search-hint">
          Type {min - value.length} more{" "}
          {min - value.length === 1 ? "character" : "characters"} to search
        </div>
      )}
    </div>
  );
}

export function FilterGroup({
  title,
  badge,
  defaultOpen = true,
  children,
  right,
}: {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  right?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  // a group whose content is a single row (a toggle group, one picker) has nothing worth hiding: no show/hide
  // chevron, the head is a plain label. Measured, so it holds for every page without a prop.
  const bodyRef = useRef<HTMLDivElement>(null);
  const [oneRow, setOneRow] = useState(false);
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const check = () => {
      const row = parseFloat(getComputedStyle(el).getPropertyValue("--mds-ctl-h")) || 28;
      // one control (a toggle group, a picker, a select, a date) or anything a row tall
      const kids = [...el.children].filter(
        (c) => (c as HTMLElement).offsetParent !== null || c.tagName === "SELECT",
      );
      const CONTROL =
        ".mds-toggle, .mds-seg, .mds-ac, select, .mds-select, input, .mds-daterange-root, .mds-daterange-wrap";
      // the control itself, or a plain wrapper around just that one control
      let k: Element | undefined = kids.length === 1 ? kids[0] : undefined;
      while (k && !k.matches(CONTROL) && k.children.length === 1) k = k.children[0];
      const single = !!k && k.matches(CONTROL);
      setOneRow(single || el.scrollHeight <= row * 1.6);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);
  const label = (
    <span
      className="mds-label"
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      <Term label={title} />
      {badge && <span className="mds-chip">{badge}</span>}
    </span>
  );
  if (oneRow && open)
    return (
      <div className="mds-fgroup">
        <div className="head static">
          {label}
          {right && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              {right}
            </span>
          )}
        </div>
        <div className="body" ref={bodyRef}>
          {children}
        </div>
      </div>
    );
  return (
    <div className="mds-fgroup">
      <button
        type="button"
        className="head"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {label}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {right}
          {open ? <ChevronUp /> : <ChevronDown />}
        </span>
      </button>
      {open && (
        <div className="body" ref={bodyRef}>
          {children}
        </div>
      )}
    </div>
  );
}

export function CountCheckbox({
  label,
  term,
  count,
  checked,
  indeterminate,
  onChange,
  icon: Icon,
  tone,
  level = 0,
  strong,
}: {
  label: string;
  /** glossary key for the hover (`state:arrived`, `flag:short`); the label itself when absent */ term?: string;
  count?: number;
  checked: boolean;
  /** a parent row with some of its children picked */ indeterminate?: boolean;
  onChange: (v: boolean) => void;
  icon?: LucideIcon;
  tone?: Tone;
  /** tree depth: children indent under their parent */ level?: number;
  /** parent rows of a tree */ strong?: boolean;
}) {
  const disabled = count === 0 && !checked && !indeterminate;
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate && !checked;
  }, [indeterminate, checked]);
  return (
    <label
      className={`mds-check ${disabled ? "disabled" : ""}`}
      style={
        level
          ? { paddingLeft: `calc(var(--mds-sp-1) + ${level} * var(--mds-sp-4))` }
          : undefined
      }
    >
      <input
        ref={ref}
        type="checkbox"
        aria-label={label}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {Icon && <Icon />}
      {tone && <Dot tone={tone} />}
      <span
        style={{
          flex: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontWeight: strong ? 500 : undefined,
        }}
      >
        <Term k={term} label={label} />
      </span>
      {count != null && (
        <span className="count mds-num">({localeNumber(count)})</span>
      )}
    </label>
  );
}

export function Banner({ children }: { children: ReactNode }) {
  return (
    <div className="mds-banner">
      <Info />
      <div>{children}</div>
    </div>
  );
}

export function SidebarLink({
  children,
  onClick,
  disabled,
  title,
  active,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className="mds-link"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={active ? { fontWeight: 600 } : undefined}
    >
      {children}
    </button>
  );
}
