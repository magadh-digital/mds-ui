// One page that uses every part of @mds/ui the consoles rely on, installed from the packed tarball.
// Each block has a data-testid and writes what happened into an <output>, so tests/ui.test.ts can read the result.
import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type { ColumnDef, PaginationState, SortingState, VisibilityState } from "@tanstack/react-table";
import { Bell, Trash2 } from "lucide-react";
import "@mds/ui/tokens.css";
import {
  Autocomplete,
  ConfirmPop,
  DateRange,
  DenseTable,
  EditPop,
  Empty,
  FileThumb,
  HoverPop,
  MiniTable,
  MoreMenu,
  Pop,
  Seg,
  StatusChip,
  Term,
  TermsProvider,
  Tip,
  ToggleGroup,
  ToneChip,
  Toaster,
  Toolbar,
  date,
  day,
  dayTime,
  rupees,
  toast,
  useContextMenu,
  useFileViewer,
  type AutocompleteOption,
  type RangeValue,
  Avatar,
  Button,
  Checkbox,
  DateInput,
  IconButton,
  Input,
  Kbd,
  Pagination,
  Progress,
  Select,
  Spinner,
  Tabs,
  Textarea,
  ToolbarStats,
  useConfirm,
} from "@mds/ui";
import { Pencil } from "lucide-react";

const CITIES: Array<AutocompleteOption> = [
  { value: "patna", label: "Patna", hint: "Bihar", group: "Bihar" },
  { value: "gaya", label: "Gaya", hint: "Bihar", group: "Bihar" },
  { value: "muz", label: "Muzaffarpur", hint: "Bihar", group: "Bihar", keywords: "litchi" },
  { value: "ranchi", label: "Ranchi", hint: "Jharkhand", group: "Jharkhand" },
  { value: "dhanbad", label: "Dhanbad", hint: "Jharkhand", group: "Jharkhand", disabled: true },
  { value: "kolkata", label: "Kolkātā", hint: "West Bengal", group: "Bengal" },
];
const PLAIN = CITIES.map(({ group: _g, ...o }) => o);

type Row = { id: string; name: string; city: string; amount: number; status: string; at: string };
const ROWS: Array<Row> = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  name: `Partner ${String(i + 1).padStart(2, "0")}`,
  city: PLAIN[i % PLAIN.length]!.label,
  amount: (i + 1) * 12345.5,
  status: i % 3 === 0 ? "ACTIVE" : i % 3 === 1 ? "NOT_ASSIGNED" : "INACTIVE",
  at: date("2026-10-01").add(i, "day").format("YYYY-MM-DD"),
}));

function Out({ id, v }: { id: string; v: unknown }) {
  return (
    <output data-testid={id} style={{ display: "block", fontFamily: "monospace", fontSize: 12 }}>
      {typeof v === "string" ? v : JSON.stringify(v)}
    </output>
  );
}

function App() {
  const [single, setSingle] = useState<string | null>(null);
  const [multi, setMulti] = useState<Array<string>>(["patna"]);
  const [grouped, setGrouped] = useState<string | null>(null);
  const [inPop, setInPop] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchLog, setSearchLog] = useState<Array<string>>([]);
  const [range, setRange] = useState<RangeValue>({});
  const [toggle, setToggle] = useState<"D" | "C" | "">("");
  const [seg, setSeg] = useState<"list" | "board">("list");
  const [q, setQ] = useState("");
  const [confirmed, setConfirmed] = useState("");
  const [edited, setEdited] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [cols, setCols] = useState<VisibilityState>({});
  const [menuPick, setMenuPick] = useState("");
  const menu = useContextMenu();
  const viewer = useFileViewer();
  // Tier 1 / Tier 2 components
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const [pick, setPick] = useState("");
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [day1, setDay1] = useState("");
  const [products, setProducts] = useState<Array<"tmt" | "coil" | "sheet" | "pipe">>([]);
  const [line, setLine] = useState<"magadh" | "mahan">("magadh");
  const [chipClicks, setChipClicks] = useState(0);
  const [statClicks, setStatClicks] = useState(0);
  const [tab, setTab] = useState<"details" | "logs" | "files">("details");
  const [page, setPage] = useState({ pageIndex: 0, pageSize: 25 });
  const [asked, setAsked] = useState("not asked");
  const ask = useConfirm();

  const columns = useMemo<Array<ColumnDef<Row, unknown>>>(
    () => [
      { id: "name", accessorKey: "name", header: "Name", meta: { label: "Name" } },
      { id: "city", accessorKey: "city", header: "City", meta: { label: "City" } },
      {
        id: "amount",
        accessorKey: "amount",
        header: "Amount",
        meta: { label: "Amount", align: "right" },
        cell: ({ getValue }) => rupees(getValue<number>(), 2),
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        meta: { label: "Status" },
        cell: ({ getValue }) => <StatusChip status={getValue<string>()} />,
      },
      { id: "at", accessorKey: "at", header: "Date", meta: { label: "Date" }, cell: ({ getValue }) => day(getValue<string>()) },
    ],
    [],
  );
  const rows = ROWS.filter((r) => !q || r.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <TermsProvider glossary={{ lookup: (k) => (k === "Amount" ? { d: "Bill value with tax", old: "Gross" } : undefined) }}>
      <div className="main" style={{ minHeight: "100vh" }}>
        <Toolbar
          title="Test bench"
          count={rows.length}
          onRefresh={() => void toast.ok("Refreshed")}
          filters={
            <>
              <div data-testid="daterange" style={{ width: 230 }}>
                <DateRange value={range} onChange={setRange} />
              </div>
              <ToggleGroup
                label="Type"
                value={toggle}
                onChange={setToggle}
                options={[{ value: "D", label: "Debit" }, { value: "C", label: "Credit" }]}
              />
            </>
          }
          search={{ value: q, onChange: setQ, placeholder: "Search partners" }}
        >
          <ToolbarStats
            items={[
              { label: "present", value: 12, tone: "ok" },
              { label: "absent", value: 3, tone: "error", onClick: () => setStatClicks((n) => n + 1) },
            ]}
          />
          <button type="button" className="ui-btn primary">Add</button>
          <MoreMenu items={[{ key: "export", label: "Export", onSelect: () => void toast.info("Export") }]} />
        </Toolbar>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, padding: 16 }}>
          <section data-testid="ac-single">
            <h4>Autocomplete (single)</h4>
            <Autocomplete options={PLAIN} value={single} onChange={(v) => setSingle(v)} placeholder="City" ariaLabel="City" />
            <Out id="ac-single-out" v={single ?? "none"} />
          </section>
          <section data-testid="ac-multi">
            <h4>Autocomplete (multiple)</h4>
            <Autocomplete multiple options={PLAIN} value={multi} onChange={(v) => setMulti(v)} placeholder="Cities" ariaLabel="Cities" />
            <Out id="ac-multi-out" v={multi.join(",")} />
          </section>
          <section data-testid="ac-grouped">
            <h4>Autocomplete (groups)</h4>
            <Autocomplete options={CITIES} value={grouped} onChange={(v) => setGrouped(v)} placeholder="Grouped" ariaLabel="Grouped" groupOrder={["Jharkhand"]} />
            <Out id="ac-grouped-out" v={grouped ?? "none"} />
          </section>
          <section data-testid="ac-server">
            <h4>Autocomplete (server search)</h4>
            <Autocomplete
              options={PLAIN.filter((o) => search.length >= 2 && o.label.toLowerCase().startsWith(search.toLowerCase()))}
              localFilter={false}
              value={null}
              onChange={() => {}}
              onSearchChange={(t) => {
                setSearch(t);
                setSearchLog((l) => [...l, t]);
              }}
              placeholder="Server search"
              ariaLabel="Server search"
              emptyText="Type 2 letters"
            />
            <Out id="ac-server-out" v={searchLog.join("|")} />
          </section>
          <section data-testid="pops">
            <h4>Popovers</h4>
            <div className="hstack" style={{ gap: 8, flexWrap: "wrap" }}>
              <Tip label="A tooltip">
                <button type="button" className="ui-btn" data-testid="tip-trigger">Hover me</button>
              </Tip>
              <Pop trigger={<button type="button" className="ui-btn" data-testid="pop-trigger">Pop</button>}>
                <div data-testid="pop-body">
                  Pick inside a popover:
                  <Autocomplete options={PLAIN} value={inPop} onChange={(v) => setInPop(v)} ariaLabel="City in pop" />
                </div>
              </Pop>
              <EditPop title="Edit rate" trigger={<button type="button" className="ui-btn" data-testid="editpop-trigger">Edit</button>}>
                {(close) => (
                  <form
                    data-testid="editpop-body"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setEdited(String(new FormData(e.currentTarget).get("rate")));
                      close();
                    }}
                  >
                    <input name="rate" className="ui-input" defaultValue="62.5" aria-label="Rate" />
                    <button type="submit" className="ui-btn primary">Save</button>
                  </form>
                )}
              </EditPop>
              <HoverPop trigger={<span data-testid="hoverpop-trigger">Summary ⓘ</span>}>
                <div data-testid="hoverpop-body">3 vehicles · 5 orders</div>
              </HoverPop>
              <ConfirmPop
                trigger={<button type="button" className="ui-btn danger" data-testid="confirm-trigger"><Trash2 size={14} /> Delete</button>}
                title="Delete partner"
                danger
                typed="DELETE"
                confirmLabel="Delete"
                onConfirm={() => setConfirmed("deleted")}
              />
            </div>
            <Out id="pops-out" v={{ inPop, edited, confirmed }} />
          </section>
          <section data-testid="misc">
            <h4>Chips, formats, Seg, file</h4>
            <div className="hstack" style={{ gap: 6, flexWrap: "wrap" }}>
              <ToneChip tone="ok">Paid</ToneChip>
              <StatusChip status="NOT_ASSIGNED" />
              <Seg value={seg} onChange={setSeg} options={[{ value: "list", label: "List" }, { value: "board", label: "Board" }]} />
              <FileThumb
                file={{ src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='40' height='40' fill='%23006fff'/></svg>", name: "logo.svg" }}
                onOpen={() => viewer.open([{ src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='40' height='40' fill='%23006fff'/></svg>", name: "logo.svg" }, { src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='18' fill='%2322c55e'/></svg>", name: "dot.svg" }], 0)}
                size="sm"
              />
            </div>
            <Out id="formats" v={`${dayTime("2026-10-15T09:00:00Z")} | ${rupees(1234567.5, 2)} | ${date("2026-01-31").add(1, "month").format("DD MMM YYYY")} | ${seg} | ${toggle || "all"} | ${JSON.stringify(range)}`} />
            <Empty icon={Bell} title="Nothing here" compact>No alerts yet.</Empty>
          </section>
        </div>

        <section data-testid="more" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, padding: 16 }}>
          <div className="vstack" style={{ gap: 8 }}>
            <h4>Controls</h4>
            <div className="hstack" style={{ gap: 8 }}>
              <Button variant="primary" loading={busy} onClick={() => { setBusy(true); setTimeout(() => setBusy(false), 400); }} data-testid="btn-save">Save</Button>
              <Button size="sm" variant="danger">Delete</Button>
              <IconButton label="Edit row"><Pencil /></IconButton>
            </div>
            <Input aria-label="Name" value={text} onChange={(e) => setText(e.target.value)} invalid={text === "bad"} placeholder="Name" />
            <Select aria-label="Unit" value={pick} onChange={(e) => setPick(e.target.value)} placeholder="All units" options={[{ value: "kg", label: "Kilogram" }, { value: "mt", label: "Metric ton" }]} />
            <Textarea aria-label="Note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" />
            <Checkbox label="Agree" count={7} checked={agree} onChange={setAgree} />
            <Out id="controls-out" v={{ text, pick, note, agree, busy }} />
          </div>
          <div className="vstack" style={{ gap: 8 }}>
            <h4>Date, confirm, toggles</h4>
            <div data-testid="dateinput" style={{ width: 220 }}>
              <DateInput value={day1} onChange={setDay1} min="2026-10-05" max="2026-10-25" ariaLabel="Bill date" />
            </div>
            <Button data-testid="ask" onClick={async () => setAsked(String(await ask.confirm({ title: "Delete vehicle", danger: true, typed: "DELETE", confirmLabel: "Delete" })))}>Delete from code</Button>
            <ToggleGroup multiple label="Products" value={products} onChange={setProducts} options={[{ value: "tmt", label: "TMT" }, { value: "coil", label: "Coil" }, { value: "sheet", label: "Sheet" }, { value: "pipe", label: "Pipe" }]} />
            <ToggleGroup label="Line" value={line} onChange={(v) => v && setLine(v)} clearable={false} options={[{ value: "magadh", label: "Magadh" }, { value: "mahan", label: "Mahan" }]} />
            <div className="hstack" style={{ gap: 6 }}>
              <ToneChip tone="purple" onClick={() => setChipClicks((n) => n + 1)}>Admin</ToneChip>
              <ToneChip tone="muted" dim>Unused</ToneChip>
              <StatusChip status="ORDER_OUT" tones={{ order_out: "ok" }} />
              <StatusChip status="MO_APPROVED" keep={["MO"]} />
            </div>
            <Out id="more-out" v={{ day1, asked, products: products.join(","), line, chipClicks, statClicks }} />
          </div>
          <div className="vstack" style={{ gap: 8 }}>
            <h4>Tabs, pages, feedback</h4>
            <Tabs label="Record" value={tab} onChange={setTab} tabs={[{ value: "details", label: "Details" }, { value: "logs", label: "Logs", count: 12 }, { value: "files", label: "Files", disabled: true }]} />
            <div data-testid="pagination">
              <Pagination {...page} total={683} label="partners" onChange={setPage} />
            </div>
            <div className="hstack" style={{ gap: 12 }}>
              <Spinner />
              <Avatar name="Rajesh Kumar Singh" />
              <Avatar name="M/S Jai Durga Iron" src="data:image/png;base64,AAAA" />
              <span>Press <Kbd>/</Kbd> to search</span>
            </div>
            <Progress value={42} label="Upload" />
            <Progress value={null} label="Syncing" />
            <Out id="tabs-out" v={{ tab, page }} />
          </div>
          {ask.element}
        </section>

        <div style={{ padding: "0 16px" }} data-testid="mini">
          <MiniTable
            rows={ROWS.slice(0, 3)}
            rowKey={(r) => r.id}
            rowClassName={(r) => (r.status === "NOT_ASSIGNED" ? "warn" : "")}
            cols={[
              { key: "name", header: "Name", cell: (r) => r.name },
              { key: "amount", header: "Amount", align: "right", cell: (r) => rupees(r.amount) },
            ]}
          />
        </div>

        <div data-testid="table" style={{ height: 520, display: "flex", flexDirection: "column", padding: 16 }}>
          <div className="ui-muted" style={{ marginBottom: 4 }}>
            <Term label="Amount" /> column has a glossary hover · <Out id="menu-out" v={menuPick || "no menu pick"} />
          </div>
          <DenseTable<Row>
            label="Partners"
            columns={columns}
            data={rows}
            getRowId={(r) => r.id}
            sorting={sorting}
            onSortingChange={setSorting}
            pagination={pagination}
            onPaginationChange={setPagination}
            columnVisibility={cols}
            onColumnVisibility={setCols}
            loading={false}
            onRowContextMenu={(r, at) =>
              menu.open(at, [
                { key: "view", label: "View", onSelect: () => setMenuPick(`view ${r.name}`) },
                { key: "del", label: "Delete", danger: true, confirm: { title: "Delete?", confirmLabel: "Delete" }, onSelect: () => setMenuPick(`deleted ${r.name}`) },
              ], r.name)
            }
          />
          {menu.element}
        </div>
        {viewer.element}
        <Toaster />
      </div>
    </TermsProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
