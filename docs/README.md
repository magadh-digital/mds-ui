# docs

The `@mds/ui` documentation site, built with the kit itself: one page per component with live demos (the code shown
is the code that runs) and props tables generated from the TypeScript types (`scripts/props.ts`).

```bash
cd docs && bun install
bun run dev      # local site (reads the package built in ../dist; run `bun run build` in the repo root first)
bun run build    # builds the package, the props tables and the site into docs/dist
```

## Cloudflare Pages

Connect the repository in the Cloudflare dashboard (Workers & Pages → Create → Pages → Connect to Git) with:

| Setting | Value |
| --- | --- |
| Root directory | `docs` |
| Build command | `npm i -g bun && bun install && bun run build` |
| Build output directory | `dist` |
| Environment variable | `BUN_VERSION` = `1.3.2` (optional) |

`public/_redirects` sends every path to `index.html`, so links like `/components/autocomplete` work on reload.
Pull requests get preview URLs automatically; pushes to `main` update production.
