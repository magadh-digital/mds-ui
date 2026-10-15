# @mds/ui

A light React UI kit for data-heavy apps: list pages with a toolbar and filters, a dense table with a column picker and
row menus, side panels, searchable pickers, a date range, a file viewer, an app shell with a side rail and a ⌘K palette.

- **Plain CSS variables.** A theme is a set of token values; dark mode comes free. No CSS-in-JS.
- **Three dependencies** (`@floating-ui/react`, `lucide-react` for the icons, `@tanstack/react-table` under the
  tables); React is the only peer. Bundlers keep only what you import, so an app pays for the components it uses.
- **No router required.** The shell and palette use a tiny adapter: the browser's history by default, or your router.
- **Its own calendar and date type.** No date library: `date()` covers the dayjs calls a list page needs.

```bash
npm install @mds/ui
```

## Quick start

```tsx
import "@mds/ui/styles.css";
import { Toolbar, DenseTable, ToggleGroup, StatusChip, DateRange, Toaster, dayTime } from "@mds/ui";

export function Orders() {
  const [status, setStatus] = useState<"" | "open" | "closed">("");
  const [range, setRange] = useState({});
  const [q, setQ] = useState("");
  return (
    <div className="main">
      <Toolbar
        title="Orders"
        count={rows.length}
        onRefresh={refetch}
        refreshing={isFetching}
        filters={
          <>
            <DateRange value={range} onChange={setRange} />
            <ToggleGroup label="Status" value={status} onChange={setStatus}
              options={[{ value: "open", label: "Open" }, { value: "closed", label: "Closed" }]} />
          </>
        }
        search={{ value: q, onChange: setQ, placeholder: "Search orders" }}
      />
      <DenseTable label="Orders" columns={columns} data={rows} getRowId={(r) => r.id} loading={isFetching}
        sorting={sorting} onSortingChange={setSorting} pagination={page} onPaginationChange={setPage} />
      <Toaster />
    </div>
  );
}
```

Import everything from `@mds/ui` and the stylesheet from `@mds/ui/styles.css`. A single module can also be imported by
its folder path (`@mds/ui/inputs/daterange`, `@mds/ui/core/date`).

## What's inside

| Folder | Components and helpers |
| --- | --- |
| `core` | `date()` (dayjs-style dates), `day` / `dayTime` / `hhmm` / `rupees` / `num` formats, `useDebounced`, form checks, the router adapter (`RouterProvider`, `useKitRouter`), `configureStorage` |
| `overlay` | `Tip`, `Pop`, `EditPop`, `HoverPop`, `ConfirmPop`, `ConfirmDialog` + `useConfirm()`, row menu (`useContextMenu`, `MoreMenu`), `Dialog`, `toast`, the ⌘K `CommandPalette` |
| `inputs` | `Button`, `IconButton`, `LinkButton`, `Input`, `Select`, `Textarea`, `Checkbox`, `Autocomplete` (single, multiple, groups, server search), `DateRange`, `DateInput`, `ToggleGroup` (one or several), `Seg`, `Switch`, `FileInput`, `FormRow`, `SaveBar` |
| `display` | `ToneChip` / `StatusChip`, `ToolbarStats`, `Tabs`, `Empty`, `Spinner`, `Progress`, `Kbd`, `Avatar`, `FileViewer` / `FileThumb`, cards, chart, lane strip, `Term` (glossary hover) |
| `data` | `DenseTable`, `MiniTable`, `Pagination`, `Toolbar`, `Sidebar` / `FilterGroup`, column picker, list state in the URL (`useListState`), page order |
| `layout` | `SlideOver` panels, `AppShell` (top bar, module tabs, side rail), `useRailLayout`, appearance (theme, density, panel width, detail view) |

## Theming

All colours and sizes are CSS variables in `styles.css` (`--c-accent`, `--c-surface`, `--c-text`, `--c-ok`, …,
`--ui-scale`, `--table-row-h`). Override them on `:root` (light) and `:root.dark` (dark):

```css
:root { --c-accent: #0f766e; }
:root.dark { --c-accent: #2dd4bf; }
```

`AppearanceProvider` (and the appearance popover in `AppShell`) switch theme and density for the reader and remember
the choice.

## The app frame with your router

`AppShell`, the rail and the ⌘K palette never import a router. Without a provider they use the browser's history. With
TanStack Router:

```tsx
const navigate = useNavigate();
const pathname = useLocation({ select: (l) => l.pathname });
const router = useMemo(
  () => ({ pathname, navigate: (to: string) => navigate({ href: to }), Link: ({ to, ...p }) => <Link to={to} {...p} /> }),
  [pathname, navigate],
);

<RouterProvider value={router}>
  <AppearanceProvider>
    <AppShell rail={rail} utility={utility} tabs={tabs} contexts={[]} activeContext="" onContext={() => {}}
      title="Orders" user={{ initials: "SK", name: "Satyam" }} search={<PaletteButton />}>
      <Outlet />
    </AppShell>
    <CommandPalette pages={pages} />
  </AppearanceProvider>
</RouterProvider>
```

## Saved choices

The reader's theme, density, panel width, column picks and widths, page order and recent ⌘K items are kept in
localStorage under `mds-ui.*`. An app with saved choices under another prefix sets it once, before the first render:
`configureStorage({ prefix: "my-app.ui" })`.

## Rules for pages built with the kit

[AGENTS.md](AGENTS.md) lists the UI rules the kit is built around (toolbar order, search keys, loading overlay, row
heights, one component per job, plain words). It is written so coding agents follow it too.

## Develop

```bash
bun install
bun run typecheck
bun test          # unit tests in src/ (date() checked against dayjs on ~56,000 calls)
bun run build     # dist/: ESM .js + .d.ts per module, CSS beside them, dist/styles.css joined in cascade order
bun run size      # gzip size; budget: core JS ≤ 80 KB (0.3.0: 76.9 KB, + 10.5 KB for the app frame)
bun run bench     # pack the package, build bench/ with it, and run the browser tests (Chromium)
```

`src/` is organised in layers that only import downward: `core` ← `overlay` ← `inputs` / `display` ← `data` ←
`layout`. One component per file, its stylesheet beside it; `src/styles/order.json` gives the order of the joined
stylesheet. `bench/` is a small app that installs the packed tarball and drives every component in a real browser.

## Licence

[MIT](LICENSE) © MagadhTech
