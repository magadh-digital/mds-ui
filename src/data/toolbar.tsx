import { RefreshCw } from "lucide-react";
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import { CollapseButton, SearchBox } from "./sidebar";
import { Term } from "../display/term";

export type ToolbarSearch = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** characters before the search is sent (shows a "type N more" hint) */
  minChars?: number;
};

/**
 * The list page's head (the UI rules in AGENTS.md), right to left: refresh, search, filters (date / one select),
 * then the page's own figures and buttons:
 *   [title · count · chips] ··········· [children: figures, buttons] [filters] [search] [refresh]
 * - `search` is always a visible box; `/` focuses it from anywhere on the page with its text selected (type to
 *   replace, Backspace to clear); Esc leaves the box and keeps the text.
 * - `filters` holds the few filters a page has (a date, one select) when it needs no sidebar.
 * - the refresh icon spins while `refreshing` is true or while the promise `onRefresh` returns is pending; `r`
 *   refreshes from anywhere on the page.
 */
/**
 * Tabs a host puts in every toolbar below it (an app shell: the sister-page strip of a merged rail entry), shown when
 * the page passes no `tabs` of its own. One rendered toolbar per page, so the strip appears once.
 */
export const ToolbarTabsContext = createContext<ReactNode>(null);

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
  /** sister pages joined under one rail entry (erp/page_tabs.tsx PageTabs): shown in place of the title */
  tabs?: ReactNode;
  children?: ReactNode;
}) {
  const hostTabs = useContext(ToolbarTabsContext);
  tabs ??= hostTabs;
  const [pending, setPending] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!search) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      // focus with the current text selected, so typing replaces it and Backspace clears it
      searchRef.current?.focus();
      searchRef.current?.select();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [!!search]);
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
  // `r` refreshes from anywhere on the page (not while typing, not under a dialog / the file viewer)
  useEffect(() => {
    if (!onRefresh) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.key !== "r" && e.key !== "R") || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (document.querySelector(".inv-backdrop, .cmdk")) return;
      e.preventDefault();
      void refreshRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [!!onRefresh]);
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  return (
    <div className="toolbar">
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
          {count.toLocaleString("en-IN")} {unit}
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
