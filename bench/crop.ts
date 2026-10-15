// Side-by-side crops of the same region from two screenshots: bun crop.ts a.png b.png x y w h out.png
import puppeteer from "puppeteer-core";
import { readFileSync } from "node:fs";
const [a, b, x, y, w, h, out] = process.argv.slice(2);
const CHROME = process.env.CHROME_PATH ?? `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1169/chrome-mac/Chromium.app/Contents/MacOS/Chromium`;
const br = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
const p = await br.newPage();
await p.setViewport({ width: +w! * 2 + 30, height: +h! + 40 });
const img = (f: string) => `<div style="width:${w}px;height:${h}px;overflow:hidden;position:relative;outline:1px solid red"><img src="data:image/png;base64,${readFileSync(f).toString("base64")}" style="position:absolute;left:-${x}px;top:-${y}px"></div>`;
await p.setContent(`<div style="display:flex;gap:10px;padding:10px;font:12px sans-serif">${img(a!)}${img(b!)}</div>`);
await new Promise((r) => setTimeout(r, 300));
await p.screenshot({ path: out! });
await br.close();
