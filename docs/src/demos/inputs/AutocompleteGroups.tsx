// demo: Autocomplete with groups and disabled rows
import { useState } from "react";
import { Autocomplete, type AutocompleteOption } from "@mds/ui";

const ACCOUNTS: Array<AutocompleteOption> = [
  { value: "a1", label: "Freight inward", group: "Expenses" },
  { value: "a2", label: "Loading and unloading", group: "Expenses" },
  { value: "a3", label: "Office rent", group: "Expenses", disabled: true, hint: "Closed for this year" },
  { value: "a4", label: "HDFC current account", group: "Bank", hint: "•• 4410" },
  { value: "a5", label: "SBI cash credit", group: "Bank", hint: "•• 0921" },
  { value: "a6", label: "Petty cash", group: "Cash" },
  { value: "a7", label: "Sales: TMT bars", group: "Income" },
];

export default function AutocompleteGroups() {
  const [account, setAccount] = useState<string | null>(null);
  return (
    <div style={{ maxWidth: 360 }}>
      <Autocomplete
        label="Account"
        options={ACCOUNTS}
        groupOrder={["Bank", "Cash"]}
        value={account}
        onChange={setAccount}
        placeholder="Search accounts"
      />
    </div>
  );
}
