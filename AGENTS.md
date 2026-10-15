# Agent instructions: @magadhtech/ui

This package is the UI kit of the Magadh consoles. Read the rules below before you build or change a page that uses
it, and before you change the kit itself.

**Kit rules:**
- Nothing here may import app code: no API client, react-query, router or app glossary. When a component needs
  something like that, it takes it as a prop or through a provider (see `TermsProvider glossary={...}`).
- Keep it light: React, lucide-react and TanStack Table are peers. Run `bun run size` after a change, and don't add a
  dependency without a reason.
- Styles are plain CSS on the tokens in `src/tokens.css`. Themes and dark mode come from CSS variables; no CSS-in-JS.
- Public API changes need a version bump and a line in the changelog.

## UI rules for pages built with the kit

### Toolbar (`Toolbar` in `src/listpage.tsx`)

```
[tabs or title · count · chips] ··········· [page buttons, figures] [filters: date / select] [search] [refresh]
```

- Read from the right: **refresh, then search, then the date / filters**, then the page's own buttons and figures.
- **Search is in the toolbar and always visible**: `Toolbar search={{ value, onChange, placeholder }}`. Never use a
  `SearchBox` in the sidebar, and never collapse it to an icon.
  - `/` focuses it from anywhere.
  - Focusing it again (by `/`, a click or Tab) selects the keyword already there, so typing starts a new search and
    Backspace clears it.
  - Esc leaves the box and keeps the text.
- **Refresh spins while data loads.** Pass `refreshing={q.isFetching}`, or return the refetch promise from
  `onRefresh`. `R` refreshes from anywhere on the page: not while typing, not under a dialog or the file viewer.
- **Actions**: the primary action is a button in the toolbar; the other page actions go behind one `MoreMenu`
  (`menu.tsx`). Never put a separate band of buttons above the table.
- **Headline figures** (counts, the day's totals) go inline in the toolbar (`ToolbarStats` in
  `erp/panels/field_shared.tsx`), never in a band above the table.
- **Few filters, no sidebar.** When a sidebar would hold only search and a date (or one more small select), put the
  date or select in `Toolbar filters={…}` and drop the `Sidebar`. An empty sidebar is always removed. Keep a sidebar
  only for real filter groups (status lists with counts, several facets). When a page keeps its sidebar, its 2–4
  choice toggles go in the sidebar too, and a page's summary figures can sit in one summary block at its top
  (Bank Report). Chips in the toolbar only repeat filters you can't see (the sidebar is hidden).
- **Filter groups** (`FilterGroup`): a group whose body is one row, or one control, has no show/hide arrow. The kit
  measures this, so don't add the arrow back.

### Tables (`DenseTable` in `src/table.tsx`)

- **`loading` is required**: pass the query's `isFetching` (not `isLoading`). Every load looks the same, whether
  first load, background refetch or toolbar refresh: a veil plus a spinner, fading in after 150 ms. There is no progress
  bar and no skeleton rows. A static table passes `loading={false}`.
- **Row height comes from the kit**, after the MUI Data Grid densities. The default is 40 px rows, a 44 px header and
  10 px cell padding; the comfortable and large densities scale these. Pick the height from the content:
  - `lines={1}` (default);
  - `lines={2}`: a value plus one muted `<span className="sub">` detail;
  - `lines={3}`: two detail lines.

  Never override row heights or cell padding per page.
- **Row actions go in a row menu** (`onRowContextMenu` with `useContextMenu` / `actionsToMenu`; `confirm` for risky
  ones), never a cell full of small buttons. A row click opens the detail panel.
- **Column choices live in the table's bottom bar**: "Customize columns" sits by the pager, on every table, and
  never in the toolbar or the sidebar. Pass `columnVisibility` + `onColumnVisibility` (from `useListState`: `L.setCols`);
  a table given neither keeps its own choice per table in the browser.
- **`DenseTable` is the page's list** (sorting, paging, column settings, loading overlay, selection, row menu).
  **`MiniTable`** (`forms.tsx`) is a small, already-loaded grid inside a panel, form or card (no paging or
  sorting; `rowClassName` highlights a row). Never hand-write a `<table>` except for print layouts.

### Inputs

- **2–4 choices: a `ToggleGroup`** (`primitives.tsx`). Every choice is visible, counts are optional, and
  there is **no "All" button**: nothing picked means all, and clicking the picked choice again clears it. Use a select
  for 5 or more choices, and an `Autocomplete` for searchable lists. A view switch (not a filter) is a `Seg`.
- **Search-then-pick is one `Autocomplete`** (`autocomplete.tsx`; `useKeepPicked` for server search; see
  `RefPicker` in `erp/panels/field_shared.tsx`). Never put a search input next to a `<select>` or above a list of
  result buttons. This holds across the whole project.
- **Dates** use the kit date-range picker (`daterange.tsx`): its shortcuts sit in two rows no wider than the
  calendar, and a second click on the field closes it.
- Forms use `FormRow` (label, `required`, `error`, `hint`) and `SaveBar`. Validate before sending; show a toast on
  success.
- Debounce with `useDebounced` from `./hooks`, not a hand-made timer. Don't import it from
  `pickers`, which loads the data client and breaks tests.

### One component per job (no local copies)

| Need | Use |
| --- | --- |
| Open an image or a file | `useFileViewer` + `FileThumb` (`fileviewer.tsx`); `viewerFiles` / `fileUrl` (`erp/files.ts`). Several files open as one list (← → move, zoom, rotate, PDFs inline). Never `window.open` a photo or a hand-made lightbox. |
| Pick or upload files | `FileInput` (`fileinput.tsx`): drag and drop, `accept`, `maxSizeMb`, `maxFiles`, previews in the viewer |
| Status or tag chip | `StatusChip` / `ToneChip` (`chip.tsx`) with plain-word labels; no local `TONE_VAR` or hex colours |
| Dates, money, numbers | `day`, `dayTime`, `hhmm`, `monthYear`, `ago`, `num`, `rupees`, `mt`, `kg` (`format.ts`) |
| Empty state | `Empty` (`empty.tsx`; `compact` inside panels) |
| Confirm a risky action | `ConfirmPop` / `Action.confirm` / the row menu's `confirm`. Destructive deletes pass `typed: "DELETE"`. Never `window.confirm`, `alert` or `prompt`. |
| Download a file | `saveBlob` (`data/reports.ts`) |
| Toast | `toast` (`toast.tsx`) |

When the kit lacks something, add it to the kit once rather than building it into a page.

### Pages and navigation

- **Sister pages share one rail entry.** Pages of one entity or one flow are a set in `PAGE_TAB_SETS`
  (`src/erp/page_tabs.tsx`). The set's first page stays on the rail, labelled for the whole set, and the others are
  `group: "tab"` in `src/erp/modules.tsx` with a `tabLabel`.
  - The shell puts the tab strip in the page's toolbar in place of the title, so a page joins a set by its path
    alone.
  - Pages that draw their own strip are listed in `OWN_STRIP`.
  - A merged rail entry shows when the person may open any page of its set, and leads to the first one they may
    open (`RAIL_GRANTS` covers redirect-only pages).
  - Don't give a page a second tab row when it already has a view switch.
- **Module landing.** A module tab opens the last page used in that module (or its first allowed page); the M logo
  opens the module's page list (`/<module>/all`).
- **Detail view setting** (side panel, popup or full page, in `appearance.tsx`): leaving full page returns to
  whichever of side panel or popup the person last chose.

### Words

- Use plain language and no abbreviations ("Present", not "P"; "Half day", not "H D").
- Column headers are in Title Case.
- Never show raw enum values ("Shop visit", not `SHOP_VISIT`).
- An empty cell shows a quiet "—".

### Checks before you call a page done

`bun run typecheck` clean; `bun test` green (`orders_base` is known to be flaky); the page opens with no console
errors; its forms work when filled in for real.

