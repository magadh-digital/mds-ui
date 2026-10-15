// After tsc: join the kit's stylesheets into dist/styles.css in the order src/styles/order.json gives (the cascade
// order), inside the `mds` cascade layer so any app CSS outside a layer wins; dist/reset.css is the opt-in page reset
// in the lower `mds-reset` layer.
import { readFileSync, writeFileSync } from "node:fs";
const order: Array<string> = JSON.parse(readFileSync("src/styles/order.json", "utf8"));
const body = order.map((p) => `/* ${p} */\n${readFileSync(`src/${p}`, "utf8")}`).join("\n");
writeFileSync("dist/styles.css", `@layer mds-reset, mds;\n@layer mds {\n${body}\n}\n`);
writeFileSync("dist/reset.css", `@layer mds-reset, mds;\n@layer mds-reset {\n${readFileSync("src/styles/reset.css", "utf8")}\n}\n`);
console.log(`styles.css: ${order.length} sections (layer mds) · reset.css (layer mds-reset)`);
