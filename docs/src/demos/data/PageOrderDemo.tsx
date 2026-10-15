// demo: a module's saved page order and hidden pages, arranged with the Customize pages popover
import { BarChart3, Package, Settings, SlidersHorizontal, Truck, Users } from "lucide-react";
import { Button, LinkButton, PagesPop, usePageLayout } from "@mds/ui";

const PAGES = [
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/dispatch", label: "Dispatch", icon: Truck },
  { to: "/partners", label: "Partners", icon: Users },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];
const MORE = [{ to: "/settings", label: "Settings", icon: Settings }];

export default function SalesPages() {
  const pl = usePageLayout("docs-sales"); // saved as <prefix>.docs-sales.pages
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
      <nav style={{ display: "grid", gap: 4, minWidth: 180 }} aria-label="Sales pages">
        {[...pl.arrange(PAGES), null, ...pl.arrange(MORE)].map((p, i) =>
          p ? (
            <span key={p.to} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <p.icon size={16} /> {p.label}
            </span>
          ) : (
            <hr key={`sep${i}`} style={{ width: "100%", border: 0, borderTop: "1px solid var(--mds-c-border)" }} />
          ),
        )}
      </nav>
      <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
        <PagesPop
          groups={[
            { title: "Pages", items: PAGES },
            { title: "More", items: MORE },
          ]}
          layout={pl.layout}
          onOrder={pl.setOrder}
          onHidden={pl.setHidden}
          onReset={pl.reset}
          trigger={<Button icon={<SlidersHorizontal />}>Customize pages</Button>}
        />
        {pl.customized ? (
          <LinkButton onClick={pl.reset}>Back to the app's own order</LinkButton>
        ) : (
          <span className="mds-muted">The app's own order.</span>
        )}
      </div>
    </div>
  );
}
