// demo: Autocomplete over a server search
import { useEffect, useState } from "react";
import { Autocomplete, type AutocompleteOption, useDebounced, useKeepPicked } from "@mds/ui";

// stands in for your API: matches on the GSTIN too, which the rows do not show
const ALL = [
  { id: "c1", name: "Ravi Traders", city: "Patna", gstin: "10AAACR1234F1Z5" },
  { id: "c2", name: "Ravi Steel House", city: "Ara", gstin: "10AAFCR8890K1Z2" },
  { id: "c3", name: "Shree Cement Agency", city: "Gaya", gstin: "10ABCPS4521L1Z9" },
  { id: "c4", name: "Mithila Steel", city: "Darbhanga", gstin: "10AAJFM7781Q1Z1" },
  { id: "c5", name: "Kosi Hardware", city: "Purnia", gstin: "10ACKPK1102M1Z3" },
];
const searchCustomers = (q: string) =>
  new Promise<typeof ALL>((resolve) =>
    setTimeout(() => {
      const t = q.toLowerCase();
      resolve(ALL.filter((c) => !t || c.name.toLowerCase().includes(t) || c.gstin.toLowerCase().includes(t)));
    }, 400),
  );

export default function AutocompleteServer() {
  const [customer, setCustomer] = useState<string | null>(null);
  const [term, setTerm] = useState("");
  const q = useDebounced(term, 250);
  const [rows, setRows] = useState<Array<AutocompleteOption>>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let live = true;
    setLoading(true);
    void searchCustomers(q).then((list) => {
      if (!live) return;
      setRows(list.map((c) => ({ value: c.id, label: c.name, hint: c.city })));
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [q]);
  // the picked customer stays in the list (ticked) after the search moves on
  const options = useKeepPicked(rows, customer);
  return (
    <div style={{ maxWidth: 360 }}>
      <Autocomplete
        label="Customer"
        options={options}
        localFilter={false}
        loading={loading}
        onSearchChange={setTerm}
        value={customer}
        onChange={setCustomer}
        placeholder="Name or GSTIN"
      />
    </div>
  );
}
