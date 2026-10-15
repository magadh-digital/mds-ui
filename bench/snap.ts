// Screenshots of the bench pages in fixed states, for a pixel comparison before / after a CSS change.
// bun snap.ts <outDir>
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
const out = process.argv[2]!;
mkdirSync(out, { recursive: true });
const CHROME = process.env.CHROME_PATH ?? `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1169/chrome-mac/Chromium.app/Contents/MacOS/Chromium`;
const server = Bun.spawn(["bunx", "vite", "preview", "--port", "5192", "--strictPort"], { cwd: import.meta.dir, stdout: "ignore", stderr: "ignore" });
await new Promise((r) => setTimeout(r, 1500));
const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--force-prefers-reduced-motion"] });
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
for (const theme of ["light", "dark"] as const) {
  const p = await b.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.emulateMediaFeatures([{ name: "prefers-color-scheme", value: theme }, { name: "prefers-reduced-motion", value: "reduce" }]);
  await p.goto("http://localhost:5192/", { waitUntil: "networkidle0" });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: `${out}/${theme}-page.png`, fullPage: true });
  await p.click('[data-testid="daterange"] button');
  await wait(250);
  await p.screenshot({ path: `${out}/${theme}-calendar.png` });
  await p.keyboard.press("Escape");
  await wait(250);
  await p.click('input[aria-label="Grouped"]');
  await wait(250);
  await p.screenshot({ path: `${out}/${theme}-autocomplete.png` });
  await p.keyboard.press("Escape");
  await wait(250);
  await p.click('[data-testid="editpop-trigger"]');
  await wait(250);
  await p.screenshot({ path: `${out}/${theme}-editpop.png` });
  await p.keyboard.press("Escape");
  await wait(250);
  await p.click('[data-testid="ask"]');
  await wait(250);
  await p.screenshot({ path: `${out}/${theme}-confirm.png` });
  await p.close();
  const s = await b.newPage();
  await s.setViewport({ width: 1280, height: 800 });
  await s.emulateMediaFeatures([{ name: "prefers-color-scheme", value: theme }]);
  await s.goto("http://localhost:5192/shell.html", { waitUntil: "networkidle0" });
  await s.screenshot({ path: `${out}/${theme}-shell.png` });
  await s.close();
}
await b.close();
server.kill();
console.log("snapshots in", out);
