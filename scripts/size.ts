// gzip size of the built kit (React and the peers are not included). `--check` fails above the budget: 80 KB for the
// core, i.e. everything but the optional app frame (shell, rail, palette, router), which only apps that use it load.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
const BUDGET_KB = 80;
const FRAME = new Set(["layout/shell.js", "layout/raillayout.js", "overlay/palette.js", "core/router.js", "core/service_pages.js"]);
const walk = (d: string): Array<string> =>
  readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
let core = 0;
let frame = 0;
const rows: Array<[string, number]> = [];
for (const f of walk("dist")) {
  if (!f.endsWith(".js")) continue;
  const rel = f.slice(5);
  const n = gzipSync(readFileSync(f)).length;
  rows.push([rel, n]);
  if (FRAME.has(rel)) frame += n;
  else core += n;
}
const css = gzipSync(readFileSync("dist/styles.css")).length;
rows.sort((a, b) => b[1] - a[1]);
for (const [f, n] of rows.slice(0, 10)) console.log(`${(n / 1024).toFixed(1).padStart(6)} KB  ${f}`);
const kb = (n: number) => (n / 1024).toFixed(1);
console.log(`\ncore JS ${kb(core)} KB gzip (budget ${BUDGET_KB}) · app frame ${kb(frame)} KB · styles.css ${kb(css)} KB (each file gzipped alone)`);
if (process.argv.includes("--check") && core / 1024 > BUDGET_KB) {
  console.error(`over budget: core JS ${kb(core)} KB > ${BUDGET_KB} KB`);
  process.exit(1);
}
