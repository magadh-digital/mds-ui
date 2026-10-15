// demo: Seg switches the view
import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { Seg } from "@mds/ui";

type View = "list" | "board";

export default function SegDemo() {
  const [view, setView] = useState<View>("list");
  return (
    <div className="mds-vstack" style={{ gap: 8, alignItems: "flex-start" }}>
      <Seg
        label="View"
        value={view}
        onChange={setView}
        options={[
          { value: "list", label: <><List aria-hidden size={14} /> List</> },
          { value: "board", label: <><LayoutGrid aria-hidden size={14} /> Board</> },
        ]}
      />
      <span className="mds-muted">{view === "list" ? "Orders as a table" : "Orders as cards by status"}</span>
    </div>
  );
}
