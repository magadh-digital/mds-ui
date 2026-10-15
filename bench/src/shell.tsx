// The app frame from the package with NO router library: the kit's default router (history API) drives the rail,
// the tabs and the ⌘K palette.
import { createRoot } from "react-dom/client";
import { BarChart3, Package, Settings, ShoppingCart, Users } from "lucide-react";
import "@mds/ui/styles.css";
import { AppShell, AppearanceProvider, CommandPalette, PaletteButton, useKitRouter, useRailLayout, type GatedItem } from "@mds/ui";

const PRIMARY: Array<GatedItem> = [
  { to: "/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/partners", icon: Users, label: "Partners" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
];
const UTILITY: Array<GatedItem> = [{ to: "/settings", icon: Settings, label: "Settings" }];

function Frame() {
  const { pathname } = useKitRouter();
  const L = useRailLayout("bench", PRIMARY, UTILITY, (items) => items);
  return (
    <AppShell
      rail={L.rail}
      utility={L.utility}
      {...L.shellProps}
      tabs={[{ label: "Orders", icon: Package, to: "/orders" }, { label: "Reports", icon: BarChart3, to: "/reports" }]}
      contexts={[{ id: "main", label: "Main yard", tone: "ok" }]}
      activeContext="main"
      onContext={() => {}}
      title="Shell bench"
      user={{ initials: "SK", name: "Satyam" }}
      search={<PaletteButton />}
    >
      <div className="main" style={{ padding: 24 }}>
        <output data-testid="path">{pathname}</output>
      </div>
      {L.menu}
      <CommandPalette pages={L.pages} />
    </AppShell>
  );
}

createRoot(document.getElementById("root")!).render(
  <AppearanceProvider>
    <Frame />
  </AppearanceProvider>,
);
