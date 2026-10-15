// The data pages: the page table, the small table, the pager, the toolbar, the filter sidebar, list state in the URL
// and the page order.
import type { ReactNode } from "react";
import { MiniTable, useKitRouter } from "@mds/ui";
import { Code, Demo, Page, Props, Section } from "../ui";

import DenseTableClient from "../demos/data/DenseTableClient";
import denseTableClient from "../demos/data/DenseTableClient.tsx?raw";
import DenseTableServer from "../demos/data/DenseTableServer";
import denseTableServer from "../demos/data/DenseTableServer.tsx?raw";
import DenseTableRows from "../demos/data/DenseTableRows";
import denseTableRows from "../demos/data/DenseTableRows.tsx?raw";
import MiniTableLines from "../demos/data/MiniTableLines";
import miniTableLines from "../demos/data/MiniTableLines.tsx?raw";
import PaginationCards from "../demos/data/PaginationCards";
import paginationCards from "../demos/data/PaginationCards.tsx?raw";
import ToolbarFull from "../demos/data/ToolbarFull";
import toolbarFull from "../demos/data/ToolbarFull.tsx?raw";
import ToolbarTabs from "../demos/data/ToolbarTabs";
import toolbarTabs from "../demos/data/ToolbarTabs.tsx?raw";
import SidebarFilters from "../demos/data/SidebarFilters";
import sidebarFilters from "../demos/data/SidebarFilters.tsx?raw";
import ListStateDemo from "../demos/data/ListStateDemo";
import listStateDemo from "../demos/data/ListStateDemo.tsx?raw";
import PageOrderDemo from "../demos/data/PageOrderDemo";
import pageOrderDemo from "../demos/data/PageOrderDemo.tsx?raw";

/** a link to another page of the site, through the kit's router */
function To({ to, children }: { to: string; children: ReactNode }) {
  const { Link } = useKitRouter();
  return <Link to={to}>{children}</Link>;
}

type SigRow = { name: string; sig: string; does: ReactNode };
/** a hand-written signature table for hooks and functions (props.json covers components only) */
function Sig({ label, rows }: { label: string; rows: Array<SigRow> }) {
  return (
    <div className="doc-props">
      <MiniTable
        label={label}
        rows={rows}
        rowKey={(r) => r.name}
        cols={[
          { key: "name", header: "Name", cell: (r) => <code className="doc-prop">{r.name}</code> },
          { key: "sig", header: "Signature", cell: (r) => <code className="doc-type">{r.sig}</code> },
          { key: "does", header: "What it does", cell: (r) => r.does },
        ]}
      />
    </div>
  );
}

// ---------------------------------------------------------------- DenseTable

export function DenseTablePage() {
  return (
    <Page
      title="DenseTable"
      lead="The page's list: a sticky header, sorting, a pager with a column picker in the bottom bar, selection, a row menu, expandable rows and one loading overlay. Built on TanStack Table column definitions."
    >
      <Section title="Examples">
        <Demo title="Client-side sorting and paging, two-line rows" source={denseTableClient}>
          <DenseTableClient />
        </Demo>
        <Demo title="Server paging, loading overlay, empty text" source={denseTableServer}>
          <DenseTableServer />
        </Demo>
        <Demo title="Selection, row menu, expandable rows" source={denseTableRows}>
          <DenseTableRows />
        </Demo>
      </Section>

      <Section title="Usage">
        <p>
          Columns are TanStack <code>ColumnDef</code>s. The kit reads three fields of <code>meta</code>: <code>align</code>{" "}
          (<code>"right"</code> for numbers and money), <code>label</code> (the name in the column picker when the header is
          not a string) and <code>cls</code> (an extra cell class). <code>enableHiding: false</code> keeps a column in the
          picker but disables its box.
        </p>
        <Code>{`
const columns: Array<ColumnDef<Order>> = [
  { accessorKey: "id", header: "Order" },
  { accessorKey: "amount", header: "Amount", meta: { align: "right" }, cell: ({ row }) => money(row.original.amount) },
];

<div className="mds-main">                    {/* or any flex column with a height */}
  <Toolbar … />
  <DenseTable label="orders" columns={columns} data={rows} getRowId={(r) => r.id}
    loading={q.isFetching}
    sorting={L.sorting} onSortingChange={L.onSortingChange}
    pagination={L.pagination} onPaginationChange={L.onPaginationChange}
    columnVisibility={L.columnVisibility} onColumnVisibility={L.setCols} />
</div>`}</Code>
        <p>
          The table fills its parent (<code>flex: 1</code>), so give the parent a height: a <code>mds-main</code> inside the
          app shell, or a fixed-height flex column.
        </p>
      </Section>

      <Section title="Paging and sorting">
        <ul>
          <li>
            <strong>Client</strong> (default): pass every row in <code>data</code>; the table sorts and slices it.
          </li>
          <li>
            <strong>Server</strong>: <code>manual</code> plus <code>rowCount</code> (the total). <code>data</code> is one
            page; fetch again when <code>sorting</code> or <code>pagination</code> change.
          </li>
          <li>
            A <code>pageIndex</code> past the last page (<code>?page=9</code> on 150 rows) moves to the last page by itself,
            through <code>onPaginationChange</code>, once loading is done.
          </li>
          <li>
            A sort id that names no column (a server-only key) is ignored by the table, so it does not warn on every render.
          </li>
          <li>
            <code>pageSizes</code> sets the "Rows Per Page" choices (25, 50, 100, 200 by default). <code>note</code> adds a
            muted remark after the count.
          </li>
        </ul>
      </Section>

      <Section title="Rows of 1, 2 or 3 lines">
        <p>
          <code>lines</code> picks the row height from the content; the kit sets the height for the reader's density.
          Never override row heights or cell padding per page.
        </p>
        <ul>
          <li>
            <code>lines={"{1}"}</code> (default): one value per cell.
          </li>
          <li>
            <code>lines={"{2}"}</code>: a value plus one muted detail, <code>{'<span className="sub">'}</code>.
          </li>
          <li>
            <code>lines={"{3}"}</code>: a value and two <code>.sub</code> lines.
          </li>
        </ul>
      </Section>

      <Section title="Column picker">
        <ul>
          <li>
            "Customize columns" sits in the bottom bar, by the pager, whenever the table has more than one labelled column.
            It lists every column with a string <code>header</code> or a <code>meta.label</code>.
          </li>
          <li>
            The page keeps the picks: pass <code>columnVisibility</code> + <code>onColumnVisibility</code> (from{" "}
            <code>useListState</code>: <code>L.columnVisibility</code> / <code>L.setCols</code>). Add{" "}
            <code>columnOrder</code> + <code>onColumnOrder</code> and the picker gets drag handles and arrows, and the header
            cells drag too.
          </li>
          <li>
            Pass neither and the table keeps its own picks in the browser under{" "}
            <code>{"<prefix>.table.<storageId>.cols"}</code>. <code>storageId</code> defaults to <code>label</code>; set it
            when two tables share a label, and keep it when you rename the label.
          </li>
          <li>
            Pass only <code>columnVisibility</code> and the page fixes the columns: no picker.
          </li>
          <li>
            Column widths drag on the header's right edge and are saved per table (<code>.sizes</code>); a double-click
            resets one. <code>enableColumnResizing={"{false}"}</code> turns this off.
          </li>
        </ul>
      </Section>

      <Section title="Loading, errors and the empty row">
        <ul>
          <li>
            <code>loading</code> is required. Pass the query's <code>isFetching</code> (not <code>isLoading</code>), or{" "}
            <code>false</code> for a static table. Every load looks the same: a veil and a spinner over the table, after a
            short delay so fast answers do not flicker. Old rows stay under the veil.
          </li>
          <li>
            Before the first data, the body keeps a blank area instead of "Nothing matches."
          </li>
          <li>
            <code>error</code> shows a red row; <code>emptyText</code> replaces "Nothing matches." and may be a node with a
            way out (clear the search, widen the dates).
          </li>
        </ul>
      </Section>

      <Section title="Keyboard and mouse">
        <ul>
          <li>Rows are one tab stop: Tab lands on one row, ↑ ↓ move between rows, Enter opens it (<code>onRowClick</code>).</li>
          <li>
            Sort: click a header, or Enter / Space on it. Clicking again flips the direction, then clears the sort.
          </li>
          <li>
            With <code>selectedId</code> and <code>onRowClick</code>, <code>[</code> and <code>]</code> open the previous /
            next row.
          </li>
          <li>
            Selection: the checkbox column, ⌘/Ctrl-click a row, ⇧-click for a range, Space on a focused row, ⌘A for the
            page. Esc clears the selection when no row is open. <code>selectable</code> hides the box on rows that cannot
            be picked.
          </li>
          <li>
            Row menu: right-click, the <code>.</code> key, ⇧F10 or the row's <code>⋯</code> button all call{" "}
            <code>onRowContextMenu(row, at)</code>; open <code>useContextMenu</code> there.
          </li>
          <li>
            Expandable rows: the chevron, or → / ← on a focused row. → again moves focus into the second row's first{" "}
            <code>[data-nav]</code> control.
          </li>
          <li>
            <code>onRowDrop</code>: files dropped on a row (a statement onto its account); the row highlights while a file
            hovers it.
          </li>
        </ul>
      </Section>

      <Section title="Rules">
        <ul>
          <li>Row actions go in the row menu, never a cell of small buttons. A row click opens the detail panel.</li>
          <li>Column choices live in the bottom bar only, never in the toolbar or the sidebar.</li>
          <li>
            A small, already-loaded table inside a panel is a <To to="/components/mini-table">MiniTable</To>. Never
            hand-write a <code>{"<table>"}</code> except for print.
          </li>
        </ul>
      </Section>

      <Section title="Props">
        <Props of="DenseTable" />
      </Section>
    </Page>
  );
}

// ---------------------------------------------------------------- MiniTable

export function MiniTablePage() {
  return (
    <Page
      title="MiniTable"
      lead="A small, already-loaded table inside a panel, form or card: order lines, a ledger, a list of documents. It is DenseTable in its bare mode, with plain { key, header, cell } columns."
    >
      <Section title="Examples">
        <Demo title="Order lines with highlighted rows, and an empty table" source={miniTableLines}>
          <MiniTableLines />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>Compact rows sized to the content; no pager, sorting, column picker or loading veil.</li>
          <li>
            <code>rowClassName</code> highlights a row: <code>warn</code> (amber), <code>error</code> (red) or{" "}
            <code>on</code> (picked).
          </li>
          <li>
            <code>align: "right"</code> for numbers; <code>align: "acts"</code> for a narrow actions column.{" "}
            <code>width</code> sets a column's width in px (<code>"120px"</code>).
          </li>
          <li>
            <code>className="rows2"</code> gives two-line rows (a value plus a <code>.sub</code> detail).
          </li>
          <li>
            <code>empty</code> is the empty row's text ("Nothing here." by default); <code>null</code> renders nothing at all
            when there are no rows.
          </li>
          <li>
            <code>onRowClick</code> and <code>onRowContextMenu</code> work as on DenseTable (right-click or <code>.</code>{" "}
            opens the menu).
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          Use MiniTable for a few rows already in hand. A list that pages, sorts or loads is a{" "}
          <To to="/components/dense-table">DenseTable</To>.
        </p>
      </Section>
      <Section title="Props">
        <Props of="MiniTable" />
      </Section>
    </Page>
  );
}

// ---------------------------------------------------------------- Pagination

export function PaginationPage() {
  return (
    <Page
      title="Pagination"
      lead="The pager bar every list shows under itself: ‹ ›, “21-40 of 683 partners” and Rows Per Page. DenseTable draws its own; use Pagination alone under a list that is not a table, such as cards or a board."
    >
      <Section title="Examples">
        <Demo title="Under a grid of cards" source={paginationCards}>
          <PaginationCards />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            <code>pageIndex</code> is 0-based. A <code>pageIndex</code> past the last page reads as the last page.
          </li>
          <li>Changing Rows Per Page goes back to the first page.</li>
          <li>
            <code>pageSizes={"{[]}"}</code> hides the Rows Per Page picker. <code>extra</code> puts controls before it (the
            table puts Customize columns there).
          </li>
          <li>Numbers follow the kit's locale.</li>
        </ul>
      </Section>
      <Section title="Props">
        <Props of="Pagination" />
      </Section>
    </Page>
  );
}

// ---------------------------------------------------------------- Toolbar

export function ToolbarPage() {
  return (
    <Page
      title="Toolbar"
      lead="The head of a list page: title, count and chips on the left; the page's buttons, filters, search and refresh on the right."
    >
      <Section title="Layout">
        <Code lang="text">{`[tabs or title · count · chips] ··········· [children: figures, buttons] [filters] [search] [refresh]`}</Code>
        <p>Read it from the right: refresh, then search, then the date and filters, then the page's own buttons and figures.</p>
      </Section>
      <Section title="Examples">
        <Demo title="Filters, search, refresh, primary button and More" source={toolbarFull}>
          <ToolbarFull />
        </Demo>
        <Demo title="Sister pages as tabs, headline figures" source={toolbarTabs}>
          <ToolbarTabs />
        </Demo>
      </Section>
      <Section title="Keyboard">
        <ul>
          <li>
            <code>/</code> focuses the search from anywhere on the page, with its text selected: type to replace it,
            Backspace to clear it. Focusing it again by a click or Tab also selects the text.
          </li>
          <li>Esc leaves the search box and keeps the text.</li>
          <li>
            <code>R</code> refreshes. Neither key works while typing in a field, under a dialog or the file viewer, or while
            a list, popover, menu or ⌘K is open.
          </li>
          <li>
            With several toolbars mounted (a page and a panel), the keys go to the most recently mounted one that is on
            screen and has a search (for <code>/</code>) or a refresh (for <code>R</code>).
          </li>
        </ul>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            The refresh icon spins while <code>refreshing</code> is true (the query's <code>isFetching</code>) or while the
            promise returned by <code>onRefresh</code> is pending.
          </li>
          <li>
            <code>search.minChars</code> shows "Type N more characters to search" under the box until the text is long
            enough.
          </li>
          <li>
            <code>tabs</code> replaces the title with a <code>Seg</code> or <code>Tabs</code> for sister pages. A host can
            give every toolbar below it the same tabs through <code>ToolbarTabsContext</code>; a page's own{" "}
            <code>tabs</code> wins.
          </li>
          <li>
            <code>collapsed</code> + <code>onExpand</code> show the "Show filters" button when the page's sidebar is hidden;
            <code>chips</code> then repeat the filters the reader cannot see (see{" "}
            <To to="/components/sidebar">Sidebar</To>).
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <ul>
          <li>Search is always a visible box in the toolbar, never in the sidebar and never collapsed to an icon.</li>
          <li>
            One primary button; the other page actions go behind one <code>MoreMenu</code>. Never a band of buttons above
            the table.
          </li>
          <li>
            Headline figures go inline with <code>ToolbarStats</code>, never in a band above the table.
          </li>
          <li>
            Few filters (a date and one select) go in <code>filters</code> and the page has no sidebar.
          </li>
        </ul>
      </Section>
      <Section title="Props">
        <Props of="Toolbar" />
      </Section>
    </Page>
  );
}

// ---------------------------------------------------------------- Sidebar

export function SidebarPage() {
  return (
    <Page
      title="Sidebar and FilterGroup"
      lead="The filter column at the left of a list page, for pages with real filter groups: status lists with counts, several facets. A page with only a date or one select puts it in the toolbar instead."
    >
      <Section title="Examples">
        <Demo title="Filter groups with counts, a collapse, and chips in the toolbar" source={sidebarFilters}>
          <SidebarFilters />
        </Demo>
      </Section>
      <Section title="The parts">
        <ul>
          <li>
            <code>Sidebar</code>: the column. <code>collapsed</code> hides it (width 0, out of the tab order,{" "}
            <code>inert</code>); <code>footer</code> pins a row at its foot.
          </li>
          <li>
            <code>SidebarTop</code>: a row at the top, for a heading and the <code>CollapseButton</code>.
          </li>
          <li>
            <code>FilterGroup</code>: a titled group that shows and hides its body. <code>badge</code> shows how many are
            picked; <code>right</code> adds a control beside the title; <code>defaultOpen={"{false}"}</code> starts it
            closed.
          </li>
          <li>
            <code>CountCheckbox</code>: one choice with its count. A choice with a count of 0 that is not ticked is
            disabled. <code>tone</code> adds a dot, <code>icon</code> an icon; <code>level</code>, <code>strong</code> and{" "}
            <code>indeterminate</code> build a tree.
          </li>
          <li>
            <code>SidebarLink</code>: a text button ("Clear filters", a saved view; <code>active</code> makes it bold).{" "}
            <code>Banner</code>: an info note.
          </li>
          <li>
            <code>SearchBox</code>: the search input the Toolbar uses. It selects its text on focus, leaves on Esc and shows
            a "type N more" hint with <code>minChars</code>. Pages use <code>Toolbar search</code>, not a SearchBox of
            their own.
          </li>
        </ul>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            A group whose body is one control (a toggle group, a picker, a select, a date) or one row tall has no show/hide
            arrow: its head is a plain label. The kit measures this, so don't add the arrow back.
          </li>
          <li>
            When the sidebar is collapsed, pass <code>Toolbar collapsed onExpand</code> so the toolbar shows "Show filters",
            and <code>chips</code> for the filters that are now out of sight.
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <ul>
          <li>Keep a sidebar only for real filter groups. An empty sidebar is removed.</li>
          <li>When a page keeps its sidebar, its 2–4 choice toggles go in the sidebar too.</li>
          <li>Never put a SearchBox in the sidebar: search is the toolbar's.</li>
        </ul>
      </Section>
      <Section title="Props">
        <Props of="Sidebar" />
        <Props of="FilterGroup" />
        <Props of="CountCheckbox" />
        <Props of="SidebarTop" />
        <Props of="CollapseButton" />
        <Props of="SidebarLink" />
        <Props of="SearchBox" />
      </Section>
    </Page>
  );
}

// ---------------------------------------------------------------- list state in the URL

export function ListStatePage() {
  return (
    <Page
      title="List state in the URL"
      lead="useListState keeps a list page's search, sort, page and page size in the URL's search params, debounces the search box, and saves the reader's column picks and order. Pages keep their own columns, filters and panel."
    >
      <Section title="Examples">
        <Demo title="useListState over React state" source={listStateDemo}>
          <ListStateDemo />
        </Demo>
        <p>
          The line over the table is the query string the state would write. This site has no router, so the demo keeps
          the search object in React state; an app passes its router's.
        </p>
      </Section>

      <Section title="The navigate shape">
        <p>
          <code>useListState(s, navigate, opts)</code> takes the current search object and a <code>navigate</code> called
          the TanStack Router way, with an updater: <code>{"navigate({ search: (prev) => next, replace: true })"}</code>.
          Keep <code>navigate</code> stable (<code>useCallback</code>): the search box's debounce depends on it.
        </p>
        <Code>{`
// TanStack Router: pass its own
const s = Route.useSearch();
const navigate = Route.useNavigate();
const L = useListState(s, navigate, { defaultSort: "placed", colsKey: "orders.cols" });`}</Code>
        <Code>{`
// plain history, no router library
const toParams = (s: Record<string, unknown>) =>
  new URLSearchParams(Object.entries(s).flatMap(([k, v]) => (v == null || v === "" ? [] : [[k, String(v)]])));

function useUrlSearch() {
  const read = () => baseSearch(Object.fromEntries(new URLSearchParams(location.search)));
  const [s, setS] = useState(read);
  useEffect(() => {
    const back = () => setS(read());
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, []);
  const navigate = useCallback((o: { search: (prev: BaseSearch) => BaseSearch }) => {
    const next = o.search(read());
    history.replaceState(null, "", "?" + toParams(next));
    setS(next);
  }, []);
  return [s, navigate] as const;
}`}</Code>
        <Code>{`
// React Router
const [params, setParams] = useSearchParams();
const s = baseSearch(Object.fromEntries(params));
const navigate = useCallback(
  (o: { search: (prev: BaseSearch) => BaseSearch }) =>
    setParams((p) => toParams(o.search(baseSearch(Object.fromEntries(p)))), { replace: true }),
  [setParams],
);`}</Code>
      </Section>

      <Section title="What it returns">
        <Sig
          label="useListState result"
          rows={[
            { name: "qInput / setQInput", sig: "string / (v: string) => void", does: "The search box's text. Settles into q after 250 ms and goes back to page 1. Pass to Toolbar search." },
            { name: "sorting / onSortingChange", sig: "SortingState / (s) => void", does: "For DenseTable. Writes sort and dir; opts.sortable limits which columns may sort." },
            { name: "pagination / onPaginationChange", sig: "PaginationState / (p) => void", does: "For DenseTable. page is 1-based in the URL and left out on page 1; size is left out at the default." },
            { name: "columnVisibility / setCols", sig: "VisibilityState / (v) => void", does: "The column picks, saved as <prefix>.<colsKey>." },
            { name: "columnOrder / setOrder", sig: "string[] / (o: string[]) => void", does: "The column order, saved as <prefix>.<colsKey>.order; [] is the page's own order." },
            { name: "set", sig: "(patch: Partial<S>) => void", does: "Merges a patch into the search params (a filter: set({ status, page: undefined }))." },
            { name: "collapsed / setCollapsed", sig: "boolean / (v: boolean) => void", does: "The sidebar's collapsed state (not in the URL)." },
            { name: "page, size, sort, dir", sig: "number, number, string, 'asc' | 'desc'", does: "The current values with defaults applied." },
          ]}
        />
        <Sig
          label="useListState options"
          rows={[
            { name: "defaultSort", sig: "string", does: "The column id to sort by when the URL has no sort." },
            { name: "defaultDir", sig: "'asc' | 'desc'", does: "Its direction; 'desc' by default." },
            { name: "defaultSize", sig: "number", does: "Rows per page when the URL has no size; 50 by default." },
            { name: "colsKey", sig: "string", does: "The name the column picks and order are saved under." },
            { name: "sortable", sig: "ReadonlySet<string>", does: "Column ids the server can sort by; a click on another header is ignored." },
          ]}
        />
      </Section>

      <Section title="Search helpers">
        <p>
          Small parsers for <code>validateSearch</code>. URL values arrive as strings; each helper answers{" "}
          <code>undefined</code> for anything it cannot read, so a bad link falls back to the default.
        </p>
        <Sig
          label="search helpers"
          rows={[
            { name: "baseSearch", sig: "(s: Record<string, unknown>) => BaseSearch", does: "The shared fields, validated: q, sort, dir, page (≥ 2), size, id, tab, view. Spread it into a page's own validateSearch." },
            { name: "str", sig: "(v: unknown) => string | undefined", does: "A non-empty string." },
            { name: "searchNum", sig: "(v: unknown, min = 1) => number | undefined", does: "A whole number ≥ min from a number or numeric string. Exported as num from @mds/ui/data/listpage." },
            { name: "oneOf", sig: "(v: unknown, allowed: readonly T[]) => T | undefined", does: "One of a fixed list of values." },
            { name: "csv / join", sig: "(v?: string) => string[] / (a: string[]) => string | undefined", does: "A comma list in the URL ⇄ an array; join gives undefined for an empty array." },
            { name: "toggle", sig: "(list: string[], key: string, on: boolean) => string[]", does: "Adds or removes one key (a ticked checkbox)." },
          ]}
        />
        <Code>{`
type OrderSearch = BaseSearch & { status?: string[]; yard?: string };
const validateSearch = (s: Record<string, unknown>): OrderSearch => ({
  ...baseSearch(s),
  status: csv(str(s.status)),
  yard: str(s.yard),
});`}</Code>
      </Section>

      <Section title="Selection and copy">
        <Sig
          label="selection helpers"
          rows={[
            { name: "useSelection", sig: "(rows: T[], getRowId, resetKey?) => { selected, setSelected, clear, selectedRows, count }", does: "Selected ids that survive paging, plus the rows behind them for bulk actions. Cleared when resetKey changes: pass the filter params." },
            { name: "rowsToTsv", sig: "(rows: T[], columns, visibility?) => string", does: "Rows as tab-separated text in the visible columns, with a header row, for pasting into Excel." },
          ]}
        />
      </Section>
    </Page>
  );
}

// ---------------------------------------------------------------- page order

export function PageOrderPage() {
  return (
    <Page
      title="Page order"
      lead="The reader's own order of a module's pages and which ones are hidden from the rail, saved per module in the browser. AppShell's useRailLayout uses it; these pieces are for a menu of your own."
    >
      <Section title="Examples">
        <Demo title="usePageLayout with the Customize pages popover" source={pageOrderDemo}>
          <PageOrderDemo />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            Saved as <code>{"<prefix>.<module>.pages"}</code> = <code>{"{ order: [to…], hidden: [to…] }"}</code>. The first
            render (and the server's) uses the app's own order; the saved one is read right after mount.
          </li>
          <li>
            Pages the saved order does not know (added after the reader arranged theirs) join after the ordered ones.
          </li>
          <li>
            In <code>PagesPop</code> a checkbox shows or hides a page, the grip drags it, the arrows move it one place, and
            Reset goes back to the app's order. The last visible page of a group cannot be hidden.
          </li>
          <li>
            Hidden pages stay reachable: their URLs work, and the ⌘K list from <code>useRailLayout</code> still shows them.
          </li>
          <li>
            In an app frame you rarely need these directly: <To to="/components/app-shell">useRailLayout</To> wires the
            same state to the rail (drag, right-click) and the rail's Customize pages button.
          </li>
        </ul>
      </Section>
      <Section title="Hooks and functions">
        <Sig
          label="page order helpers"
          rows={[
            { name: "usePageLayout", sig: "(module: string) => { layout, setOrder, setHidden, showAll, reset, arrange, isHidden, customized }", does: "The saved arrangement of one module. arrange(items) orders them and drops the hidden ones." },
            { name: "arrangePages", sig: "(items: T[], layout: PageLayout) => T[]", does: "Pure: ordered, without the hidden pages." },
            { name: "orderPages", sig: "(items: T[], order: string[]) => T[]", does: "Pure: the saved order first, then the pages it does not know." },
            { name: "readPageLayout", sig: "(module: string) => PageLayout", does: "Reads the saved layout from localStorage (empty when missing or blocked)." },
            { name: "movePage / dropPage", sig: "(ids, id, dir) / (ids, dragged, target, before)", does: "Move one id a place up or down / drop it before or after another." },
          ]}
        />
      </Section>
      <Section title="Props">
        <Props of="PagesPop" />
      </Section>
    </Page>
  );
}
