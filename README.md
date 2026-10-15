# @magadhtech/ui

A compact React UI kit for data-heavy consoles: list pages with a toolbar and filters, a dense table with column
settings and row menus, side panels, toggle groups, a searchable picker, a date-range picker, a file viewer, chips,
toasts and number and date formats. It is styled with plain CSS variables, so a theme is a set of token values and dark
mode comes free.

> Status: 0.1, private. It was carved out of procurement-console's `src/console` on 15 Oct 2026, with no app code.
> It isn't published yet (see "Before publishing").

## Use

```tsx
import "@magadhtech/ui/tokens.css";
import { Toolbar, DenseTable, ToggleGroup, ToneChip, dayTime } from "@magadhtech/ui";
// or one module alone, so an app that shows no table never loads TanStack Table:
import { DenseTable } from "@magadhtech/ui/table";
```

- **Peers:** `react` 19, `react-dom`, `lucide-react`, and `@tanstack/react-table` (only for `table`, `listpage`, `forms`).
- **Dependencies:** `react-datepicker` and `dayjs` (the date-range picker and the date formats).
- **Glossary (optional):** `<TermsProvider glossary={{ lookup, label }}>` makes every `Term` header show its meaning on
  hover. Without a glossary, labels render as plain text.
- **For now, Chakra:** `Tip`, `Pop`, `EditPop`, `HoverPop` and `Autocomplete` still use `@chakra-ui/react`, so the app
  needs a `ChakraProvider`. The plan is to move them to Floating UI, which react-datepicker already brings along, and
  drop the peer.

## Develop

```bash
bun install
bun run typecheck
bun run build     # dist/: ESM .js + .d.ts per module, CSS copied beside them
bun run size      # gzip size per file
bun scripts/smoke.tsx   # loads the built package and renders a few components
```

To try changes in an app before publishing, run `bun link` here and `bun link @magadhtech/ui` in the app.

## Before publishing

1. Drop Chakra (see above).
2. Move the console-only styles out of `tokens.css`; today it still carries page styles from procurement-console.
3. Bring over the shell and the command palette with a router adapter (they import TanStack Router today, so they
   stayed in the app).
4. Make locale and currency options of `format.ts`, keeping `en-IN` and ₹ as the default.
5. Choose a licence, set `"private": false`, publish from CI with npm provenance.

The UI rules every page follows are in [AGENTS.md](AGENTS.md).
