// demo: LaneStrip: a sales order's steps in lanes, with a blocked step that explains itself in a popover
import { LaneStrip, toast, type LaneRow } from "@mds/ui";

const LANES: Array<LaneRow> = [
  {
    lane: "sales",
    label: "Sales",
    nodes: [
      { key: "so", state: "done", what: "Order", tag: "SO", to: "Balaji Traders", sub: "40 t", join: null, current: true },
      { key: "dn", state: "done", what: "DN", to: "Gaya yard", sub: "38.6 t", join: "needs" },
      { key: "inv", state: "todo", what: "Invoice", sub: "₹22,54,240", join: "needs" },
    ],
  },
  {
    lane: "logistics",
    label: "Logistics",
    nodes: [
      { key: "wb", state: "done", what: "Weighment", sub: "38.6 t", join: null, changed: true, title: "Weight changed after the DN" },
      { key: "fr", state: "blocked", what: "Freight", to: "RK Roadlines", join: "beside", pop: <BlockedReasons /> },
    ],
  },
  {
    lane: "accounts",
    label: "Accounts",
    nodes: [
      { key: "pay", state: "todo", what: "Payment", join: null, after: ["Invoice"] },
      { key: "tds", state: "not_needed", what: "TDS", join: "beside", title: "Below the TDS limit" },
      { key: "einv", state: "done", what: "E-invoice", fact: true, join: "beside", title: "Held in the GST portal" },
    ],
  },
];

function BlockedReasons() {
  return (
    <div className="mds-vstack" style={{ gap: 4 }}>
      <strong>Freight is waiting on</strong>
      <span>The transporter's rate for Gaya → Patna is not set.</span>
      <span className="mds-muted">Set it under Masters → Freight rates.</span>
    </div>
  );
}

export default function LaneStripDemo() {
  return <LaneStrip label="Steps of SO-2041" lanes={LANES} onOpen={(key) => toast.info(`Open step: ${key}`)} />;
}
