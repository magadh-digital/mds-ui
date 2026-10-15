# @magadhtech/ui

A compact React UI kit for data-heavy consoles: list pages with a toolbar and filters, a dense table with column
settings and row menus, side panels, toggle groups, a searchable picker, a date-range picker, a file viewer, chips,
toasts and number and date formats. It is styled with plain CSS variables, so a theme is a set of token values and dark
mode comes free.

> Status: 0.1, private. It was carved out of procurement-console's `src/console` on 15 Oct 2026, with no app code,
> then made Chakra-, react-datepicker- and dayjs-free (0.2: organised into folders).
> It isn't published yet (see "Before publishing").

## Use

```tsx
import "@magadhtech/ui/styles.css";
import { Toolbar, DenseTable, ToggleGroup, ToneChip, dayTime } from "@magadhtech/ui";
// or one module alone, so an app that shows no table never loads TanStack Table:
import { DenseTable } from "@magadhtech/ui/table";
```

Every module has a short path (`@magadhtech/ui/daterange`, `/autocomplete`, `/pop`, `/toolbar`, `/date`, …) and a folder
path (`@magadhtech/ui/inputs/daterange`). The 0.1 names `primitives`, `forms` and `listpage` still work: they re-export
the modules they were split into.

## Layout

```
src/
  core/      date, format, hooks, validate, types      no UI; imports nothing from the kit
  overlay/   floating (shared layer logic), tip, pop, confirm, menu, dialog, toast
  inputs/    autocomplete, daterange, toggle, seg, switch, fileinput, form, actions
  display/   chip, empty, cards, chart, flowstrip, fileviewer, term, dot, buttons, skeleton
  data/      table, minitable, columns, toolbar, listpage, sidebar, pages, dragsort
  layout/    panel, appearance, placeholder
  styles/    tokens.css (variables), controls, misc, motion; order.json
  app/       styles of the console's own pages, kept until they move back to the console
  compat/    the 0.1 module names
```

- **Imports go one way**, down this list: `core` ← `overlay` ← `inputs`/`display` ← `data` ← `layout`. Nothing imports
  upward, and there are no circular imports.
- **One component (or a few tiny siblings) per file**, with its stylesheet next to it (`inputs/daterange.tsx` and
  `inputs/daterange.css`).
- **`dist/styles.css`** joins the stylesheets in the order `src/styles/order.json` lists, which is the cascade order the
  console was built with.
- **Tests sit next to their code** (`core/date.test.ts`).

- **Peers:** `react` 19, `react-dom`, `lucide-react`, and `@tanstack/react-table` (only for `table`, `listpage`, `forms`).
- **One dependency:** `@floating-ui/react`, for the positioning, outside clicks and focus of the popovers, the tooltip,
  the Autocomplete list and the calendar. There is no Chakra, no react-datepicker and no dayjs: the calendar, the
  Autocomplete and the date type are the kit's own.
- **Dates:** `date()` covers the dayjs calls the consoles make (`format`, `add`/`subtract`, `startOf`/`endOf`, `diff`,
  `isBefore`/`isSame`, getters). A date-only string is a local day, as in dayjs. `tests/date.test.ts` checks it against
  dayjs on about 56,000 calls.
- **Glossary (optional):** `<TermsProvider glossary={{ lookup, label }}>` makes every `Term` header show its meaning on
  hover. Without a glossary, labels render as plain text.

## Develop

```bash
bun install
bun run typecheck
bun run build     # dist/: ESM .js + .d.ts per module, CSS copied beside them
bun run size      # gzip size per file, and how much of styles.css is the kit's own
bun test          # date() against dayjs
bun scripts/smoke.tsx   # loads the built package and renders a few components
```

To try changes in an app before publishing, run `bun link` here and `bun link @magadhtech/ui` in the app.
The browser tests live in the sibling repo `mds-ui-test`: it installs this package from its packed tarball, builds a page
with every component, and drives it in Chromium (`bun run pack-kit && bun run build && bun test`).

## Before publishing

1. Move `src/app/` (the console's page styles, about 7 KB gzipped) back into procurement-console.
2. Bring over the shell and the command palette with a router adapter (they import TanStack Router today, so they
   stayed in the app).
3. Make locale and currency options of `format.ts`, keeping `en-IN` and ₹ as the default.
4. Choose a licence, set `"private": false`, publish from CI with npm provenance.

The UI rules every page follows are in [AGENTS.md](AGENTS.md).
