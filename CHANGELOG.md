# Changelog

All notable changes to `@mds/ui`. Versions below 1.0 may change the API in a minor release.

## 0.3.0 — first public release

- **Controls:** `Button` (outline / primary / danger, small, loading), `IconButton`, `LinkButton`, `Input`, `Select`,
  `Textarea`, `Checkbox`.
- **Dates:** `DateRange` (day or range, shortcuts, keyboard) and `DateInput` (one day, min/max) on the kit's own
  calendar; `date()` for dayjs-style formatting and maths with no dependency.
- **Pickers:** `Autocomplete` (single, multiple with chips, groups, server search), `ToggleGroup` (one or several),
  `Seg`, `Switch`, `FileInput`.
- **Overlays:** `Tip`, `Pop`, `EditPop`, `HoverPop`, `ConfirmPop`, `ConfirmDialog` + `useConfirm()`, `Dialog`,
  row menu and `MoreMenu`, `toast`, the ⌘K `CommandPalette`; all on Floating UI, fading in and out.
- **Data:** `DenseTable` (sorting, paging, column picker in the footer, selection, row menu, 1–3 line rows),
  `MiniTable`, `Pagination`, `Toolbar` (search, filters, refresh, `/` and `R` keys), `Sidebar` / `FilterGroup`,
  list state kept in the URL.
- **Display:** `ToneChip` / `StatusChip`, `ToolbarStats`, `Tabs`, `Empty`, `Spinner`, `Progress`, `Kbd`, `Avatar`,
  `FileViewer` (zoom, rotate, PDFs, arrow keys), cards, chart, lane strip, glossary hovers.
- **Layout:** `SlideOver` panels, `AppShell` with a side rail, appearance settings (theme, density, panel width,
  detail view).
- **Router-free:** the shell and palette use a small adapter (`RouterProvider`); the browser's history by default.
- **Storage:** saved choices live under a configurable prefix (`configureStorage`), `mds-ui` by default.
- Three runtime dependencies (`@floating-ui/react`, `lucide-react`, `@tanstack/react-table`); React is the only peer.
