// Screenshots the old (react-datepicker) and the new (kit) calendar in the same state, side by side in shots/.
import puppeteer from "puppeteer-core";
const CHROME = process.env.CHROME_PATH ?? `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1169/chrome-mac/Chromium.app/Contents/MacOS/Chromium`;
const server = Bun.spawn(["bunx", "vite", "preview", "--port", "5190", "--strictPort"], { cwd: import.meta.dir, stdout: "ignore", stderr: "ignore" });
await new Promise((r) => setTimeout(r, 1500));
const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
for (const which of ["old", "new"]) {
  const p = await b.newPage();
  await p.setViewport({ width: 420, height: 520, deviceScaleFactor: 2 });
  await p.goto(`http://localhost:5190/compare.html#${which}`, { waitUntil: "networkidle0" });
  await p.click("button.daterange");
  await new Promise((r) => setTimeout(r, 300));
  const d = await p.$(".mds-daterange-day[data-day='2026-10-15'], .react-datepicker__day--015:not(.react-datepicker__day--outside-month)");
  if (d) await d.hover();
  await new Promise((r) => setTimeout(r, 200));
  await p.screenshot({ path: `shots/cal-${which}.png` });
  await p.close();
}
await b.close();
server.kill();
