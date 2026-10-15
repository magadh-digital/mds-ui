// demo: Pills for a small choice
import { useState } from "react";
import { Pills } from "@mds/ui";

type Period = "week" | "month" | "quarter";

export default function PillsDemo() {
  const [period, setPeriod] = useState<Period>("month");
  return (
    <Pills
      label="Chart period"
      value={period}
      onChange={setPeriod}
      options={[
        { value: "week", label: "Week" },
        { value: "month", label: "Month" },
        { value: "quarter", label: "Quarter" },
      ]}
    />
  );
}
