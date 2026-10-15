// demo: a row click opens the record in a slide-over: head chips and stages, tabs with counts, tiles, details, a foot
import { useState } from "react";
import { FileText, History, ListChecks } from "lucide-react";
import {
  Button,
  Chips,
  FlowStrip,
  KeyValue,
  MiniTable,
  PanelFoot,
  PanelHead,
  PanelSection,
  PanelTabCounts,
  SlideOver,
  StatTiles,
  StatusChip,
  ToneChip,
  day,
  dayTime,
  money,
  toast,
} from "@mds/ui";

type Order = { id: string; partner: string; status: string; placed: string; lines: Array<{ item: string; qty: number; rate: number }> };

const ORDERS: Array<Order> = [
  { id: "SO-2481", partner: "Shree Traders", status: "dispatched", placed: "2026-10-14T10:20:00", lines: [{ item: "TMT bar 12 mm", qty: 40, rate: 610 }, { item: "Binding wire", qty: 12, rate: 95 }] },
  { id: "SO-2482", partner: "Gupta Steel", status: "open", placed: "2026-10-15T09:05:00", lines: [{ item: "TMT bar 16 mm", qty: 25, rate: 640 }] },
  { id: "SO-2483", partner: "Mithila Agro", status: "on_hold", placed: "2026-10-13T16:40:00", lines: [{ item: "Cement 50 kg", qty: 120, rate: 385 }] },
];
const total = (o: Order) => o.lines.reduce((s, l) => s + l.qty * l.rate, 0);

function OrderBody({ order, tab }: { order: Order; tab: string }) {
  return (
    <>
      {/* the body knows the record: it fills the head, the tab counts and the foot */}
      <PanelHead>
        <Chips>
          <StatusChip status={order.status} />
          <ToneChip tone="purple">{order.partner}</ToneChip>
        </Chips>
        <FlowStrip
          steps={[
            { label: "Placed", when: day(order.placed), state: "done" },
            { label: "Approved", when: day(order.placed), state: order.status === "on_hold" ? "hold" : "done" },
            { label: "Dispatched", state: order.status === "dispatched" ? "now" : "todo" },
            { label: "Delivered", state: "todo" },
          ]}
        />
      </PanelHead>
      <PanelTabCounts counts={{ lines: order.lines.length, history: order.status === "on_hold" ? { n: 1, tone: "warn" } : undefined }} />
      {tab === "summary" && (
        <>
          <StatTiles
            items={[
              { label: "Amount", value: money(total(order)) },
              { label: "Lines", value: order.lines.length },
              { label: "Credit left", value: money(185_000), tone: "ok" },
            ]}
          />
          <PanelSection title="Details">
            <KeyValue
              items={[
                { k: "Order", v: order.id, copy: order.id },
                { k: "Partner", v: order.partner },
                { k: "Placed", v: dayTime(order.placed), sub: "by Ravi Kumar" },
              ]}
            />
          </PanelSection>
        </>
      )}
      {tab === "lines" && (
        <PanelSection title="Lines">
          <MiniTable
            label="Order lines"
            rows={order.lines}
            rowKey={(l) => l.item}
            cols={[
              { key: "item", header: "Item", cell: (l) => l.item },
              { key: "qty", header: "Qty", align: "right", cell: (l) => l.qty },
              { key: "amount", header: "Amount", align: "right", cell: (l) => money(l.qty * l.rate) },
            ]}
          />
        </PanelSection>
      )}
      {tab === "history" && <PanelSection title="History">Placed {dayTime(order.placed)}.</PanelSection>}
      <PanelFoot note={order.status === "open" ? "Next: approve the order" : undefined}>
        <Button onClick={() => toast.ok("Printed")}>Print</Button>
        <Button variant="primary" disabled={order.status !== "open"} onClick={() => toast.ok(`${order.id} approved`)}>
          Approve
        </Button>
      </PanelFoot>
    </>
  );
}

export default function OrdersWithPanel() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState("summary");
  const order = ORDERS.find((o) => o.id === openId);

  return (
    // the panel slides over its nearest positioned parent: in an app, the shell's content area
    <div style={{ position: "relative", height: 460, overflow: "hidden", border: "1px solid var(--mds-c-border)", borderRadius: 6 }}>
      <div style={{ padding: 12 }}>
        <MiniTable
          label="Orders"
          rows={ORDERS}
          rowKey={(o) => o.id}
          onRowClick={(o) => {
            setOpenId(o.id);
            setTab("summary");
          }}
          rowClassName={(o) => (o.id === openId ? "on" : "")}
          cols={[
            { key: "id", header: "Order", cell: (o) => o.id },
            { key: "partner", header: "Partner", cell: (o) => o.partner },
            { key: "status", header: "Status", cell: (o) => <StatusChip status={o.status} /> },
            { key: "amount", header: "Amount", align: "right", cell: (o) => money(total(o)) },
          ]}
        />
      </div>
      <SlideOver
        open={!!order}
        title={order?.id ?? ""}
        meta={order ? day(order.placed) : undefined}
        onClose={() => setOpenId(null)}
        tabs={[
          { key: "summary", icon: FileText, label: "Summary" },
          { key: "lines", icon: ListChecks, label: "Lines" },
          { key: "history", icon: History, label: "History" },
        ]}
        tab={tab}
        onTab={setTab}
      >
        {order && <OrderBody order={order} tab={tab} />}
      </SlideOver>
    </div>
  );
}
