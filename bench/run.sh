#!/bin/sh
# Build and pack the package, install the tarball into bench/ (exactly what npm would deliver), build the bench pages
# and run the browser tests. CHROME_PATH points at Chromium (CI sets it); locally the Playwright download is used.
set -e
cd "$(dirname "$0")/.."
bun run build >/dev/null
rm -f mds-ui-*.tgz && bun pm pack >/dev/null
mkdir -p bench/vendor && cp mds-ui-*.tgz bench/vendor/mds-ui.tgz && rm -f mds-ui-*.tgz
cd bench
# bun caches a local tarball by path: drop the old copy so the fresh build is installed
rm -rf node_modules/@mds "$HOME/.bun/install/cache/@mds"
bun install >/dev/null
bun run build >/dev/null
mkdir -p shots
bun run test
