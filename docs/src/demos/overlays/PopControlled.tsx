// demo: Pop with controlled open state, closed from inside after a save
import { useState } from "react";
import { Button, FormRow, Pop, Select, toast } from "@mds/ui";

const WAREHOUSES = [
  { value: "gaya", label: "Gaya main yard" },
  { value: "patna", label: "Patna depot" },
  { value: "aurangabad", label: "Aurangabad store" },
  { value: "nawada", label: "Nawada yard" },
  { value: "jehanabad", label: "Jehanabad depot" },
];

export default function PopControlled() {
  const [open, setOpen] = useState(false);
  const [warehouse, setWarehouse] = useState("gaya");
  const [draft, setDraft] = useState(warehouse);
  const name = WAREHOUSES.find((w) => w.value === warehouse)?.label;
  return (
    <div className="mds-hstack" style={{ gap: 8 }}>
      <span>Ships from <strong>{name}</strong></span>
      <Pop
        trigger={<Button size="sm">Change</Button>}
        label="Change warehouse"
        width="280px"
        open={open}
        onOpenChange={(v) => {
          if (v) setDraft(warehouse);
          setOpen(v);
        }}
      >
        <div className="mds-vstack" style={{ gap: 10 }}>
          <FormRow label="Warehouse">
            <Select value={draft} onChange={(e) => setDraft(e.target.value)} options={WAREHOUSES} />
          </FormRow>
          <div className="mds-hstack" style={{ justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                setWarehouse(draft);
                setOpen(false);
                toast.ok("Warehouse changed");
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Pop>
    </div>
  );
}
