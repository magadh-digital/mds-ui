// Every page of the site, grouped for the sidebar. The component and helper pages come from registry/<section>.ts
// (one file per section); the setup pages are listed here.
import type { ComponentType } from "react";
import { Rules } from "./pages/rules";
import { GettingStarted, LocaleStorage, Providers, Theming } from "./pages/start";

export type DocPage = { path: string; title: string; section: string; render: ComponentType; keywords?: string };
export type Group = { id: string; label: string };

export const GROUPS: Array<Group> = [
  { id: "start", label: "Getting started" },
  { id: "inputs", label: "Inputs" },
  { id: "overlays", label: "Overlays" },
  { id: "display", label: "Display" },
  { id: "data", label: "Data" },
  { id: "layout", label: "Layout" },
  { id: "helpers", label: "Helpers" },
];

const START: Array<DocPage> = [
  { path: "/", title: "Introduction", section: "start", render: GettingStarted, keywords: "install setup quick start" },
  { path: "/providers", title: "Providers and router", section: "start", render: Providers, keywords: "UIProvider router tanstack" },
  { path: "/theming", title: "Theming", section: "start", render: Theming, keywords: "css variables dark mode layer" },
  { path: "/locale", title: "Locale and saved choices", section: "start", render: LocaleStorage, keywords: "currency storage" },
  { path: "/rules", title: "UI rules", section: "start", render: Rules, keywords: "agents guidelines toolbar search loading" },
];

const sections = import.meta.glob<{ pages: Array<DocPage> }>("./registry/*.ts", { eager: true });
const rest = Object.values(sections).flatMap((m) => m.pages ?? []);

export const PAGES: Array<DocPage> = [
  ...START,
  ...GROUPS.slice(1).flatMap((g) => rest.filter((p) => p.section === g.id)),
];
export const pageAt = (path: string) => PAGES.find((p) => p.path === path.replace(/\/+$/, "") || (path === "/" && p.path === "/"));
