// demo: IconButton and LinkButton
import { useState } from "react";
import { Pencil, Pin, RefreshCw, Trash2 } from "lucide-react";
import { IconButton, LinkButton, toast } from "@mds/ui";

export default function IconAndLink() {
  const [pinned, setPinned] = useState(false);
  return (
    <div className="mds-vstack" style={{ gap: 12 }}>
      <div className="mds-hstack">
        <IconButton label="Refresh"><RefreshCw /></IconButton>
        <IconButton label="Edit warehouse"><Pencil /></IconButton>
        <IconButton label={pinned ? "Unpin order" : "Pin order"} active={pinned} onClick={() => setPinned(!pinned)}>
          <Pin />
        </IconButton>
        <IconButton label="Remove line" danger size="sm"><Trash2 /></IconButton>
      </div>
      <p className="mds-muted" style={{ margin: 0 }}>
        3 lines have no rate. <LinkButton onClick={() => toast.info("Opening the rate card")}>Set rates</LinkButton>
      </p>
    </div>
  );
}
