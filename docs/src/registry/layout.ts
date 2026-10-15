// The Layout section: the app-wide provider, slide-over panels, the app shell, appearance and the placeholder.
import type { DocPage } from "../registry";
import { AppShellPage, AppearancePage, PlaceholderPage, SlideOverPage, UIProviderPage } from "../pages/layout";

export const pages: Array<DocPage> = [
  { path: "/components/ui-provider", title: "UIProvider", section: "layout", render: UIProviderPage, keywords: "provider setup toaster glossary router locale storage" },
  { path: "/components/slide-over", title: "SlideOver and panels", section: "layout", render: SlideOverPage, keywords: "panel detail drawer side panel KeyValue StatTiles FoldSection FlowStrip PanelHead PanelFoot stack" },
  { path: "/components/app-shell", title: "AppShell", section: "layout", render: AppShellPage, keywords: "frame rail top bar tabs useRailLayout brand context" },
  { path: "/components/appearance", title: "Appearance", section: "layout", render: AppearancePage, keywords: "theme dark mode density panel width detail view useAppearance AppearanceProvider" },
  { path: "/components/placeholder", title: "Placeholder", section: "layout", render: PlaceholderPage, keywords: "coming soon not available" },
];
