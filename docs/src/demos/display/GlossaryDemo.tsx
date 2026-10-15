// demo: TermsProvider with a glossary; Term on labels, Code on coded values, and the "old names" choice
import { Code, MiniTable, Switch, Term, TermsProvider, useTerms, type Glossary, type GlossaryEntry } from "@mds/ui";

const ENTRIES: Record<string, GlossaryEntry> = {
  "Dispatch note": { d: "The paper that goes with a truck: what left the yard, for whom.", old: "Challan" },
  "Net weight": { d: "Loaded weight minus the empty truck's weight, from the weighbridge." },
  "state:arrived": { d: "The truck is inside the yard and waiting to be weighed.", old: "Gate in" },
  "state:loading": { d: "The truck is at the bay being loaded." },
};
const LABELS: Record<string, string> = { "state:arrived": "Arrived", "state:loading": "Loading" };

const glossary: Glossary = {
  lookup: (key) => ENTRIES[key],
  label: (key) => LABELS[key] ?? key,
};

const TRUCKS = [
  { id: "BR02GA4411", dn: "DN-5521", weight: "18.4 t", state: "state:arrived" },
  { id: "BR01PB7720", dn: "DN-5522", weight: "21.0 t", state: "state:loading" },
];

export default function GlossaryDemo() {
  return (
    <TermsProvider glossary={glossary}>
      <OldNamesSwitch />
      <MiniTable
        label="Trucks"
        rows={TRUCKS}
        rowKey={(t) => t.id}
        cols={[
          { key: "id", header: "Truck", cell: (t) => t.id },
          { key: "dn", header: "Dispatch note", cell: (t) => t.dn },
          { key: "weight", header: "Net weight", cell: (t) => t.weight },
          { key: "state", header: "State", cell: (t) => <Code k={t.state} /> },
        ]}
      />
      <p>
        Every <Term label="Dispatch note" /> needs a <Term label="Net weight" />. A label with no entry, like{" "}
        <Term label="Bay" />, is plain text.
      </p>
    </TermsProvider>
  );
}

function OldNamesSwitch() {
  const { oldNames, setOldNames } = useTerms();
  return (
    <div style={{ marginBottom: 12 }}>
      <Switch checked={oldNames} onChange={setOldNames} label="Show old names" />
    </div>
  );
}
