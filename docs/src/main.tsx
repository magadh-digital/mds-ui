// The docs site: the kit's own AppShell, rail, sidebar and ⌘K palette around one page at a time.
import { createRoot } from "react-dom/client";
import { useEffect } from "react";
import { Github } from "lucide-react";
import "@mds/ui/styles.css";
import "@mds/ui/reset.css";
import "./docs.css";
import { AppShell, CommandPalette, PaletteButton, Sidebar, SidebarLink, UIProvider, useKitRouter } from "@mds/ui";
import { PAGES, SECTIONS, pageAt, sectionOf } from "./registry";

function Site() {
  const { pathname, navigate } = useKitRouter();
  const page = pageAt(pathname);
  const section = sectionOf(pathname);
  const Body = page.render;
  useEffect(() => {
    document.title = page.path === "/" ? "@mds/ui docs" : `${page.title} · @mds/ui`;
    window.scrollTo(0, 0);
  }, [page]);
  const first = (id: string) => PAGES.find((p) => p.section === id)?.path ?? "/";
  return (
    <AppShell
      brand="M"
      rail={SECTIONS.filter((s) => PAGES.some((p) => p.section === s.id)).map((s) => ({ to: first(s.id), icon: s.icon, label: s.label, active: s.id === section.id || undefined }))}
      utility={[]}
      tabs={[
        { label: "Docs", icon: SECTIONS[0]!.icon, to: "/", active: true },
        { label: "GitHub", icon: Github, href: "https://github.com/magadh-digital/mds-ui" },
      ]}
      contexts={[]}
      activeContext=""
      onContext={() => {}}
      title={page.title}
      user={{ initials: "UI", name: "@mds/ui" }}
      search={<PaletteButton />}
    >
      <div className="doc-layout">
        <Sidebar collapsed={false}>
          <div className="doc-nav">
            <div className="doc-nav-title">{section.label}</div>
            {PAGES.filter((p) => p.section === section.id).map((p) => (
              <SidebarLink key={p.path} active={p.path === page.path} onClick={() => navigate(p.path)}>
                {p.title}
              </SidebarLink>
            ))}
          </div>
        </Sidebar>
        <main className="doc-main">
          <Body />
        </main>
      </div>
      <CommandPalette pages={PAGES.map((p) => ({ to: p.path, label: p.title, keywords: `${p.section} ${p.keywords ?? ""}` }))} />
    </AppShell>
  );
}

createRoot(document.getElementById("root")!).render(
  <UIProvider storagePrefix="mds-ui-docs">
    <Site />
  </UIProvider>,
);
