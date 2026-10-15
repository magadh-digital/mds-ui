import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { storageKey } from "../core/storage.js";
import { useClientLayoutEffect } from "../data/saved.js";

export type Density = "compact" | "comfortable" | "large";
export type Theme = "light" | "dark" | "system";
/** how wide the right detail panel opens; the px are for the compact density and scale with the layout */
export type PanelWidth = "narrow" | "default" | "wide" | "wider";
export const PANEL_WIDTHS: Array<{
  value: PanelWidth;
  label: string;
  hint: string;
  px: number;
}> = [
  { value: "narrow", label: "Narrow", hint: "560 px", px: 560 },
  { value: "default", label: "Default", hint: "680 px", px: 680 },
  { value: "wide", label: "Wide", hint: "800 px", px: 800 },
  { value: "wider", label: "Wider", hint: "960 px", px: 960 },
];
/** where a record opens: the right slide-over, a popup centred over the page, or the whole page */
export type DetailView = "panel" | "popup" | "full";
export const DETAIL_VIEWS: Array<{
  value: DetailView;
  label: string;
  hint: string;
}> = [
  { value: "panel", label: "Side panel", hint: "slides in at the right" },
  { value: "popup", label: "Popup", hint: "centred over the page" },
  {
    value: "full",
    label: "Full page",
    hint: "fills the page; the list waits behind",
  },
];
export const DENSITIES: Array<{ value: Density; label: string; hint: string }> =
  [
    { value: "compact", label: "Compact", hint: "13 px · 40 px rows" },
    { value: "comfortable", label: "Comfortable", hint: "15 px · 52 px rows (MUI standard)" },
    { value: "large", label: "Large", hint: "17 px · 67 px rows (MUI comfortable) · touch" },
  ];
export const THEMES: Array<{ value: Theme; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];
const DENSITY_KEY = () => storageKey("density");
const THEME_KEY = () => storageKey("theme");
const PANEL_KEY = () => storageKey("panel");
const DETAIL_KEY = () => storageKey("detail");
const DETAIL_LAST_KEY = () => storageKey("detail.windowed");

function read<T extends string>(
  key: string,
  allowed: ReadonlyArray<T>,
  fallback: T,
): T {
  try {
    const v = localStorage.getItem(key);
    return allowed.includes(v as T) ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}
const defaultDensity = (): Density =>
  typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches
    ? "large"
    : "compact";
const systemDark = () =>
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-color-scheme: dark)").matches;

/** Sets the appearance attributes on <html>. An app can run the same logic in an inline script before first paint. */
export function applyAppearance(
  density: Density,
  theme: Theme,
  panelWidth: PanelWidth = "default",
  detailView: DetailView = "panel",
) {
  const root = document.documentElement;
  root.setAttribute("data-density", density);
  root.setAttribute("data-panel", panelWidth);
  root.setAttribute("data-detail", detailView);
  root.classList.toggle(
    "dark",
    theme === "dark" || (theme === "system" && systemDark()),
  );
}

type Ctx = {
  density: Density;
  theme: Theme;
  panelWidth: PanelWidth;
  detailView: DetailView;
  resolvedTheme: "light" | "dark";
  setDensity: (d: Density) => void;
  setTheme: (t: Theme) => void;
  setPanelWidth: (w: PanelWidth) => void;
  setDetailView: (v: DetailView) => void;
  /** the side panel or popup to come back to from full page: the last of the two the person picked */
  windowedView: "panel" | "popup";
};
const AppearanceContext = createContext<Ctx | null>(null);

/**
 * Theme, density, panel width and detail view for the reader, remembered in this browser. The first render (on the
 * server too) uses the defaults; the saved choices are read right after mount, before the first paint.
 */
export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [density, setDensityState] = useState<Density>("compact");
  const [theme, setThemeState] = useState<Theme>("system");
  const [panelWidth, setPanelWidthState] = useState<PanelWidth>("default");
  const [detailView, setDetailViewState] = useState<DetailView>("panel");
  // full page is its own state: leaving it goes back to the last side panel / popup choice
  const [windowedView, setWindowedView] = useState<"panel" | "popup">("panel");
  const [sysDark, setSysDark] = useState(false);
  const [ready, setReady] = useState(false);

  useClientLayoutEffect(() => {
    setDensityState(read<Density>(DENSITY_KEY(), ["compact", "comfortable", "large"], defaultDensity()));
    setThemeState(read<Theme>(THEME_KEY(), ["light", "dark", "system"], "system"));
    setPanelWidthState(read<PanelWidth>(PANEL_KEY(), ["narrow", "default", "wide", "wider"], "default"));
    const cur = read<DetailView>(DETAIL_KEY(), ["panel", "popup", "full"], "panel");
    setDetailViewState(cur);
    setWindowedView(cur === "full" ? read<"panel" | "popup">(DETAIL_LAST_KEY(), ["panel", "popup"], "panel") : cur);
    setSysDark(systemDark());
    setReady(true);
  }, []);
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const fn = (e: MediaQueryListEvent) => setSysDark(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  useClientLayoutEffect(() => {
    // not before the saved choices are in: the page's own early script may already have applied them
    if (ready) applyAppearance(density, theme, panelWidth, detailView);
  }, [ready, density, theme, panelWidth, detailView, sysDark]);

  const setDensity = useCallback((d: Density) => {
    setDensityState(d);
    try {
      localStorage.setItem(DENSITY_KEY(), d);
    } catch {}
  }, []);
  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(THEME_KEY(), t);
    } catch {}
  }, []);
  const setPanelWidth = useCallback((w: PanelWidth) => {
    setPanelWidthState(w);
    try {
      localStorage.setItem(PANEL_KEY(), w);
    } catch {}
  }, []);
  const setDetailView = useCallback((v: DetailView) => {
    setDetailViewState(v);
    if (v !== "full") setWindowedView(v);
    try {
      localStorage.setItem(DETAIL_KEY(), v);
      if (v !== "full") localStorage.setItem(DETAIL_LAST_KEY(), v);
    } catch {}
  }, []);
  const value = useMemo<Ctx>(
    () => ({
      density,
      theme,
      panelWidth,
      detailView,
      windowedView,
      resolvedTheme: theme === "system" ? (sysDark ? "dark" : "light") : theme,
      setDensity,
      setTheme,
      setPanelWidth,
      setDetailView,
    }),
    [
      density,
      theme,
      panelWidth,
      detailView,
      sysDark,
      setDensity,
      setTheme,
      setPanelWidth,
      setDetailView,
      windowedView,
    ],
  );
  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const c = useContext(AppearanceContext);
  if (!c)
    throw new Error("useAppearance must be used inside AppearanceProvider (UIProvider includes it)");
  return c;
}

/** the appearance when an AppearanceProvider is mounted, else null (components that can do without it) */
export function useAppearanceOptional() {
  return useContext(AppearanceContext);
}
