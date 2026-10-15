// demo: HoverPop with an order's summary behind its number
import { day, HoverPop, money, StatusChip } from "@mds/ui";

const ORDERS = [
  { id: "SO-2041", partner: "Shree Balaji Traders", date: "2026-10-12", items: 3, amount: 412500, status: "DELIVERED" },
  { id: "SO-2042", partner: "Maa Tara Steel", date: "2026-10-13", items: 1, amount: 96800, status: "PENDING" },
  { id: "SO-2043", partner: "Bihar Build Mart", date: "2026-10-14", items: 5, amount: 1250400, status: "ON_HOLD" },
];

export default function HoverPopOrder() {
  return (
    <div className="mds-vstack" style={{ gap: 8 }}>
      {ORDERS.map((o) => (
        <div key={o.id} className="mds-hstack" style={{ gap: 12 }}>
          <HoverPop trigger={<a href={`#${o.id}`} className="mds-num">{o.id}</a>} label={`Order ${o.id}`} width="260px">
            <div className="mds-vstack" style={{ gap: 4 }}>
              <strong>{o.partner}</strong>
              <span className="mds-muted">{day(o.date)} · {o.items} items</span>
              <span className="mds-hstack" style={{ justifyContent: "space-between" }}>
                <span className="mds-num">{money(o.amount)}</span>
                <StatusChip status={o.status} />
              </span>
            </div>
          </HoverPop>
          <span className="mds-muted">{o.partner}</span>
        </div>
      ))}
    </div>
  );
}
