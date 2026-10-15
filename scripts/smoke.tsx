// Loads the BUILT package and renders a few components to HTML: proves the module graph resolves with no app code.
import { renderToString } from "react-dom/server";
const kit = await import("../dist/index.js");
const { ToneChip, StatusChip, Empty, ToggleGroup, MiniTable, dayTime, rupees, num } = kit as any;
const html = renderToString(
  <div>
    <ToneChip tone="ok">Paid</ToneChip>
    <StatusChip status="NOT_ASSIGNED" />
    <Empty title="Nothing here" />
    <ToggleGroup label="Type" value="" onChange={() => {}} options={[{ value: "D", label: "Debit" }, { value: "C", label: "Credit" }]} />
    <MiniTable rows={[{ id: "1", n: "Bar" }]} rowKey={(r: any) => r.id} cols={[{ key: "n", header: "Name", cell: (r: any) => r.n }]} />
  </div>,
);
console.log(Object.keys(kit).length, "exports");
console.log(html.length > 200 ? "rendered OK" : "render too small", "|", dayTime("2026-10-15T09:00:00Z"), "|", rupees(1234567.5), "|", num(1234567));
