// demo: Autocomplete, several picks as chips
import { useState } from "react";
import { Autocomplete, type AutocompleteOption } from "@mds/ui";

const WAREHOUSES: Array<AutocompleteOption> = [
  { value: "pat", label: "Patna Central", hint: "Bihar" },
  { value: "gya", label: "Gaya", hint: "Bihar" },
  { value: "ran", label: "Ranchi", hint: "Jharkhand" },
  { value: "dhn", label: "Dhanbad", hint: "Jharkhand" },
  { value: "vns", label: "Varanasi", hint: "Uttar Pradesh" },
  // a pick the person may not remove: no × on its chip
  { value: "hq", label: "Head office", hint: "Always included", disabled: true },
];

export default function AutocompleteMultiple() {
  const [picked, setPicked] = useState<Array<string>>(["hq", "pat", "ran"]);
  return (
    <div style={{ maxWidth: 360 }}>
      <Autocomplete
        multiple
        label="Warehouses"
        options={WAREHOUSES}
        value={picked}
        onChange={(values) => setPicked(values)}
        placeholder="Add warehouses"
      />
    </div>
  );
}
