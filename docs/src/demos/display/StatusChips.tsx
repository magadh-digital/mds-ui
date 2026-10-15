// demo: StatusChip from raw status words, with a page's own tones and kept abbreviations
import { StatusChip } from "@mds/ui";

const STATUSES = ["APPROVED", "pending", "Rejected", "IN_PROGRESS", "ARCHIVED", "DISPATCHED", null];

export default function StatusChips() {
  return (
    <div className="mds-vstack" style={{ gap: 12 }}>
      <div className="mds-hstack" style={{ flexWrap: "wrap" }}>
        {STATUSES.map((s, i) => (
          <StatusChip key={i} status={s} />
        ))}
      </div>
      <div className="mds-hstack" style={{ flexWrap: "wrap" }}>
        <StatusChip status="ORDER_OUT" tones={{ ORDER_OUT: "ok", HALF_DAY: "warn" }} />
        <StatusChip status="HALF_DAY" tones={{ ORDER_OUT: "ok", HALF_DAY: "warn" }} />
        <StatusChip status="MO_APPROVED" keep={["MO"]} />
        <StatusChip status="GST_PENDING" keep={["GST"]} />
        <StatusChip status="PAID" label="Paid in full" title="Settled on 12 Oct" />
      </div>
    </div>
  );
}
