# bench

The browser test bench for `@mds/ui`. `bun run bench` (from the repo root) builds and packs the package, installs the
tarball here exactly as npm would deliver it, builds these pages and drives them in Chromium:

- `index.html`: every component (44 tests in `tests/ui.test.ts`).
- `shell.html`: the app frame with no router library (5 tests in `tests/shell.test.ts`).
- `compare.html#old` / `#new`: the kit's calendar beside react-datepicker, which it replaced (`bun run compare`
  writes both screenshots to `shots/`).

Set `CHROME_PATH` to a Chromium / Chrome binary; locally the Playwright download in `~/Library/Caches/ms-playwright`
is used.

## Visual check for CSS changes

```bash
bun snap.ts /tmp/before          # screenshots of the bench pages in fixed states, light and dark
# … change the CSS, then bun run bench (or rebuild + reinstall) …
bun snap.ts /tmp/after
bun pixdiff.ts /tmp/before /tmp/after          # changed pixels and their box, per screenshot
bun crop.ts before.png after.png x y w h out.png   # the same region side by side
```

The spinning loader changes about 120 pixels between any two runs; everything else should be 0.
