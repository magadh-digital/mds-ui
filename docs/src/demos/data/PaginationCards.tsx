// demo: a pager under a grid of cards (a list that is not a table)
import { useState } from "react";
import { Pagination, num, type PageState } from "@mds/ui";

type Warehouse = { id: string; name: string; city: string; stock: number };

const CITIES = ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Ara", "Begusarai"];
const WAREHOUSES: Array<Warehouse> = Array.from({ length: 29 }, (_, i) => ({
  id: `WH-${String(i + 1).padStart(2, "0")}`,
  name: `${CITIES[i % CITIES.length]} ${i < CITIES.length ? "Main" : `Depot ${Math.ceil((i + 1) / CITIES.length)}`}`,
  city: CITIES[i % CITIES.length]!,
  stock: 1_200 + ((i * 4_733) % 38_000),
}));

export default function WarehouseCards() {
  const [page, setPage] = useState<PageState>({ pageIndex: 0, pageSize: 6 });
  const shown = WAREHOUSES.slice(page.pageIndex * page.pageSize, (page.pageIndex + 1) * page.pageSize);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {shown.map((w) => (
          <div key={w.id} className="mds-card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 600 }}>{w.name}</div>
            <div className="mds-muted">
              {w.id} · {w.city}
            </div>
            <div className="mds-num" style={{ marginTop: 8 }}>
              {num(w.stock)} bags in stock
            </div>
          </div>
        ))}
      </div>
      <Pagination {...page} total={WAREHOUSES.length} onChange={setPage} pageSizes={[6, 12, 24]} label="warehouses" />
    </div>
  );
}
