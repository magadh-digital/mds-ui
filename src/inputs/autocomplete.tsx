import { autoUpdate, flip, FloatingNode, FloatingPortal, offset, size, useDismiss, useFloating, useFloatingNodeId, useInteractions } from "@floating-ui/react";
import { Check, ChevronDown, X } from "lucide-react";
import { type CSSProperties, type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { isInsideLayer, LAYER_Z, LayerTree, useLayerMotion } from "../overlay/floating.js";
import { useFieldControl } from "./field.js";

/**
 * Autocomplete: the kit's one searchable picker, for any list longer than a handful of fixed choices (heads,
 * accounts, products, POs…). Built on Floating UI (positioning, outside press) with the kit's own look:
 * type to filter, arrows and Enter to pick, Escape to close, × to clear, optional groups. Options are plain
 * `{ value, label }` rows; the caller maps its data once.
 *
 * Keep a `<select className="ui-select">` for short fixed lists (2–4 choices): a dropdown reads faster than a search box.
 *
 * `multiple` picks several: `value` is the picked values in click order, `onChange(values, options)`, the picks show
 * as removable chips under the box and the box stays for searching (a row's tick toggles it, the list stays open).
 * A picked row the server search no longer returns keeps its chip and label (the rows seen so far, plus
 * `pickedOptions` for saved picks); a picked row marked `disabled` is locked (no ×, not cleared by the box's ×).
 *
 * Groups: headings in `groupOrder` first (in its order), then the other groups A→Z; rows keep their order inside a
 * group. While the list is open one enabled row is always highlighted (the pick, else the first), so Enter picks it.
 */

export type AutocompleteOption = {
  value: string;
  /** what the row shows and what the filter matches */
  label: string;
  /** a muted second part (a code, a bank, a status), also matched by the filter */
  hint?: string;
  /** custom React node for the hint, if provided this will be rendered instead of the text hint */
  hintNode?: React.ReactNode;
  /** rows with the same group sit under one heading; headings follow `groupOrder`, then A→Z */
  group?: string;
  /** extra words the filter should match that the row does not show */
  keywords?: string;
  disabled?: boolean;
  /** Custom class name for the item container */
  className?: string;
  /** Custom inline style for the item container */
  style?: React.CSSProperties;
};

/**
 * For server-searched lists: the rows the search brought back, plus the picked row when the search has moved on and
 * no longer returns it, so the list still shows it ticked. `extra` is a row the caller already knows (a saved pick
 * the search never loaded), which the single box needs for its label. (Autocomplete itself keeps the labels of rows it
 * has seen; this adds the row back into the list and covers the saved pick.)
 */
export function useKeepPicked(
  options: Array<AutocompleteOption>,
  value: string | null | undefined,
  extra?: AutocompleteOption | null,
): Array<AutocompleteOption> {
  const seen = useRef(new Map<string, AutocompleteOption>());
  if (extra) seen.current.set(extra.value, extra);
  for (const o of options) seen.current.set(o.value, o);
  const kept = value && !options.some((o) => o.value === value) ? seen.current.get(value) : undefined;
  return kept ? [kept, ...options] : options;
}


type AutocompleteCommonProps = {
  options: Array<AutocompleteOption>;
  onInputValueChange?: (value: string) => void;
  /** fires when the user types or clears in the input, but not on item selection */
  onSearchChange?: (term: string) => void;
  /** fires when the list opens or closes (a picker that searches on open) */
  onOpenChange?: (open: boolean) => void;
  /**
   * filter the rows by the typed text (default on). Off for server-searched lists whose rows already are the
   * server's matches (it may match on fields the row does not show): the rows show as given.
   */
  localFilter?: boolean;
  loading?: boolean;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  /** show the × that clears the pick (default on) */
  clearable?: boolean;
  /** the order of group headings; groups not listed follow, A→Z */
  groupOrder?: Array<string>;
  /** the smaller font for tight spots (table cells, inline rows) */
  compact?: boolean;
  autoFocus?: boolean;
  invalid?: boolean;
  id?: string;
  style?: CSSProperties;
  className?: string;
  title?: string;
  /** the input's accessible name (and the list's), when no visible label (a FormRow) names it */
  label?: string;
  onInputChange?: (value: string) => void;
};
type AutocompleteSingleProps = AutocompleteCommonProps & {
  multiple?: false;
  /** the picked option's value, or null / "" for none */
  value: string | null | undefined;
  onChange: (value: string | null, option: AutocompleteOption | null) => void;
};
type AutocompleteMultipleProps = AutocompleteCommonProps & {
  /** pick several: chips under the box, the box stays for searching */
  multiple: true;
  /** the picked values, in the order they were picked */
  value: Array<string>;
  /** `cause`: a row ticked or unticked in the list ("pick"), a chip's × or Backspace ("remove"), the box's × ("clear") */
  onChange: (values: Array<string>, options: Array<AutocompleteOption>, cause: "pick" | "remove" | "clear") => void;
  /** rows for saved picks the options may not carry (their chips' labels) */
  pickedOptions?: Array<AutocompleteOption>;
  /** empty the box (and `onSearchChange("")`) after a row is ticked; by default the text stays to pick more of the same search */
  clearSearchOnPick?: boolean;
  /** the text the box starts with (a search the caller keeps across mounts) */
  defaultSearch?: string;
};
export type AutocompleteProps = AutocompleteSingleProps | AutocompleteMultipleProps;

// case- and accent-blind "contains", as Intl's base sensitivity: "Ram" finds "rām", "RAM", "Rām Traders"
const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase();
const searchText = (o: AutocompleteOption) => fold(`${o.label} ${o.hint ?? ""} ${o.keywords ?? ""}`);

/** groups in `groupOrder` first (in its order), then the rest A→Z; rows keep their order inside a group */
function groupRows(rows: Array<AutocompleteOption>, order?: Array<string>) {
  const by = new Map<string, Array<AutocompleteOption>>();
  for (const o of rows) {
    const g = o.group ?? "";
    const list = by.get(g);
    if (list) list.push(o);
    else by.set(g, [o]);
  }
  const rank = (g: string) => {
    const i = order?.indexOf(g) ?? -1;
    return i < 0 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...by.entries()].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b));
}

export function Autocomplete(props: AutocompleteProps) {
  return (
    <LayerTree>
      <AutocompleteInner {...props} />
    </LayerTree>
  );
}

function AutocompleteInner(props: AutocompleteProps) {
  const {
    options,
    onInputValueChange,
    onSearchChange,
    onOpenChange,
    localFilter = true,
    loading,
    placeholder = "Type to search…",
    emptyText = "No match",
    disabled,
    clearable = true,
    groupOrder,
    compact,
    autoFocus,
    invalid,
    id,
    style,
    className,
    title,
    label,
    onInputChange,
  } = props;
  const { id: inputId, field } = useFieldControl(id);
  const multi = props.multiple === true;
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpenState] = useState(false);
  // single: the text while the person types (null = show the pick's label); multiple: the box's own search text
  const [query, setQuery] = useState<string | null>(null);
  const [text, setText] = useState(props.multiple ? (props.defaultSearch ?? "") : "");
  // what the list is narrowed by: nothing right after opening a single box, the typed text after that
  const [filterText, setFilterText] = useState("");
  const [active, setActive] = useState<string | null>(null);

  // every row seen so far, so a pick the server search moved past keeps its label (chips, the single box)
  const seen = useRef(new Map<string, AutocompleteOption>());
  if (props.multiple) for (const o of props.pickedOptions ?? []) seen.current.set(o.value, o);
  for (const o of options) seen.current.set(o.value, o);
  const optionOf = (v: string) => seen.current.get(v) ?? { value: v, label: v };
  const selected = props.multiple ? props.value : props.value ? [props.value] : [];
  const locked = (v: string) => !!seen.current.get(v)?.disabled;

  const grouped = useMemo(() => options.some((o) => o.group), [options]);
  // each row's text folded once per options change, not per keystroke
  const folded = useMemo(() => (localFilter ? options.map(searchText) : null), [options, localFilter]);
  const rows = useMemo(() => {
    const q = fold(filterText);
    return folded && q ? options.filter((_, i) => folded[i]!.includes(q)) : options;
  }, [options, folded, filterText]);
  const groups = useMemo(() => (grouped ? groupRows(rows, groupOrder) : null), [rows, grouped, groupOrder]);
  // the rows in the order they show, for the arrow keys
  const flat = useMemo(() => (groups ? groups.flatMap(([, r]) => r) : rows), [groups, rows]);
  const enabled = useMemo(() => flat.filter((o) => !o.disabled), [flat]);
  const indexOf = useMemo(() => new Map(flat.map((o, i) => [o.value, i])), [flat]);
  // the highlighted row: the one set by the arrows / mouse / pick while it is still shown and enabled, else the first
  // enabled row (the rows may change under it: a server search, a filter)
  const current = open
    ? active != null && enabled.some((o) => o.value === active)
      ? active
      : (enabled[0]?.value ?? null)
    : null;

  const nodeId = useFloatingNodeId();
  const setOpen = (v: boolean) => {
    if (v === open) return;
    setOpenState(v);
    if (v) {
      // opening shows the whole list with the pick ticked, not the rows that matched the pick's own label (a
      // multiple box holds the search itself, so its rows stay narrowed to it)
      if (multi) setFilterText(text);
      else {
        setFilterText("");
        onInputChange?.("");
      }
      // the pick is highlighted when the list shows it (else `current` falls to the first row)
      setActive(selected[0] ?? null);
    } else {
      setQuery(null);
      setActive(null);
    }
    onOpenChange?.(v);
  };
  const { refs, floatingStyles, context } = useFloating({
    nodeId,
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      size({
        apply({ rects, elements }) {
          const w = `${rects.reference.width}px`;
          elements.floating.style.setProperty("--reference-width", w);
          elements.floating.style.width = w;
        },
      }),
    ],
  });
  const motion = useLayerMotion(context, "list");
  const { getFloatingProps } = useInteractions([
    useDismiss(context, {
      escapeKey: false,
      outsidePress: (e) => !isInsideLayer(e.target),
      bubbles: { escapeKey: false },
    }),
  ]);

  // row ids by position (a value may hold spaces, dots or digits first)
  const optionId = (v: string) => `${listId}-${indexOf.get(v) ?? -1}`;
  const currentId = current != null && indexOf.has(current) ? optionId(current) : undefined;
  // the highlighted row stays in view as the arrows move it
  useEffect(() => {
    if (!currentId) return;
    document.getElementById(currentId)?.scrollIntoView({ block: "nearest" });
  }, [currentId]);

  const emitMany = (next: Array<string>, cause: "pick" | "remove" | "clear") => {
    if (props.multiple) props.onChange(next, next.map(optionOf), cause);
  };
  const searchCleared = () => {
    setText("");
    setFilterText("");
    onInputChange?.("");
    onInputValueChange?.("");
    onSearchChange?.("");
  };
  const typed = (v: string) => {
    if (multi) setText(v);
    else setQuery(v);
    setFilterText(v);
    if (!open) {
      setOpenState(true);
      onOpenChange?.(true);
    }
    // the first row that matches, in the order the list shows it (groups included), is highlighted as you type, so
    // Enter picks it: with no row set, `current` falls to the first enabled row of the (memoised) new list
    setActive(null);
    onInputChange?.(v);
    onInputValueChange?.(v);
    onSearchChange?.(v);
  };
  const pick = (o: AutocompleteOption) => {
    if (o.disabled) return;
    if (props.multiple) {
      // a picked row unticks unless it is locked; the picks keep their click order, new ones at the end
      const has = props.value.includes(o.value);
      if (has && locked(o.value)) return;
      emitMany(has ? props.value.filter((v) => v !== o.value) : [...props.value, o.value], "pick");
      if (props.clearSearchOnPick && text) searchCleared();
      setActive(o.value);
      return;
    }
    // a chosen row's label takes the box; picking the row already picked changes nothing
    if (props.value !== o.value) props.onChange(o.value, o);
    onInputChange?.(o.label);
    onInputValueChange?.(o.label);
    setOpen(false);
  };
  const move = (dir: 1 | -1) => {
    if (!enabled.length) return;
    const i = enabled.findIndex((o) => o.value === current);
    const next = i < 0 ? (dir === 1 ? 0 : enabled.length - 1) : (i + dir + enabled.length) % enabled.length;
    setActive(enabled[next]!.value);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return; // a Hindi / IME word in progress: Enter finishes the word, not a pick
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) setOpen(true);
      else move(e.key === "ArrowDown" ? 1 : -1);
    } else if (e.key === "Enter") {
      if (!open) return;
      e.preventDefault();
      const o = flat.find((x) => x.value === current);
      if (o) pick(o);
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
      }
    } else if (e.key === "Tab") {
      if (open) setOpen(false);
    } else if (multi && e.key === "Backspace" && !text && !disabled) {
      // Backspace in an empty box takes off the last pick that is not locked
      const last = [...selected].reverse().find((v) => !locked(v));
      if (last !== undefined) emitMany(selected.filter((v) => v !== last), "remove");
    }
  };

  const bad = invalid ?? field?.invalid ?? false;
  // the list is named like the box: its label, or the FormRow's label
  const listName = label ? { "aria-label": label } : field ? { "aria-labelledby": field.labelId } : { "aria-label": placeholder };
  const pickedLabel = !multi && props.value ? optionOf(props.value).label : "";
  const inputValue = multi ? text : open && query !== null ? query : pickedLabel;
  const row = (o: AutocompleteOption) => {
    const checked = selected.includes(o.value);
    return (
      <div
        key={o.value}
        id={optionId(o.value)}
        role="option"
        aria-selected={checked}
        aria-disabled={o.disabled || undefined}
        data-highlighted={current === o.value ? "" : undefined}
        data-state={checked ? "checked" : "unchecked"}
        data-disabled={o.disabled ? "" : undefined}
        className={`item ui-ac-item ${o.className || ""}`.trim()}
        style={o.style}
        // keep the focus in the box while a row is clicked
        onMouseDown={(e) => e.preventDefault()}
        onMouseMove={() => !o.disabled && current !== o.value && setActive(o.value)}
        onClick={() => pick(o)}
      >
        <span className="ui-ac-text">
          <span className="ui-ac-label">{o.label}</span>
          {o.hintNode ? (
            <span className="ui-muted ui-ac-hint" style={{ display: "block", width: "100%" }}>
              {o.hintNode}
            </span>
          ) : o.hint ? (
            <span className="ui-muted ui-ac-hint">{o.hint}</span>
          ) : null}
        </span>
        {checked && (
          <span className="ui-ac-check" aria-hidden>
            <Check />
          </span>
        )}
      </div>
    );
  };

  return (
    <FloatingNode id={nodeId}>
      <div
        className={`ui-ac${multi ? " multiple" : ""}${compact ? " compact" : ""}${className ? ` ${className}` : ""}`}
        style={style}
        data-disabled={disabled ? "" : undefined}
      >
        <div className="ui-ac-control" ref={refs.setReference}>
          <input
            ref={inputRef}
            id={inputId}
            className={`ui-input ui-ac-input${bad ? " invalid" : ""}`}
            role="combobox"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={currentId}
            aria-invalid={bad || undefined}
            aria-label={label}
            aria-describedby={field?.describedBy}
            data-state={open ? "open" : "closed"}
            autoComplete="off"
            placeholder={placeholder}
            autoFocus={autoFocus}
            title={title}
            disabled={disabled}
            value={inputValue}
            onChange={(e) => typed(e.target.value)}
            onClick={() => !disabled && setOpen(true)}
            onKeyDown={onKeyDown}
            onBlur={(e) => {
              // leaving the box (Tab, a click elsewhere) closes the list; a click on a row keeps the focus here
              const to = e.relatedTarget as Node | null;
              if (!to || !refs.floating.current?.contains(to)) setOpen(false);
            }}
          />
          <div className="ui-ac-indicators">
            {clearable && !disabled && (multi
              ? selected.some((v) => !locked(v)) && (
                  // the picks but the locked ones go, and the search with them
                  <button
                    type="button"
                    className="ui-iconbtn sm"
                    aria-label="Clear"
                    title="Clear"
                    onClick={() => {
                      emitMany(selected.filter(locked), "clear");
                      if (text) searchCleared();
                    }}
                  >
                    <X />
                  </button>
                )
              : selected.length > 0 && (
                  <button
                    type="button"
                    className="ui-iconbtn sm"
                    aria-label="Clear"
                    title="Clear"
                    onClick={() => {
                      props.onChange(null, null);
                      setQuery(null);
                      onInputChange?.("");
                      onInputValueChange?.("");
                      onSearchChange?.("");
                      inputRef.current?.focus();
                    }}
                  >
                    <X />
                  </button>
                ))}
            <button
              type="button"
              className="ui-iconbtn sm"
              aria-label="Open"
              title="Open"
              tabIndex={-1}
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setOpen(!open);
                inputRef.current?.focus();
              }}
            >
              <ChevronDown />
            </button>
          </div>
        </div>
        {multi && selected.length > 0 && (
          <div className="ui-ac-chips" style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4, minWidth: 0 }}>
            {selected.map((v) => {
              const o = optionOf(v);
              const fixed = disabled || locked(v);
              return (
                <span
                  key={v}
                  className="ui-chip ui-ac-chip"
                  title={o.hint ? `${o.label} · ${o.hint}` : o.label}
                  style={{ maxWidth: "100%", color: "var(--c-text)", paddingRight: fixed ? undefined : 2 }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{o.label}</span>
                  {!fixed && (
                    <button
                      type="button"
                      className="ui-ac-chip-x"
                      aria-label={`Remove ${o.label}`}
                      title="Remove"
                      onClick={() => emitMany(selected.filter((x) => x !== v), "remove")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        border: 0,
                        background: "transparent",
                        color: "var(--c-muted)",
                        cursor: "pointer",
                      }}
                    >
                      <X style={{ width: "1em", height: "1em" }} />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        )}
      </div>
      {motion.isMounted && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            id={listId}
            role="listbox"
            {...listName}
            aria-multiselectable={multi || undefined}
            className={`ui-pop ui-ac-pop${compact ? " compact" : ""}`}
            data-status={motion.status}
            style={{ ...floatingStyles, ...motion.styles, zIndex: LAYER_Z, maxWidth: "var(--reference-width, 100%)", boxSizing: "border-box" }}
            {...getFloatingProps()}
          >
            {flat.length === 0 && (
              <div className="ui-muted ui-ac-empty">{loading ? "Searching…" : emptyText}</div>
            )}
            {groups
              ? groups.map(([g, rs], gi) => (
                  <div
                    key={g || "_"}
                    role="group"
                    className="ui-ac-group"
                    aria-labelledby={g ? `${listId}-g${gi}` : undefined}
                    aria-label={g ? undefined : "Other"}
                  >
                    {g && (
                      <div className="group-title ui-ac-group-label" id={`${listId}-g${gi}`} role="presentation">
                        {g}
                      </div>
                    )}
                    {rs.map(row)}
                  </div>
                ))
              : flat.map(row)}
          </div>
        </FloatingPortal>
      )}
    </FloatingNode>
  );
}
