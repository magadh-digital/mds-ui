// demo: order lines in a panel section, short-shipped lines highlighted, and an empty table
import { MiniTable, PanelSection, money, num } from "@mds/ui";

type Line = { sku: string; item: string; ordered: number; shipped: number; rate: number };

const LINES: Array<Line> = [
  { sku: "TMT-12", item: "TMT bar 12 mm", ordered: 40, shipped: 40, rate: 610 },
  { sku: "TMT-16", item: "TMT bar 16 mm", ordered: 25, shipped: 18, rate: 640 },
  { sku: "WIRE-1", item: "Binding wire", ordered: 12, shipped: 12, rate: 95 },
  { sku: "CEM-50", item: "Cement 50 kg", ordered: 60, shipped: 0, rate: 385 },
];

export default function OrderLines() {
  return (
    <div style={{ maxWidth: 640, display: "grid", gap: 16 }}>
      <PanelSection title="Lines">
        <MiniTable
          label="Order lines"
          rows={LINES}
          rowKey={(l) => l.sku}
          // warn: part of the line is still to ship; error: nothing shipped
          rowClassName={(l) => (l.shipped === 0 ? "error" : l.shipped < l.ordered ? "warn" : "")}
          cols={[
            { key: "item", header: "Item", cell: (l) => l.item },
            { key: "ordered", header: "Ordered", align: "right", cell: (l) => num(l.ordered) },
            { key: "shipped", header: "Shipped", align: "right", cell: (l) => num(l.shipped) },
            { key: "rate", header: "Rate", align: "right", cell: (l) => money(l.rate) },
            { key: "amount", header: "Amount", align: "right", cell: (l) => money(l.ordered * l.rate) },
          ]}
        />
      </PanelSection>
      <PanelSection title="Returns">
        <MiniTable
          label="Returns"
          rows={[] as Array<Line>}
          rowKey={(l) => l.sku}
          empty="No returns on this order."
          cols={[
            { key: "item", header: "Item", cell: (l) => l.item },
            { key: "qty", header: "Qty", align: "right", cell: (l) => num(l.ordered) },
          ]}
        />
      </PanelSection>
    </div>
  );
}
