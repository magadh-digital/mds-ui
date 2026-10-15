// Every page of the site: its path, title, section (the rail) and what it renders.
import type { ComponentType } from "react";
import { BookOpen, Layers, LayoutPanelLeft, MousePointerClick, Table2, TextCursorInput, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GettingStarted, LocaleStorage, Providers, Theming } from "./pages/start";

export type Section = { id: string; label: string; icon: LucideIcon };
export type DocPage = { path: string; title: string; section: string; render: ComponentType; keywords?: string };

export const SECTIONS: Array<Section> = [
  { id: "start", label: "Start", icon: BookOpen },
  { id: "inputs", label: "Inputs", icon: TextCursorInput },
  { id: "overlays", label: "Overlays", icon: Layers },
  { id: "display", label: "Display", icon: MousePointerClick },
  { id: "data", label: "Data", icon: Table2 },
  { id: "layout", label: "Layout", icon: LayoutPanelLeft },
  { id: "helpers", label: "Helpers", icon: Wrench },
];

export const PAGES: Array<DocPage> = [
  { path: "/", title: "Getting started", section: "start", render: GettingStarted, keywords: "install setup" },
  { path: "/providers", title: "Providers and router", section: "start", render: Providers, keywords: "UIProvider router" },
  { path: "/theming", title: "Theming", section: "start", render: Theming, keywords: "css variables dark mode" },
  { path: "/locale", title: "Locale and saved choices", section: "start", render: LocaleStorage, keywords: "currency storage" },
];

export const pageAt = (path: string) => PAGES.find((p) => p.path === path) ?? PAGES[0]!;
export const sectionOf = (path: string) => SECTIONS.find((s) => s.id === pageAt(path).section) ?? SECTIONS[0]!;
