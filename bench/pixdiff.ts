// Compares two folders of screenshots pixel by pixel: changed-pixel count and bounding box per file.
// bun pixdiff.ts <dirA> <dirB>
import puppeteer from "puppeteer-core";
import { readdirSync, readFileSync } from "node:fs";
const [a, bDir] = [process.argv[2]!, process.argv[3]!];
const CHROME = process.env.CHROME_PATH ?? `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1169/chrome-mac/Chromium.app/Contents/MacOS/Chromium`;
const br = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
const p = await br.newPage();
for (const f of readdirSync(a).filter((x) => x.endsWith(".png")).sort()) {
  const x = readFileSync(`${a}/${f}`).toString("base64");
  const y = readFileSync(`${bDir}/${f}`).toString("base64");
  const r = await p.evaluate(async (x, y) => {
    const load = (s: string) => new Promise<HTMLImageElement>((res) => { const i = new Image(); i.onload = () => res(i); i.src = "data:image/png;base64," + s; });
    const [ia, ib] = await Promise.all([load(x), load(y)]);
    if (ia.width !== ib.width || ia.height !== ib.height) return { size: `${ia.width}x${ia.height} vs ${ib.width}x${ib.height}` };
    const px = (i: HTMLImageElement) => { const c = document.createElement("canvas"); c.width = i.width; c.height = i.height; const g = c.getContext("2d")!; g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height).data; };
    const da = px(ia), db = px(ib);
    let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let k = 0; k < da.length; k += 4) if (da[k] !== db[k] || da[k + 1] !== db[k + 1] || da[k + 2] !== db[k + 2]) { n++; const q = k / 4, X = q % ia.width, Y = (q / ia.width) | 0; x0 = Math.min(x0, X); y0 = Math.min(y0, Y); x1 = Math.max(x1, X); y1 = Math.max(y1, Y); }
    return { changed: n, box: n ? [x0, y0, x1, y1] : null };
  }, x, y);
  console.log(f.padEnd(24), JSON.stringify(r));
}
await br.close();
