// Pure helpers of the display pieces: status tones and file kinds.
import { expect, test } from "bun:test";
import { statusLabel, statusTone } from "./chip.js";
import { kindOf } from "./fileviewer.js";

test("statusTone reads ON_HOLD, on-hold and on hold alike", () => {
  for (const s of ["ON_HOLD", "on-hold", "on hold", "On  Hold"]) expect(statusTone(s)).toBe("warn");
  expect(statusTone("not-required")).toBe("muted");
  expect(statusTone("in-stock")).toBe("ok");
  expect(statusTone("something else")).toBe("accent");
  expect(statusTone("")).toBe("muted");
  expect(statusLabel("not-required")).toBe("Not required");
});

test("kindOf reads the name first, then the URL", () => {
  expect(kindOf({ src: "blob:http://x/123", name: "bill.pdf" })).toBe("pdf");
  expect(kindOf({ src: "https://cdn/x?sig=1", name: "photo.JPG" })).toBe("image");
  expect(kindOf({ src: "https://cdn/files/rates.csv?v=2" })).toBe("file");
  expect(kindOf({ src: "https://cdn/files/abc" })).toBe("unknown");
  expect(kindOf({ src: "https://cdn/files/abc", kind: "pdf" })).toBe("pdf");
});
