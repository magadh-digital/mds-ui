// demo: a filter sidebar with groups, counts and a collapse; the toolbar repeats the filters while it is hidden
import { useState } from "react";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import {
  CollapseButton,
  CountCheckbox,
  DenseTable,
  FilterGroup,
  Sidebar,
  SidebarLink,
  SidebarTop,
  StatusChip,
  ToggleGroup,
  Toolbar,
  statusLabel,
  toggle,
} from "@mds/ui";

type Truck = { id: string; vehicle: string; yard: string; status: string; kind: "inward" | "outward" };

const YARDS = ["Patna", "Gaya", "Hajipur", "Bihta"];
const STATUSES = ["waiting", "loading", "loaded", "on_hold"] as const;
const TONES = { waiting: "neutral", loading: "accent", loaded: "ok", on_hold: "warn" } as const;
const TRUCKS: Array<Truck> = Array.from({ length: 36 }, (_, i) => ({
  id: `T${i + 1}`,
  vehicle: `BR01 GA ${String(1000 + i * 37).slice(-4)}`,
  yard: YARDS[(i * 3) % YARDS.length]!,
  status: STATUSES[(i * 5) % STATUSES.length]!,
  kind: i % 3 === 0 ? "inward" : "outward",
}));

const columns: Array<ColumnDef<Truck>> = [
  { accessorKey: "vehicle", header: "Vehicle" },
  { accessorKey: "yard", header: "Yard" },
  { accessorKey: "kind", header: "Direction", cell: ({ row }) => (row.original.kind === "inward" ? "Inward" : "Outward") },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusChip status={row.original.status} /> },
];

export default function YardTrucks() {
  const [collapsed, setCollapsed] = useState(false);
  const [status, setStatus] = useState<Array<string>>([]);
  const [yards, setYards] = useState<Array<string>>([]);
  const [kind, setKind] = useState<"" | "inward" | "outward">("");
  const [q, setQ] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [page, setPage] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });

  // counts per status ignore the status filter itself, so every box says what ticking it would add
  const base = TRUCKS.filter(
    (t) => (!kind || t.kind === kind) && (!yards.length || yards.includes(t.yard)) && t.vehicle.toLowerCase().includes(q.toLowerCase()),
  );
  const rows = base.filter((t) => !status.length || status.includes(t.status));
  const count = (s: string) => base.filter((t) => t.status === s).length;
  const chips = [...status.map((s) => statusLabel(s)), ...yards, ...(kind ? [kind === "inward" ? "Inward" : "Outward"] : [])];

  return (
    <div style={{ height: 460, display: "flex", border: "1px solid var(--mds-c-border)", borderRadius: 6, overflow: "hidden" }}>
      <Sidebar
        collapsed={collapsed}
        footer={
          <SidebarLink
            disabled={!chips.length}
            onClick={() => {
              setStatus([]);
              setYards([]);
              setKind("");
            }}
          >
            Clear filters
          </SidebarLink>
        }
      >
        <SidebarTop>
          <span style={{ flex: 1, fontWeight: 600 }}>Filters</span>
          <CollapseButton collapsed={false} onToggle={() => setCollapsed(true)} />
        </SidebarTop>
        <FilterGroup title="Status" badge={status.length ? String(status.length) : undefined}>
          {STATUSES.map((s) => (
            <CountCheckbox
              key={s}
              label={statusLabel(s)}
              tone={TONES[s]}
              count={count(s)}
              checked={status.includes(s)}
              onChange={(on) => setStatus((l) => toggle(l, s, on))}
            />
          ))}
        </FilterGroup>
        {/* one control: the group shows no show/hide arrow */}
        <FilterGroup title="Direction">
          <ToggleGroup
            label="Direction"
            value={kind}
            onChange={setKind}
            options={[
              { value: "inward", label: "Inward" },
              { value: "outward", label: "Outward" },
            ]}
          />
        </FilterGroup>
        <FilterGroup title="Yard" defaultOpen={false}>
          {YARDS.map((y) => (
            <CountCheckbox key={y} label={y} checked={yards.includes(y)} onChange={(on) => setYards((l) => toggle(l, y, on))} />
          ))}
        </FilterGroup>
      </Sidebar>
      <div className="mds-main">
        <Toolbar
          title="Trucks"
          count={rows.length}
          collapsed={collapsed}
          onExpand={() => setCollapsed(false)}
          chips={collapsed ? chips : undefined}
          search={{ value: q, onChange: setQ, placeholder: "Search vehicles" }}
        />
        <DenseTable
          label="trucks"
          columns={columns}
          data={rows}
          getRowId={(r) => r.id}
          loading={false}
          sorting={sorting}
          onSortingChange={setSorting}
          pagination={page}
          onPaginationChange={setPage}
        />
      </div>
    </div>
  );
}
