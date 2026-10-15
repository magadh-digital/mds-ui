// After tsc: copy every stylesheet next to its module (components that import their own CSS keep working), and join
// the style sections into dist/styles.css in the order src/styles/order.json gives (the original cascade order).
import { cpSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
const walk = (d: string): Array<string> =>
  readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
for (const f of walk("src")) {
  if (!f.endsWith(".css")) continue;
  const to = f.replace(/^src/, "dist");
  mkdirSync(dirname(to), { recursive: true });
  cpSync(f, to);
}
const order: Array<string> = JSON.parse(readFileSync("src/styles/order.json", "utf8"));
const css = order.map((p) => `/* ${p} */\n${readFileSync(`src/${p}`, "utf8")}`).join("\n");
writeFileSync("dist/styles.css", css);
console.log(`styles.css: ${order.length} sections`);
