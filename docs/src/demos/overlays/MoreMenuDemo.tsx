// demo: MoreMenu: a toolbar's secondary actions behind one button, the primary action beside it
import { Button, MoreMenu, toast } from "@mds/ui";
import { FileDown, Plus, Printer, Trash2, Upload } from "lucide-react";

export default function MoreMenuDemo() {
  return (
    <div className="mds-hstack" style={{ gap: 8 }}>
      <MoreMenu
        title="Invoices"
        items={[
          { key: "import", label: "Import from Tally", icon: Upload, onSelect: () => toast.info("Choose a file") },
          { key: "export", label: "Export to Excel", icon: FileDown, onSelect: () => toast.ok("Export started") },
          { key: "print", label: "Print register", icon: Printer, kbd: "⌘P", onSelect: () => toast.info("Printing") },
          {
            key: "purge",
            label: "Delete drafts",
            icon: Trash2,
            danger: true,
            sep: true,
            confirm: { title: "Delete all 6 draft invoices?", danger: true, typed: "DELETE", confirmLabel: "Delete drafts" },
            onSelect: () => toast.ok("Drafts deleted"),
          },
        ]}
      />
      <Button variant="primary" icon={<Plus />}>New invoice</Button>
    </div>
  );
}
