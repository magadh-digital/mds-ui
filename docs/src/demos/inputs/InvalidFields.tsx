// demo: invalid fields
import { Input, Select, Textarea } from "@mds/ui";

export default function InvalidFields() {
  return (
    <div className="mds-vstack" style={{ gap: 8, maxWidth: 320 }}>
      <Input aria-label="GSTIN" defaultValue="10ABCDE1234" invalid />
      <Select aria-label="Unit" defaultValue="" placeholder="Pick a unit" invalid options={[{ value: "kg", label: "Kilogram" }, { value: "t", label: "Tonne" }]} />
      <Textarea aria-label="Reason" invalid placeholder="Why is this order on hold?" />
    </div>
  );
}
