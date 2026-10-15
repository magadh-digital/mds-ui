// demo: DateInput with min / max
import { useState } from "react";
import { date, DateInput, FormRow } from "@mds/ui";

export default function DateInputDemo() {
  const today = date().format("YYYY-MM-DD");
  const in30 = date().add(30, "day").format("YYYY-MM-DD");
  const [billDate, setBillDate] = useState(today);
  const [delivery, setDelivery] = useState("");
  return (
    <div>
      <FormRow label="Bill date" required>
        <DateInput value={billDate} onChange={setBillDate} max={today} clearable={false} />
      </FormRow>
      <FormRow label="Delivery by" hint="Within the next 30 days">
        <DateInput value={delivery} onChange={setDelivery} min={today} max={in30} placeholder="Not set" />
      </FormRow>
    </div>
  );
}
