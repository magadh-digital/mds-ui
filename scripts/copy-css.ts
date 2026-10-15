// tsc emits the .js and .d.ts; the stylesheets the components import ("./fileviewer.css") go next to them
import { readdirSync, copyFileSync } from "node:fs";
for (const f of readdirSync("src")) if (f.endsWith(".css")) copyFileSync(`src/${f}`, `dist/${f}`);
