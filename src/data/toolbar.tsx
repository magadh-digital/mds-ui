import { RefreshCw } from "lucide-react";
import { createContext, type ReactNode, type RefObject, useContext, useEffect, useRef, useState } from "react";
import { CollapseButton, SearchBox } from "./sidebar.js";
import { useClientLayoutEffect } from "./saved.js";
import { localeNumber } from "../core/locale.js";
import { Term } from "../display/term.js";
import { dialogOpen, listOpen } from "../overlay/dialog.js";

export type ToolbarSearch = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** characters before the search is sent (shows a "type N more" hint) */
  minChars?: number;
};

/**
 * Tabs a host puts in every toolbar below it (an app shell: the sister-page strip of a merged rail entry), shown when
 * the page passes no `tabs` of its own. One rendered toolbar per page, so the strip appears once.
 */
export const ToolbarTabsContext = createContext<ReactNode>(null);

// ---------------------------------------------------------------- page keys (`/` and `R`)
// One window listener for every mounted toolbar. A key goes to the most recently mounted toolbar that is on screen
// (not inside a closed or covered panel, a collapsed sidebar or anything `inert` / `aria-hidden`) and has the thing
// the key asks for (a search box for `/`, a refresh for `R`), so two toolbars never both answer one key.
type PageKeys = {
  root: HTMLElement | null;
  focusSearch: (() => void) | null;
  refresh: (() => void) | null;
};
const mounted: Array<PageKeys> = [];

const inTextField = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

const onScreen = (el: HTMLElement | null) =>
  !!el && el.isConnected && el.getClientRects().length > 0 && !el.closest('[inert], [aria-hidden="true"]');

function onPageKey(e: KeyboardEvent) {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
  const slash = e.key === "/";
  if (!slash && e.key !== "r" && e.key !== "R") return;
  // not while typing, not under a dialog or the file viewer, not while a list, popover, menu or ⌘K is open
  if (inTextField(e.target) || inTextField(document.activeElement)) return;
  if (dialogOpen() || listOpen()) return;
  for (let i = mounted.length - 1; i >= 0; i--) {
    const t = mounted[i]!;
    const run = slash ? t.focusSearch : t.refresh;
    if (!run || !onScreen(t.root)) continue;
    e.preventDefault();
    run();
    return;
  }
}

function usePageKeys(root: RefObject<HTMLElement | null>, focusSearch: (() => void) | null, refresh: (() => void) | null) {
  const entry = useRef<PageKeys>({ root: null, focusSearch: null, refresh: null }).current;
  useClientLayoutEffect(() => {
    entry.root = root.current;
    entry.focusSearch = focusSearch;
    entry.refresh = refresh;
  });
  useEffect(() => {
    mounted.push(entry);
    if (mounted.length === 1) window.addEventListener("keydown", onPageKey);
    return () => {
      const i = mounted.indexOf(entry);
      if (i >= 0) mounted.splice(i, 1);
      if (mounted.length === 0) window.removeEventListener("keydown", onPageKey);
    };
  }, [entry]);
}

/**
 * The list page's head (the UI rules in AGENTS.md), right to left: refresh, search, filters (date / one select),
 * then the page's own figures and buttons:
 *   [title · count · chips] ··········· [children: figures, buttons] [filters] [search] [refresh]
 * - `search` is always a visible box; `/` focuses it from anywhere on the page with its text selected (type to
 *   replace, Backspace to clear); Esc leaves the box and keeps the text.
 * - `filters` holds the few filters a page has (a date, one select) when it needs no sidebar.
 * - the refresh icon spins while `refreshing` is true or while the promise `onRefresh` returns is pending; `R`
 *   refreshes from anywhere on the page.
 * - with several toolbars mounted (a page and a panel), `/` and `R` go to the most recently mounted one on screen.
 */
export function Toolbar({
  title,
  count,
  unit,
  chips,
  collapsed,
  onExpand,
  onRefresh,
  refreshing,
  filters,
  search,
  tabs,
  children,
}: {
  title: string;
  count?: number;
  unit?: string;
  chips?: Array<string>;
  collapsed?: boolean;
  onExpand?: () => void;
  onRefresh?: () => unknown;
  /** the page's data is being fetched (e.g. the list query's isFetching) */
  refreshing?: boolean;
  filters?: ReactNode;
  search?: ToolbarSearch;
  /** sister pages joined under one rail entry (a `Seg` or `Tabs`): shown in place of the title */
  tabs?: ReactNode;
  children?: ReactNode;
}) {
  const hostTabs = useContext(ToolbarTabsContext);
  tabs ??= hostTabs;
  const [pending, setPending] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const spinning = !!refreshing || pending;
  const refresh = async () => {
    if (!onRefresh) return;
    const r = onRefresh();
    if (r && typeof (r as Promise<unknown>).then === "function") {
      setPending(true);
      try {
        await r;
      } catch {
        /* the page reports its own errors */
      } finally {
        setPending(false);
      }
    }
  };
  usePageKeys(
    rootRef,
    search
      ? () => {
          // focus with the current text selected, so typing replaces it and Backspace clears it
          searchRef.current?.focus();
          searchRef.current?.select();
        }
      : null,
    onRefresh ? () => void refresh() : null,
  );
  return (
    <div className="toolbar" ref={rootRef}>
      {collapsed && onExpand && (
        <CollapseButton collapsed onToggle={onExpand} />
      )}
      {tabs ? (
        <div className="toolbar-tabs" aria-label={title}>
          {tabs}
        </div>
      ) : (
        <span className="toolbar-title">
          <Term label={title} />
        </span>
      )}
      {count != null && (
        <span className="ui-muted ui-num toolbar-count">
          {localeNumber(count)} {unit}
        </span>
      )}
      {chips?.map((c) => (
        <span key={c} className="ui-chip">
          {c}
        </span>
      ))}
      <span style={{ flex: 1 }} />
      {children}
      {filters && <div className="toolbar-filters">{filters}</div>}
      {search && (
        <div className="toolbar-search">
          <SearchBox
            value={search.value}
            onChange={search.onChange}
            placeholder={search.placeholder ?? "Search"}
            minChars={search.minChars}
            inputRef={searchRef}
          />
        </div>
      )}
      {onRefresh && (
        <button
          type="button"
          className="ui-iconbtn"
          onClick={() => void refresh()}
          aria-label="Refresh"
          aria-keyshortcuts="r"
          aria-busy={spinning || undefined}
          title={spinning ? "Loading…" : "Refresh (R)"}
        >
          <RefreshCw className={spinning ? "ui-spin" : undefined} />
        </button>
      )}
    </div>
  );
}
