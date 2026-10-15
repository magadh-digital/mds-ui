// gzip size of the built kit, so every change sees what it costs (React and the peers are not included)
import { readdirSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
let js = 0, css = 0;
const rows: Array<[string, number]> = [];
for (const f of readdirSync("dist")) {
  if (!f.endsWith(".js") && !f.endsWith(".css")) continue;
  const n = gzipSync(readFileSync(`dist/${f}`)).length;
  rows.push([f, n]);
  if (f.endsWith(".js")) js += n; else css += n;
}
rows.sort((a, b) => b[1] - a[1]);
for (const [f, n] of rows) console.log(`${(n / 1024).toFixed(1).padStart(6)} KB  ${f}`);
console.log(`\nJS ${(js / 1024).toFixed(1)} KB gzip · CSS ${(css / 1024).toFixed(1)} KB gzip (each file gzipped alone)`);
