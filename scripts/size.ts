// What an app actually ships: the kit bundled and minified the way an app's build does it (React and the kit's
// dependencies left out), then gzipped. `--check` fails above the budget.
import { mkdtempSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const BUDGET_KB = 60;
const EXTERNAL = ["react", "react-dom", "react/*", "react-dom/*", "@floating-ui/react", "@tanstack/react-table", "lucide-react"];
const dir = mkdtempSync(join(tmpdir(), "mds-ui-size-"));
const dist = resolve("dist");
const FRAME = ["layout/shell.js", "layout/raillayout.js", "overlay/palette.js", "core/router.js", "core/service_pages.js"];

async function gz(name: string, source: string) {
  const entry = join(dir, `${name}.js`);
  writeFileSync(entry, source);
  const out = await Bun.build({ entrypoints: [entry], minify: true, external: EXTERNAL, outdir: join(dir, `out-${name}`) });
  if (!out.success) throw new Error(out.logs.join("\n"));
  const file = join(dir, `out-${name}`, readdirSync(join(dir, `out-${name}`))[0]!);
  return gzipSync(readFileSync(file)).length / 1024;
}

const all = await gz("all", `export * from "${dist}/index.js";`);
const index = readFileSync("dist/index.js", "utf8");
const noFrame = index
  .split("\n")
  .filter((l) => !FRAME.some((f) => l.includes(`./${f}`)))
  .join("\n")
  .replaceAll('from "./', `from "${dist}/`);
const core = await gz("core", noFrame);
const css = gzipSync(readFileSync("dist/styles.css")).length / 1024;
console.log(
  `whole kit ${all.toFixed(1)} KB · without the app frame ${core.toFixed(1)} KB · styles.css ${css.toFixed(1)} KB (bundled, minified, gzip; budget ${BUDGET_KB} KB)`,
);
if (process.argv.includes("--check") && all > BUDGET_KB) {
  console.error(`over budget: ${all.toFixed(1)} KB > ${BUDGET_KB} KB`);
  process.exit(1);
}
