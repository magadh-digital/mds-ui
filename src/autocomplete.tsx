/**
 * Autocomplete: the console's one searchable picker, for any list longer than a handful of fixed choices (heads,
 * accounts, products, POs…). Built on Chakra's Combobox (Ark underneath, like `Pop`) with the console's own look:
 * type to filter, arrows and Enter to pick, Escape to close, × to clear, optional groups. Options are plain
 * `{ value, label }` rows; the caller maps its data once.
 *
 * Keep a `<select className="ui-select">` for short fixed lists (2–4 choices): a dropdown reads faster than a search box.
 *
 * `multiple` picks several: `value` is the picked values in click order, `onChange(values, options)`, the picks show
 * as removable chips under the box and the box stays for searching (a row's tick toggles it, the list stays open).
 * A picked row the server search no longer returns keeps its chip and label (the rows seen so far, plus
 * `pickedOptions` for saved picks); a picked row marked `disabled` is locked (no ×, not cleared by the box's ×).
 */
import { Combobox, Portal, useFilter, useListCollection } from "@chakra-ui/react";
import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

export type AutocompleteOption = {
  value: string;
  /** what the row shows and what the filter matches */
  label: string;
  /** a muted second part (a code, a bank, a status), also matched by the filter */
  hint?: string;
  /** custom React node for the hint, if provided this will be rendered instead of the text hint */
  hintNode?: React.ReactNode;
  /** rows with the same group sit under one heading; order follows `groupOrder`, else first appearance */
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
 * no longer returns it (so the box keeps its label). `extra` is a row the caller already knows (a saved pick).
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
  /** the order of group headings; groups not listed follow, in order of first appearance */
  groupOrder?: Array<string>;
  /** the smaller font for tight spots (table cells, inline rows) */
  compact?: boolean;
  autoFocus?: boolean;
  invalid?: boolean;
  id?: string;
  style?: CSSProperties;
  className?: string;
  title?: string;
  /** the input's accessible name, when no visible label is tied to it */
  ariaLabel?: string;
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

export function Autocomplete(props: AutocompleteProps) {
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
    ariaLabel,
    onInputChange,
  } = props;
  const multi = props.multiple === true;
  const { contains } = useFilter({ sensitivity: "base" });
  const grouped = options.some((o) => o.group);
  const { collection, filter, set } = useListCollection<AutocompleteOption>({
    initialItems: options,
    itemToValue: (o) => o.value,
    itemToString: (o) => o.label,
    isItemDisabled: (o) => !!o.disabled,
    // the filter reads the label, the hint and the keywords: a head by its code, an account by its bank or number
    filter: (_text, q, o) => contains(`${o.label} ${o.hint ?? ""} ${o.keywords ?? ""}`, q),
    ...(grouped ? { groupBy: (o: AutocompleteOption) => o.group ?? "", groupSort: groupOrder ?? "asc" } : {}),
  });
  // the options prop is usually built inline; resync only when its rows actually change, so typing keeps its filter
  const key = useMemo(() => options.map((o) => `${o.value}\u0001${o.label}\u0001${o.hint ?? ""}\u0001${o.group ?? ""}`).join("\n"), [options]);
  useEffect(() => { set(options) }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const narrow = (text: string) => filter(localFilter ? text : "");
  // multiple: every row seen so far, so a pick the search moved past keeps its chip label
  const seen = useRef(new Map<string, AutocompleteOption>());
  if (props.multiple) for (const o of props.pickedOptions ?? []) seen.current.set(o.value, o);
  for (const o of options) seen.current.set(o.value, o);
  const optionOf = (v: string) => seen.current.get(v) ?? { value: v, label: v };
  // multiple: the box's text is ours, so a pick can keep it (to tick more of the same search) or empty it
  const [text, setText] = useState(props.multiple ? (props.defaultSearch ?? "") : "");
  const selected = props.multiple ? props.value : props.value ? [props.value] : [];
  const locked = (v: string) => !!seen.current.get(v)?.disabled;
  const emitMany = (next: Array<string>, cause: "pick" | "remove" | "clear") => {
    if (props.multiple) props.onChange(next, next.map(optionOf), cause);
  };
  const searchCleared = () => {
    setText("");
    filter("");
    onInputChange?.("");
    onInputValueChange?.("");
    onSearchChange?.("");
  };
  const items = collection.items;
  const row = (o: AutocompleteOption) => (
    <Combobox.Item key={o.value} item={o} className={`item ui-ac-item ${o.className || ""}`.trim()} style={o.style}>
      <Combobox.ItemText className="ui-ac-text">
        <span className="ui-ac-label">{o.label}</span>
        {o.hintNode ? (
          <div className="ui-muted ui-ac-hint" style={{ width: "100%" }}>{o.hintNode}</div>
        ) : o.hint ? (
          <span className="ui-muted ui-ac-hint">{o.hint}</span>
        ) : null}
      </Combobox.ItemText>
      <Combobox.ItemIndicator className="ui-ac-check"><Check /></Combobox.ItemIndicator>
    </Combobox.Item>
  );
  return (
    <Combobox.Root
      unstyled
      className={`ui-ac${multi ? " multiple" : ""}${compact ? " compact" : ""}${className ? ` ${className}` : ""}`}
      style={style}
      collection={collection}
      value={selected}
      multiple={multi}
      {...(multi ? { inputValue: text } : {})}
      onValueChange={(d) => {
        if (props.multiple) {
          // a locked pick stays (the box's × clears the rest); the picks keep their click order, new ones at the end
          const next = [
            ...props.value.filter((v) => d.value.includes(v) || locked(v)),
            ...d.value.filter((v) => !props.value.includes(v)),
          ];
          emitMany(next, "pick");
          if (props.clearSearchOnPick && text) searchCleared();
          return;
        }
        const v = d.value[0] ?? null;
        props.onChange(v, v ? (collection.find(v) ?? options.find((o) => o.value === v) ?? null) : null);
      }}
      onInputValueChange={(d) => { {
        if (multi) setText(d.inputValue);
        narrow(d.inputValue); onInputChange?.(d.inputValue); };
        onInputValueChange?.(d.inputValue);
        if (
          onSearchChange &&
          (d.reason === "input-change" || d.reason === "clear-trigger" || !d.reason)
        ) {
          onSearchChange(d.reason === "clear-trigger" ? "" : d.inputValue);
        }
      }}
      // opening shows the whole list with the pick ticked, not the rows that matched the pick's own label (a multiple
      // box holds the search itself, so its rows stay narrowed to it)
      onOpenChange={(d) => {
        if (d.open) {
          if (multi) narrow(text);
          else { filter(""); onInputChange?.(""); }
        }
        onOpenChange?.(d.open);
      }}
      // the list opens on click and on typing; a chosen row's label takes the box, and clearing the text keeps the pick until × or another row
      openOnClick
      inputBehavior="autohighlight"
      selectionBehavior={multi ? "preserve" : "replace"}
      positioning={{ placement: "bottom-start", sameWidth: true, gutter: 4 }}
      disabled={disabled}
      invalid={invalid}
      lazyMount
      unmountOnExit
      ids={id ? { input: id } : undefined}
    >
      <Combobox.Control className="ui-ac-control">
        <Combobox.Input
          className={`ui-input ui-ac-input${invalid ? " invalid" : ""}`}
          placeholder={placeholder}
          autoFocus={autoFocus}
          title={title}
          aria-label={ariaLabel}
          onKeyDown={multi ? (e) => {
            // Backspace in an empty box takes off the last pick that is not locked
            if (e.key !== "Backspace" || text || disabled) return;
            const last = [...selected].reverse().find((v) => !locked(v));
            if (last !== undefined) emitMany(selected.filter((v) => v !== last), "remove");
          } : undefined}
        />
        <Combobox.IndicatorGroup className="ui-ac-indicators">
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
                <Combobox.ClearTrigger className="ui-iconbtn sm" aria-label="Clear" title="Clear"><X /></Combobox.ClearTrigger>
              ))}
          <Combobox.Trigger className="ui-iconbtn sm" aria-label="Open" title="Open"><ChevronDown /></Combobox.Trigger>
        </Combobox.IndicatorGroup>
      </Combobox.Control>
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
      <Portal>
        <Combobox.Positioner className="ui-ac-positioner">
          <Combobox.Content className="ui-pop ui-ac-pop" style={{ width: "var(--reference-width, 100%)", maxWidth: "var(--reference-width, 100%)", boxSizing: "border-box" }}>
            <Combobox.Empty className="ui-muted ui-ac-empty">{loading ? "Searching…" : emptyText}</Combobox.Empty>
            {grouped
              ? collection.group().map(([g, rows]) => (
                  <Combobox.ItemGroup key={g || "_"} className="ui-ac-group">
                    {g && <Combobox.ItemGroupLabel className="group-title ui-ac-group-label">{g}</Combobox.ItemGroupLabel>}
                    {rows.map(row)}
                  </Combobox.ItemGroup>
                ))
              : items.map(row)}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
}
