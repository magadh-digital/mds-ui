// demo: ToggleGroup as a form field that keeps one choice
import { useState } from "react";
import { FormRow, ToggleGroup } from "@mds/ui";

type Mode = "cash" | "upi" | "cheque";

export default function ToggleField() {
  const [mode, setMode] = useState<Mode | "">("upi");
  return (
    <FormRow label="Payment mode" required>
      <ToggleGroup
        label="Payment mode"
        clearable={false}
        value={mode}
        onChange={setMode}
        options={[
          { value: "cash", label: "Cash" },
          { value: "upi", label: "UPI" },
          { value: "cheque", label: "Cheque" },
        ]}
      />
    </FormRow>
  );
}
