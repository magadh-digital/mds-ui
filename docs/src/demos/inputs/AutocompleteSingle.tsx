// demo: Autocomplete, one pick
import { useState } from "react";
import { Autocomplete, type AutocompleteOption } from "@mds/ui";

const PARTNERS: Array<AutocompleteOption> = [
  { value: "p1", label: "Ravi Traders", hint: "Patna · RT-104" },
  { value: "p2", label: "Shree Cement Agency", hint: "Gaya · SC-221" },
  { value: "p3", label: "Mithila Steel", hint: "Darbhanga · MS-017" },
  { value: "p4", label: "Kosi Hardware", hint: "Purnia · KH-310", keywords: "sharma" },
  { value: "p5", label: "Ganga Build Mart", hint: "Bhagalpur · GB-088" },
  { value: "p6", label: "Sone Valley Suppliers", hint: "Dehri · SV-142" },
];

export default function AutocompleteSingle() {
  const [partner, setPartner] = useState<string | null>("p3");
  return (
    <div className="mds-vstack" style={{ maxWidth: 360, gap: 8 }}>
      <Autocomplete label="Partner" options={PARTNERS} value={partner} onChange={setPartner} placeholder="Search partners" />
      <span className="mds-muted">Picked: {partner ?? "—"}</span>
    </div>
  );
}
