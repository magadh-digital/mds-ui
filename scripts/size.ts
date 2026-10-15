// gzip size of the built kit, so every change sees what it costs (React and the peers are not included)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
const walk = (d: string): Array<string> =>
  readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
let js = 0;
const rows: Array<[string, number]> = [];
for (const f of walk("dist")) {
  if (!f.endsWith(".js")) continue;
  const n = gzipSync(readFileSync(f)).length;
  rows.push([f.slice(5), n]);
  js += n;
}
const styles = gzipSync(readFileSync("dist/styles.css")).length;
const kit = gzipSync(
  JSON.parse(readFileSync("src/styles/order.json", "utf8"))
    .filter((p: string) => !p.startsWith("app/"))
    .map((p: string) => readFileSync(`src/${p}`, "utf8"))
    .join("\n"),
).length;
rows.sort((a, b) => b[1] - a[1]);
for (const [f, n] of rows.slice(0, 12)) console.log(`${(n / 1024).toFixed(1).padStart(6)} KB  ${f}`);
console.log(`\nJS ${(js / 1024).toFixed(1)} KB gzip (each file alone) · styles.css ${(styles / 1024).toFixed(1)} KB gzip, of which the kit's own ${(kit / 1024).toFixed(1)} KB (the rest is app/: console page styles)`);
