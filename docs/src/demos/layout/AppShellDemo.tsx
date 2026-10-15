// demo: the app frame with a rail the reader can arrange, module tabs, a context switch, a banner and the ⌘K button
import { useMemo, useState } from "react";
import { BarChart3, Landmark, Package, Settings, ShoppingCart, Truck, Users, Wallet, Warehouse } from "lucide-react";
import {
  AppShell,
  PaletteButton,
  Placeholder,
  RouterProvider,
  Toolbar,
  useKitRouter,
  useRailLayout,
  type GatedItem,
  type KitLinkProps,
  type KitRouter,
} from "@mds/ui";

const PRIMARY: Array<GatedItem> = [
  { to: "/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/dispatch", icon: Truck, label: "Dispatch", permission: "dispatch.view" },
  { to: "/partners", icon: Users, label: "Partners" },
  { to: "/reports", icon: BarChart3, label: "Reports", permission: "reports.view" },
  { to: "/payroll", icon: Wallet, label: "Payroll", permission: "payroll.view" }, // not allowed: left out
];
const UTILITY: Array<GatedItem> = [{ to: "/settings", icon: Settings, label: "Settings" }];
// the signed-in person's permissions; the kit never reads them, only the gate below does
const MINE = new Set(["dispatch.view", "reports.view"]);

function Frame() {
  const { pathname } = useKitRouter();
  const [yard, setYard] = useState("patna");
  const L = useRailLayout("docs-shell", PRIMARY, UTILITY, (items) => items.filter((i) => !i.permission || MINE.has(i.permission)));
  const page = [...PRIMARY, ...UTILITY].find((p) => pathname.startsWith(p.to));

  return (
    <AppShell
      // the shell fills the window (100vh) by default; in this preview box it fills the box
      style={{ height: "100%" }}
      brand={<Warehouse size={18} />}
      title={page?.label ?? "Sales"}
      rail={L.rail}
      utility={L.utility}
      {...L.shellProps}
      tabs={[
        { label: "Sales", icon: Package, to: "/orders", active: !pathname.startsWith("/accounts") },
        { label: "Accounts", icon: Landmark, to: "/accounts" },
      ]}
      contexts={[
        { id: "patna", label: "Patna yard", tone: "ok" },
        { id: "gaya", label: "Gaya yard", tone: "warn" },
      ]}
      contextTitle="Yard"
      activeContext={yard}
      onContext={setYard}
      user={{ initials: "RK", name: "Ravi Kumar", menu: <button type="button" className="item">Sign out</button> }}
      banner={yard === "gaya" ? "Gaya yard is read-only today: stock count in progress." : undefined}
      search={<PaletteButton />}
    >
      {pathname.startsWith("/orders") ? (
        <div className="mds-main">
          <Toolbar title="Orders" count={1284} onRefresh={() => {}} />
          <p style={{ padding: 16, margin: 0 }}>
            Drag a rail icon to move it, right-click it to hide it, or use the slider icon at the rail's foot.
          </p>
        </div>
      ) : (
        <Placeholder title={page?.label ?? "Accounts"} />
      )}
      {L.menu}
    </AppShell>
  );
}

export default function ShellPreview() {
  // a router kept in memory, so the preview never changes this page's URL; an app passes its own router
  const [pathname, setPathname] = useState("/orders");
  const [Link] = useState(
    () =>
      function MemoryLink({ to, activeOptions: _exact, onClick, ...rest }: KitLinkProps) {
        return (
          <a
            href={to}
            onClick={(e) => {
              onClick?.(e);
              if (e.defaultPrevented) return;
              e.preventDefault();
              setPathname(to);
            }}
            {...rest}
          />
        );
      },
  );
  const router = useMemo<KitRouter>(() => ({ pathname, navigate: setPathname, Link }), [pathname, Link]);

  return (
    <div style={{ height: 460, border: "1px solid var(--mds-c-border)", borderRadius: 6, overflow: "hidden" }}>
      <RouterProvider value={router}>
        <Frame />
      </RouterProvider>
    </div>
  );
}
