// demo: Empty as a full state with an icon and next step, and compact inside a panel section
import { Button, Empty } from "@mds/ui";
import { PackageOpen, Plus } from "lucide-react";

export default function EmptyDemo() {
  return (
    <div className="mds-vstack" style={{ gap: 24 }}>
      <Empty
        icon={PackageOpen}
        title="No orders in this range"
        action={<Button variant="primary" icon={<Plus />}>New order</Button>}
      >
        Orders appear here once a partner places one, or widen the date range.
      </Empty>
      <div className="mds-card" style={{ padding: 12 }}>
        <div className="mds-label">Credit notes</div>
        <Empty compact title="None for this partner" action={<Button size="sm">Add</Button>} />
      </div>
    </div>
  );
}
