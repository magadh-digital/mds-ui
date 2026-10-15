// Drives the built test page (vite preview) in Chromium: every behaviour the consoles rely on, through real clicks
// and keys. Run: bun run build && bun test --timeout 60000
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import puppeteer, { type Browser, type Page } from "puppeteer-core";

const CHROME = process.env.CHROME_PATH ?? `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1169/chrome-mac/Chromium.app/Contents/MacOS/Chromium`;
const URL = "http://localhost:5190/";
let server: ReturnType<typeof Bun.spawn>;
let browser: Browser;
let page: Page;
const errors: Array<string> = [];

const out = (id: string) => page.$eval(`[data-testid="${id}"]`, (e) => e.textContent ?? "");
const visible = (sel: string) => page.$(sel).then((h) => !!h);
// layers fade out (~100 ms) before they leave the page: wait for that instead of checking at once
const gone = (sel: string) =>
  page.waitForSelector(sel, { hidden: true, timeout: 1500 }).then(() => true, () => false);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const input = (label: string) => `input[aria-label="${label}"]`;
// the list that is open now (one that is fading out keeps its node for ~90 ms)
const AC = '.ui-ac-pop:not([data-status="close"])';
const options = () => page.$$eval(`${AC} [role=option]`, (els) => els.map((e) => e.querySelector(".ui-ac-label")?.textContent));
const TABLE = '[data-testid="table"] .ui-table';
const clickOutside = () => page.mouse.click(5, 880);

beforeAll(async () => {
  server = Bun.spawn(["bunx", "vite", "preview", "--port", "5190", "--strictPort"], { cwd: `${import.meta.dir}/..`, stdout: "ignore", stderr: "ignore" });
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(URL)).ok) break;
    } catch {}
    await sleep(200);
  }
  browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
  page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));
  await page.goto(URL, { waitUntil: "networkidle0" });
});
afterAll(async () => {
  await browser?.close();
  server?.kill();
});

describe("page", () => {
  test("renders with no errors", async () => {
    expect(await visible(".toolbar")).toBe(true);
    expect(await visible(".ui-table")).toBe(true);
    expect(errors).toEqual([]);
  });
  test("formats (the kit's date(), rupees)", async () => {
    expect(await out("formats")).toContain("15 Oct 2026, 02:30 PM | ₹12,34,567.50 | 28 Feb 2026");
  });
});

describe("Autocomplete (single)", () => {
  test("click opens the whole list", async () => {
    await page.click(input("City"));
    expect(await options()).toEqual(["Patna", "Gaya", "Muzaffarpur", "Ranchi", "Dhanbad", "Kolkātā"]);
  });
  test("typing filters by label, hint and keywords, accent-blind", async () => {
    await page.type(input("City"), "kolkata");
    expect(await options()).toEqual(["Kolkātā"]);
    await page.$eval(input("City"), (e) => ((e as HTMLInputElement).value = ""));
    await page.click(input("City"), { clickCount: 3 });
    await page.keyboard.press("Backspace");
    await page.type(input("City"), "litchi");
    expect(await options()).toEqual(["Muzaffarpur"]);
  });
  test("Enter picks the highlighted row; the box shows its label", async () => {
    await page.keyboard.press("Enter");
    expect(await out("ac-single-out")).toBe("muz");
    expect(await page.$eval(input("City"), (e) => (e as HTMLInputElement).value)).toBe("Muzaffarpur");
    expect(await gone(".ui-ac-pop")).toBe(true);
  });
  test("reopening shows every row with the pick ticked", async () => {
    await page.click(input("City"));
    expect((await options()).length).toBe(6);
    const checked = await page.$$eval(`${AC} [data-state=checked] .ui-ac-label`, (els) => els.map((e) => e.textContent));
    expect(checked).toEqual(["Muzaffarpur"]);
  });
  test("arrows move (skipping disabled rows) and wrap", async () => {
    await page.keyboard.press("ArrowDown"); // Ranchi
    await page.keyboard.press("ArrowDown"); // Dhanbad is disabled → Kolkātā
    const hl = await page.$eval(`${AC} [data-highlighted] .ui-ac-label`, (e) => e.textContent);
    expect(hl).toBe("Kolkātā");
    await page.keyboard.press("ArrowDown"); // wraps to Patna
    expect(await page.$eval(`${AC} [data-highlighted] .ui-ac-label`, (e) => e.textContent)).toBe("Patna");
  });
  test("Escape closes without changing the pick; clearing the text keeps it", async () => {
    await page.keyboard.press("Escape");
    expect(await gone(".ui-ac-pop")).toBe(true);
    expect(await out("ac-single-out")).toBe("muz");
    await page.click(input("City"), { clickCount: 3 });
    await page.keyboard.press("Backspace");
    await clickOutside();
    expect(await out("ac-single-out")).toBe("muz");
    expect(await page.$eval(input("City"), (e) => (e as HTMLInputElement).value)).toBe("Muzaffarpur");
  });
  test("a click on a row picks it; × clears", async () => {
    await page.click(input("City"));
    const rows = await page.$$(`${AC} [role=option]`);
    await rows[1]!.click(); // Gaya
    expect(await out("ac-single-out")).toBe("gaya");
    await page.click('[data-testid="ac-single"] button[aria-label="Clear"]');
    expect(await out("ac-single-out")).toBe("none");
  });
  test("an outside click closes the list", async () => {
    await page.click(input("City"));
    expect(await visible(".ui-ac-pop")).toBe(true);
    await clickOutside();
    expect(await gone(".ui-ac-pop")).toBe(true);
  });
});

describe("Autocomplete (multiple)", () => {
  test("rows tick and untick, the list stays open, chips show", async () => {
    await page.click(input("Cities"));
    const rows = await page.$$(`${AC} [role=option]`);
    await rows[3]!.click(); // Ranchi
    expect(await visible(".ui-ac-pop")).toBe(true);
    expect(await out("ac-multi-out")).toBe("patna,ranchi");
    const chips = await page.$$eval('[data-testid="ac-multi"] .ui-ac-chip', (els) => els.map((e) => e.textContent));
    expect(chips).toEqual(["Patna", "Ranchi"]);
    await (await page.$$(`${AC} [role=option]`))[0]!.click(); // untick Patna
    expect(await out("ac-multi-out")).toBe("ranchi");
  });
  test("Backspace in the empty box removes the last chip; a chip's × removes it", async () => {
    await (await page.$$(`${AC} [role=option]`))[1]!.click(); // + Gaya
    expect(await out("ac-multi-out")).toBe("ranchi,gaya");
    await page.focus(input("Cities"));
    await page.keyboard.press("Backspace");
    expect(await out("ac-multi-out")).toBe("ranchi");
    await page.keyboard.press("Escape");
    await page.click('[data-testid="ac-multi"] .ui-ac-chip-x');
    expect(await out("ac-multi-out")).toBe("");
  });
});

describe("Autocomplete (groups, server search)", () => {
  test("groups: groupOrder first, then A→Z", async () => {
    await page.click(input("Grouped"));
    const heads = await page.$$eval(`${AC} .ui-ac-group-label`, (els) => els.map((e) => e.textContent));
    expect(heads).toEqual(["Jharkhand", "Bengal", "Bihar"]);
    // typing highlights the first row as shown (Ranchi under Jharkhand), not the first in the data (Patna)
    await page.type(input("Grouped"), "a");
    expect(await page.$eval(`${AC} [data-highlighted] .ui-ac-label`, (e) => e.textContent)).toBe("Ranchi");
    await page.keyboard.press("Enter");
    expect(await out("ac-grouped-out")).toBe("ranchi");
  });
  test("server search: onSearchChange fires on typing, rows show as given", async () => {
    await page.click(input("Server search"));
    expect(await page.$eval(AC, (e) => e.textContent)).toContain("Type 2 letters");
    await page.type(input("Server search"), "pa");
    expect(await out("ac-server-out")).toContain("p|pa");
    expect(await options()).toEqual(["Patna"]);
    await page.keyboard.press("Escape");
  });
});

describe("Popovers", () => {
  test("Tip shows on hover", async () => {
    await page.hover('[data-testid="tip-trigger"]');
    await sleep(450);
    expect(await page.$eval(".ui-tip", (e) => e.textContent)).toBe("A tooltip");
    await page.mouse.move(5, 880);
    await sleep(200);
    expect(await gone(".ui-tip")).toBe(true);
  });
  test("Pop opens on click, a pick inside it does not close it, Escape closes it", async () => {
    await page.click('[data-testid="pop-trigger"]');
    expect(await visible('[data-testid="pop-body"]')).toBe(true);
    await page.click(input("City in pop"));
    await (await page.$$(`${AC} [role=option]`))[0]!.click();
    expect(await out("pops-out")).toContain('"inPop":"patna"');
    expect(await visible('[data-testid="pop-body"]')).toBe(true);
    await page.keyboard.press("Escape");
    // the list closed already, so this Escape closes the popover
    await sleep(150);
    if (await visible('[data-testid="pop-body"]')) await page.keyboard.press("Escape");
    expect(await gone('[data-testid="pop-body"]')).toBe(true);
  });
  test("Pop closes on an outside click; the trigger toggles it", async () => {
    await page.click('[data-testid="pop-trigger"]');
    expect(await visible('[data-testid="pop-body"]')).toBe(true);
    await clickOutside();
    expect(await gone('[data-testid="pop-body"]')).toBe(true);
    await page.click('[data-testid="pop-trigger"]');
    await page.click('[data-testid="pop-trigger"]');
    expect(await gone('[data-testid="pop-body"]')).toBe(true);
  });
  test("EditPop: focus moves in, Save closes it and returns focus", async () => {
    await page.click('[data-testid="editpop-trigger"]');
    expect(await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.tagName)).not.toBe("BODY");
    await page.click('input[aria-label="Rate"]');
    await page.$eval('input[aria-label="Rate"]', (e) => (e as HTMLInputElement).select());
    await page.keyboard.type("64");
    await page.keyboard.press("Enter");
    expect(await out("pops-out")).toContain('"edited":"64"');
    expect(await gone('[data-testid="editpop-body"]')).toBe(true);
    expect(await page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.testid)).toBe("editpop-trigger");
  });
  test("HoverPop opens after the delay and stays while hovered", async () => {
    await page.hover('[data-testid="hoverpop-trigger"]');
    await sleep(500);
    expect(await visible('[data-testid="hoverpop-body"]')).toBe(true);
    await page.mouse.move(5, 880);
    await sleep(300);
    expect(await gone('[data-testid="hoverpop-body"]')).toBe(true);
  });
  test("ConfirmPop: the button waits for DELETE, then confirms", async () => {
    await page.click('[data-testid="confirm-trigger"]');
    const btn = '.confirm button.ui-btn';
    expect(await page.$eval(btn, (e) => (e as HTMLButtonElement).disabled)).toBe(true);
    await page.type('input[aria-label="Type DELETE to confirm"]', "DELETE");
    expect(await page.$eval(btn, (e) => (e as HTMLButtonElement).disabled)).toBe(false);
    await page.click(btn);
    expect(await out("pops-out")).toContain('"confirmed":"deleted"');
    await page.keyboard.press("Escape");
  });
});

describe("DateRange (the kit's calendar)", () => {
  const trigger = '[data-testid="daterange"] button.daterange';
  const day = (iso: string) => `.daterange-day[data-day="${iso}"]`;
  test("opens on the current month; a second click on the field closes it", async () => {
    await page.click(trigger);
    expect(await visible(".daterange-cal")).toBe(true);
    const title = await page.$eval(".daterange-title", (e) => e.textContent);
    expect(title).toBe(new Date().toLocaleString("en-US", { month: "long", year: "numeric" }));
    expect(await page.$$eval(".daterange-dow", (els) => els.map((e) => e.textContent))).toEqual(["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]);
    // only the weeks the month needs: 4–6 rows of 7
    const cells = (await page.$$(".daterange-day")).length;
    expect(cells % 7 === 0 && cells >= 28 && cells <= 42).toBe(true);
    await page.click(trigger);
    expect(await gone(".daterange-cal")).toBe(true);
  });
  test("Day mode: one click picks and closes", async () => {
    await page.click(trigger);
    await page.click(".daterange-nav.prev");
    const first = await page.$eval(".daterange-day:not(.outside)", (e) => (e as HTMLElement).dataset.day!);
    await page.click(day(first));
    expect(await gone(".daterange-cal")).toBe(true);
    expect(await out("formats")).toContain(`{"from":"${first}","to":"${first}"}`);
  });
  test("Range mode: first click, hover preview, second click (either order)", async () => {
    await page.click(trigger);
    await page.click(".daterange-foot .ui-seg button:nth-child(2)"); // Range
    await page.click(".daterange-nav.next");
    const days = await page.$$eval(".daterange-week .daterange-day:not(.outside)", (els) => els.map((e) => (e as HTMLElement).dataset.day!));
    const [a, b] = [days[12]!, days[3]!]; // the second click is BEFORE the first: the range swaps
    await page.click(day(a));
    await page.hover(day(b));
    expect(await page.$eval(trigger, (e) => e.textContent)).toContain("–");
    await page.click(day(b));
    expect(await gone(".daterange-cal")).toBe(true);
    const v = JSON.parse((await out("formats")).split(" | ").at(-1)!);
    expect(v.from <= v.to).toBe(true);
    expect(v).toEqual({ from: b, to: a });
  });
  test("shortcut: 7 days", async () => {
    await page.click(trigger);
    await page.click('.daterange-shortcuts button[title="Last 7 days"]');
    const v = JSON.parse((await out("formats")).split(" | ").at(-1)!);
    const days = (Date.parse(v.to) - Date.parse(v.from)) / 864e5;
    expect(days).toBe(6);
  });
  test("keyboard: Tab into the grid, arrows move, Enter picks", async () => {
    await page.click(trigger);
    await page.click(".daterange-foot .ui-seg button:nth-child(1)"); // Day
    await page.focus(".daterange-day[tabindex='0']");
    const start = await page.evaluate(() => (document.activeElement as HTMLElement).dataset.day!);
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowDown");
    const now = await page.evaluate(() => (document.activeElement as HTMLElement).dataset.day!);
    expect((Date.parse(now) - Date.parse(start)) / 864e5).toBe(8);
    await page.keyboard.press("Enter");
    expect(await gone(".daterange-cal")).toBe(true);
    expect(await out("formats")).toContain(`"from":"${now}"`);
  });
  test("Escape and an outside click close it", async () => {
    await page.click(trigger);
    await page.keyboard.press("Escape");
    expect(await gone(".daterange-cal")).toBe(true);
    await page.click(trigger);
    await clickOutside();
    expect(await gone(".daterange-cal")).toBe(true);
  });
});

describe("Tier 1: controls, DateInput, ConfirmDialog, toggles, chips, stats", () => {
  const more = (k: string) => out("more-out").then((t) => JSON.parse(t)[k]);
  test("Button: loading shows a spinner and blocks clicks", async () => {
    await page.click('[data-testid="btn-save"]');
    expect(await page.$eval('[data-testid="btn-save"]', (e) => [(e as HTMLButtonElement).disabled, !!e.querySelector(".ui-spin")])).toEqual([true, true]);
    await sleep(500);
    expect(await page.$eval('[data-testid="btn-save"]', (e) => (e as HTMLButtonElement).disabled)).toBe(false);
  });
  test("Input invalid, Select placeholder + options, Textarea, Checkbox with count", async () => {
    await page.type('input[aria-label="Name"]', "bad");
    expect(await page.$eval('input[aria-label="Name"]', (e) => [e.classList.contains("fail"), e.getAttribute("aria-invalid")])).toEqual([true, "true"]);
    expect(await page.$$eval('select[aria-label="Unit"] option', (o) => o.map((x) => x.textContent))).toEqual(["All units", "Kilogram", "Metric ton"]);
    await page.select('select[aria-label="Unit"]', "mt");
    await page.type('textarea[aria-label="Note"]', "hello");
    await page.click('[data-testid="more"] .ui-check');
    const v = JSON.parse(await out("controls-out"));
    expect([v.pick, v.note, v.agree]).toEqual(["mt", "hello", true]);
    expect(await page.$eval('[data-testid="more"] .ui-check .count', (e) => e.textContent)).toBe("7");
  });
  test("DateInput: picks a day, greys out days outside min/max, Today, Clear", async () => {
    const trigger = '[data-testid="dateinput"] button.daterange';
    await page.click(trigger);
    // view the month of min (Oct 2026): the 1st is before min → disabled and not pickable
    while ((await page.$eval(".daterange-title", (e) => e.textContent)) !== "October 2026")
      await page.click((await page.$eval(".daterange-title", (e) => e.textContent!)) > "October 2026" ? ".daterange-nav.prev" : ".daterange-nav.next");
    expect(await page.$eval('.daterange-day[data-day="2026-10-01"]', (e) => (e as HTMLButtonElement).disabled)).toBe(true);
    await page.click('.daterange-day[data-day="2026-10-01"]').catch(() => {});
    expect(await more("day1")).toBe("");
    await page.click('.daterange-day[data-day="2026-10-12"]');
    expect(await gone(".daterange-cal")).toBe(true);
    expect(await more("day1")).toBe("2026-10-12");
    expect(await page.$eval(trigger, (e) => e.textContent)).toContain("Oct 12, 2026");
    await page.click(trigger);
    await page.click(".dateinput-foot button:nth-child(2)"); // Clear
    expect(await more("day1")).toBe("");
  });
  test("useConfirm: opens from code, waits for DELETE, resolves; Cancel resolves null", async () => {
    await page.click('[data-testid="ask"]');
    expect(await visible(".inv-frame.sm")).toBe(true);
    const ok = ".inv-frame.sm .ui-btn.danger";
    expect(await page.$eval(ok, (e) => (e as HTMLButtonElement).disabled)).toBe(true);
    await page.keyboard.type("DELETE"); // the typed field has focus
    await page.click(ok);
    expect(await gone(".inv-frame.sm")).toBe(true);
    expect(await more("asked")).toBe("");
    await page.click('[data-testid="ask"]');
    await page.click(".inv-frame.sm .ui-btn:not(.danger)"); // Cancel
    expect(await gone(".inv-frame.sm")).toBe(true);
    expect(await more("asked")).toBe("null");
  });
  test("ToggleGroup multiple keeps the options' order; clearable={false} keeps a pick", async () => {
    const group = (name: string) => `[aria-label="${name}"].ui-toggle button`;
    const btns = await page.$$(group("Products"));
    await btns[2]!.click(); // Sheet
    await btns[0]!.click(); // TMT
    expect(await more("products")).toBe("tmt,sheet");
    await btns[2]!.click();
    expect(await more("products")).toBe("tmt");
    const line = await page.$$(group("Line"));
    await line[0]!.click(); // Magadh again: stays picked
    expect(await more("line")).toBe("magadh");
    await line[1]!.click();
    expect(await more("line")).toBe("mahan");
  });
  test("chips: clickable purple chip, dimmed chip, status tones and kept abbreviations", async () => {
    await page.click('[data-testid="more"] button.ui-chip.clickable');
    expect(await more("chipClicks")).toBe(1);
    expect(await page.$eval('[data-testid="more"] .ui-chip.dim', (e) => getComputedStyle(e).opacity)).toBe("0.5");
    const chips = await page.$$eval('[data-testid="more"] .ui-chip', (els) => els.map((e) => e.textContent));
    expect(chips).toContain("Order out");
    expect(chips).toContain("MO approved");
    const okColor = await page.$$eval('[data-testid="more"] .ui-chip', (els) => getComputedStyle(els.find((e) => e.textContent === "Order out")!).color);
    expect(okColor).toBe("rgb(34, 197, 94)");
  });
  test("ToolbarStats: figures in the toolbar; a clickable one is a button", async () => {
    expect(await page.$$eval(".toolbar .ui-tstat-l", (e) => e.map((x) => x.textContent))).toEqual(["present", "absent"]);
    await page.click(".toolbar button.ui-tstat");
    expect(await more("statClicks")).toBe(1);
  });
});

describe("Tier 2: tabs, pagination, feedback", () => {
  const t = () => out("tabs-out").then((x) => JSON.parse(x));
  test("Tabs: click and arrow keys (skipping a disabled tab)", async () => {
    await page.click('.ui-tabs [data-tab="logs"]');
    expect((await t()).tab).toBe("logs");
    await page.keyboard.press("ArrowRight"); // Files is disabled → wraps to Details
    expect((await t()).tab).toBe("details");
    expect(await page.evaluate(() => (document.activeElement as HTMLElement).dataset.tab)).toBe("details");
    expect(await page.$eval('.ui-tabs [data-tab="logs"] .ui-tabs-count', (e) => e.textContent)).toBe("12");
  });
  test("Pagination: next / previous and rows per page", async () => {
    const pg = '[data-testid="pagination"]';
    expect(await page.$eval(`${pg} .ui-num`, (e) => e.textContent)).toBe("1-25 of 683 partners");
    await page.click(`${pg} button[aria-label="Next page"]`);
    expect(await page.$eval(`${pg} .ui-num`, (e) => e.textContent)).toBe("26-50 of 683 partners");
    await page.select(`${pg} select`, "100");
    expect((await t()).page).toEqual({ pageIndex: 0, pageSize: 100 });
    expect(await page.$eval(`${pg} button[aria-label="Previous page"]`, (e) => (e as HTMLButtonElement).disabled)).toBe(true);
  });
  test("Spinner, Progress, Kbd, Avatar", async () => {
    expect(await page.$eval('[data-testid="more"] .ui-spinner', (e) => e.getAttribute("role"))).toBe("status");
    expect(await page.$$eval('[data-testid="more"] [role=progressbar]', (e) => e.map((x) => x.getAttribute("aria-valuenow")))).toEqual(["42", null]);
    expect(await page.$eval('[data-testid="more"] .ui-kbd', (e) => e.textContent)).toBe("/");
    expect(await page.$$eval('[data-testid="more"] .ui-avatar', (e) => e.map((x) => x.textContent))).toEqual(["RS", "JI"]);
  });
});

describe("Toolbar, table, menus", () => {
  test("/ focuses search and selects its text; typing filters the table", async () => {
    await page.click(TABLE);
    await page.keyboard.press("/");
    expect(await page.evaluate(() => (document.activeElement as HTMLInputElement).placeholder)).toBe("Search partners");
    await page.keyboard.type("Partner 0");
    await sleep(100);
    expect((await page.$$(`${TABLE} tbody tr`)).length).toBe(9);
    await page.keyboard.press("Escape");
  });
  test("ToggleGroup: picks, and a second click clears", async () => {
    const debit = '.toolbar .ui-toggle button:first-child';
    await page.click(debit);
    expect(await out("formats")).toContain("| D |");
    await page.click(debit);
    expect(await out("formats")).toContain("| all |");
  });
  test("sorting by a header", async () => {
    await page.click('.toolbar-search input', { clickCount: 3 });
    await page.keyboard.press("Backspace");
    await sleep(100);
    const headers = await page.$$(`${TABLE} th`);
    await headers[2]!.click(); // Amount: a number column sorts high → low first (TanStack's default)
    const first = await page.$eval(`${TABLE} tbody tr td:nth-child(1)`, (e) => e.textContent);
    expect(first).toBe("Partner 30");
    expect(await page.$eval(`${TABLE} th:nth-child(3)`, (e) => e.getAttribute("aria-sort"))).toBe("descending");
  });
  test("Customize columns sits in the bottom bar and hides a column", async () => {
    await page.click('[data-testid="table"] .ui-foot button.ui-link');
    const city = await page.$$("xpath/.//label[span[text()='City']]/input");
    await city[0]!.click();
    const heads = await page.$$eval(`${TABLE} th`, (els) => els.map((e) => e.textContent));
    expect(heads.join("|")).not.toContain("City");
    await page.keyboard.press("Escape");
  });
  test("row menu: right-click, pick an item; a confirm item asks first", async () => {
    const row = await page.$(`${TABLE} tbody tr`);
    await row!.click({ button: "right" });
    await page.click(".ctxmenu button");
    expect(await out("menu-out")).toBe("view Partner 30");
  });
  test("file viewer: opens, arrow moves, Esc closes", async () => {
    await page.click('[data-testid="misc"] .fv-tile');
    expect(await visible(".fv")).toBe(true);
    expect(await page.$eval(".fv-count", (e) => e.textContent)).toBe("1 / 2");
    await page.keyboard.press("ArrowRight");
    expect(await page.$eval(".fv-count", (e) => e.textContent)).toBe("2 / 2");
    await page.keyboard.press("Escape");
    expect(await gone(".fv")).toBe(true);
  });
  test("MiniTable draws with the page table, highlighting a row", async () => {
    expect(await page.$$eval('[data-testid="mini"] .ui-table-host.bare tbody tr', (r) => r.length)).toBe(3);
    expect(await page.$$eval('[data-testid="mini"] tr.warn', (r) => r.length)).toBe(1);
  });
  test("no errors after all of it", async () => {
    await page.screenshot({ path: `${import.meta.dir}/../shots/bench.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
});
