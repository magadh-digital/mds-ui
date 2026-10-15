// demo: Button variants, sizes and icons
import { Download, Plus, Trash2 } from "lucide-react";
import { Button } from "@mds/ui";

export default function ButtonVariants() {
  return (
    <div className="mds-vstack" style={{ gap: 12 }}>
      <div className="mds-hstack">
        <Button variant="primary" icon={<Plus />}>New order</Button>
        <Button icon={<Download />}>Export</Button>
        <Button variant="danger" icon={<Trash2 />}>Delete draft</Button>
        <Button disabled title="Only draft orders can be sent">Send to partner</Button>
      </div>
      <div className="mds-hstack">
        <Button size="sm" variant="primary">Approve</Button>
        <Button size="sm">Hold</Button>
        <Button size="sm" variant="danger">Reject</Button>
      </div>
    </div>
  );
}
