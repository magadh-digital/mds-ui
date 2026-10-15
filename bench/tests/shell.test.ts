// The app frame from the package with no router library: rail, tabs and ⌘K through the kit's default router.
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import puppeteer, { type Browser, type Page } from "puppeteer-core";

const CHROME = process.env.CHROME_PATH ?? `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1169/chrome-mac/Chromium.app/Contents/MacOS/Chromium`;
let server: ReturnType<typeof Bun.spawn>;
let browser: Browser;
let page: Page;
const errors: Array<string> = [];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const path = () => page.$eval('[data-testid="path"]', (e) => e.textContent);

beforeAll(async () => {
  server = Bun.spawn(["bunx", "vite", "preview", "--port", "5191", "--strictPort"], { cwd: `${import.meta.dir}/..`, stdout: "ignore", stderr: "ignore" });
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch("http://localhost:5191/shell.html")).ok) break; } catch {}
    await sleep(200);
  }
  browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
  page = await browser.newPage();
  await page.emulateTimezone("Asia/Kolkata"); // the expected times are IST, wherever the tests run
  await page.setViewport({ width: 1280, height: 800 });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));
  await page.goto("http://localhost:5191/shell.html", { waitUntil: "networkidle0" });
});
afterAll(async () => {
  await browser?.close();
  server?.kill();
});

describe("AppShell + rail + ⌘K, no router library", () => {
  test("renders the rail and the tabs with no errors", async () => {
    const labels = await page.$$eval("a[href]", (els) => els.map((e) => e.getAttribute("href")));
    for (const to of ["/orders", "/partners", "/reports", "/settings"]) expect(labels).toContain(to);
    expect(errors).toEqual([]);
  });
  test("a rail click navigates (history) and lights that entry", async () => {
    await page.click('a[href="/partners"]');
    expect(await path()).toBe("/partners");
    expect(await page.evaluate(() => location.pathname)).toBe("/partners");
    const lit = await page.$$eval('a[href="/partners"]', (els) => els.some((e) => e.getAttribute("aria-current") === "page" || e.classList.contains("active")));
    expect(lit).toBe(true);
  });
  test("Back goes to the previous page", async () => {
    await page.click('a[href="/orders"]');
    expect(await path()).toBe("/orders");
    await page.goBack();
    expect(await path()).toBe("/partners");
  });
  test("⌘K opens the palette; typing and Enter go to a page; Esc closes", async () => {
    await page.keyboard.down("Meta");
    await page.keyboard.press("k");
    await page.keyboard.up("Meta");
    await page.waitForSelector(".mds-cmdk", { timeout: 2000 });
    await page.keyboard.type("repo");
    await sleep(100);
    await page.keyboard.press("Enter");
    await sleep(150);
    expect(await path()).toBe("/reports");
    expect(await page.$(".mds-cmdk")).toBe(null);
    await page.keyboard.down("Meta");
    await page.keyboard.press("k");
    await page.keyboard.up("Meta");
    await page.waitForSelector(".mds-cmdk");
    await page.keyboard.press("Escape");
    await sleep(150);
    expect(await page.$(".mds-cmdk")).toBe(null);
  });
  test("no errors after all of it", async () => {
    await page.screenshot({ path: `${import.meta.dir}/../shots/shell.png` });
    expect(errors).toEqual([]);
  });
});
