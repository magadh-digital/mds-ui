// demo: CommandPalette mounted once, with page actions from useCommands
import { useState } from "react";
import { Button, CommandPalette, palette, PaletteButton, toast, useCommands } from "@mds/ui";
import { Bell, FileDown, Layers, MessageSquare, Plus, RotateCcw } from "lucide-react";

// the app's pages (here, pages of this site, so picking one really navigates)
const PAGES = [
  { to: "/components/dialog", label: "Dialog", icon: Layers, keywords: "modal" },
  { to: "/components/toast", label: "Toasts", icon: Bell, keywords: "notification" },
  { to: "/components/confirm-pop", label: "ConfirmPop", icon: MessageSquare, keywords: "delete" },
];

export default function PaletteDemo() {
  const [range, setRange] = useState("This month");
  // this page's actions: listed under "Invoices" while the component is mounted
  useCommands("invoices", [
    { id: "new", label: "New invoice", group: "Invoices", icon: Plus, run: () => toast.info("New invoice") },
    { id: "export", label: "Export to Excel", group: "Invoices", icon: FileDown, keywords: "download xlsx", run: () => toast.ok("Export started") },
    { id: "reset", label: "Reset filters", hint: range, group: "Invoices", icon: RotateCcw, run: () => setRange("This month") },
  ]);
  return (
    <div className="mds-hstack" style={{ gap: 8, flexWrap: "wrap" }}>
      <PaletteButton />
      <Button onClick={() => palette.open(">")}>Page actions</Button>
      <Button onClick={() => palette.open("?")}>Shortcuts</Button>
      <Button onClick={() => setRange("Last quarter")}>Filter: last quarter</Button>
      <span className="mds-muted">Range: {range}</span>
      {/* once, in the app's root layout */}
      <CommandPalette pages={PAGES} />
    </div>
  );
}
