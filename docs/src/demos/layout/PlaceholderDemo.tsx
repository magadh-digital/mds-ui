// demo: a section that is not built yet
import { Placeholder } from "@mds/ui";

export default function ReportsSoon() {
  return (
    <div style={{ height: 160, display: "flex", border: "1px solid var(--mds-c-border)", borderRadius: 6, overflow: "hidden" }}>
      <Placeholder title="Reports" message="Sales reports arrive in the next release. Until then, export the orders list to Excel." />
    </div>
  );
}
