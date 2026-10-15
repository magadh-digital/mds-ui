/**
 * The app frame: the icon rail on the left, the top bar (context switch, module tabs, title, ⌘K trigger, appearance,
 * avatar), an optional banner, and the page. Links go through `useKitRouter()` (core/router.tsx), so the kit imports
 * no router; the active rail icon and tab are worked out here from the router's pathname.
 */
import {
  AppWindow,
  BookOpen,
  Check,
  ChevronDown,
  Maximize2,
  Monitor,
  Moon,
  PanelRight,
  Sun,
  SunMoon,
  type LucideIcon,
} from "lucide-react";
import { type MouseEvent, type ReactNode } from "react";
import { isActivePath, useKitRouter } from "../core/router";
import { useDragSort } from "../data/dragsort";
import { Dot } from "../display/dot";
import { useTermTip, useTerms } from "../display/term";
import { useCommands, type Command } from "../overlay/palette";
import { Pop } from "../overlay/pop";
import { Tip } from "../overlay/tip";
import {
  DENSITIES,
  DETAIL_VIEWS,
  PANEL_WIDTHS,
  THEMES,
  useAppearance,
} from "./appearance";

export type RailItem = {
  to: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
  /** lit even though the URL is elsewhere: a page reached through this entry's tab strip */
  active?: boolean;
};
export type RailGroup = "rail" | "utility";
/** where a right-click landed; the same shape the row menu takes */
export type RailAnchor = {
  clientX: number;
  clientY: number;
  preventDefault?: () => void;
};
export type AppTab = {
  label: string;
  icon: LucideIcon;
  to?: string;
  href?: string;
  active?: boolean;
};
export type ContextOption = {
  id: string;
  label: string;
  tone: "ok" | "warn" | "neutral";
};

function RailLink({
  item,
  dnd,
  onMenu,
}: {
  item: RailItem;
  dnd?: Record<string, unknown> & { className?: string };
  onMenu?: (item: RailItem, at: RailAnchor) => void;
}) {
  const { Link, pathname } = useKitRouter();
  const termTip = useTermTip();
  const Icon = item.icon;
  const { className, ...rest } = dnd ?? {};
  const lit = item.active || isActivePath(pathname, item.to, item.exact);
  return (
    <Tip label={termTip(item.label)} placement="right">
      <Link
        to={item.to}
        className={`rail-item${lit ? " active" : ""}${className ?? ""}`}
        activeOptions={{ exact: item.exact }}
        aria-current={lit ? "page" : undefined}
        aria-label={item.label}
        onContextMenu={onMenu ? (e: MouseEvent) => onMenu(item, e) : undefined}
        {...rest}
      >
        <Icon />
      </Link>
    </Tip>
  );
}

/** one rail group; its items drag into a new order when `onOrder` is given (data/pages.tsx keeps the order) */
function RailGroupList({
  items,
  group,
  onOrder,
  onMenu,
}: {
  items: Array<RailItem>;
  group: RailGroup;
  onOrder?: (group: RailGroup, order: Array<string>) => void;
  onMenu?: (item: RailItem, at: RailAnchor) => void;
}) {
  const drag = useDragSort(
    items.map((i) => i.to),
    (next) => onOrder?.(group, next),
    group,
  );
  return (
    <>
      {items.map((i) => (
        <RailLink
          key={i.to}
          item={i}
          dnd={onOrder ? drag.props(i.to) : undefined}
          onMenu={onMenu}
        />
      ))}
    </>
  );
}

/** the appearance settings as ⌘K commands (a `settings` scope: listed only while typing) */
function useAppearanceCommands() {
  const appearance = useAppearance();
  const cmds: Array<Command> = [
    ...THEMES.map((t) => ({
      id: `theme:${t.value}`,
      label: `Theme: ${t.label}`,
      hint: appearance.theme === t.value ? "current" : undefined,
      keywords: "dark light system appearance",
      group: "Appearance",
      icon: SunMoon,
      run: () => appearance.setTheme(t.value),
    })),
    ...DENSITIES.map((d) => ({
      id: `density:${d.value}`,
      label: `Density: ${d.label}`,
      hint: appearance.density === d.value ? "current" : d.hint,
      keywords: "density size compact comfortable large",
      group: "Appearance",
      icon: SunMoon,
      run: () => appearance.setDensity(d.value),
    })),
    ...PANEL_WIDTHS.map((w) => ({
      id: `panel:${w.value}`,
      label: `Detail panel: ${w.label}`,
      hint: appearance.panelWidth === w.value ? "current" : w.hint,
      keywords: "panel width slide-over detail narrow wide wider",
      group: "Appearance",
      icon: SunMoon,
      run: () => appearance.setPanelWidth(w.value),
    })),
    ...DETAIL_VIEWS.map((v) => ({
      id: `detail:${v.value}`,
      label: `Detail view: ${v.label}`,
      hint: appearance.detailView === v.value ? "current" : v.hint,
      keywords: "popup modal side panel detail view open record",
      group: "Appearance",
      icon: SunMoon,
      run: () => appearance.setDetailView(v.value),
    })),
  ];
  useCommands("appearance", cmds, { settings: true });
}

/** Theme, density, detail panel width, detail view and old names; also puts these settings in ⌘K. */
export function AppearancePopover() {
  useAppearanceCommands();
  const {
    density,
    theme,
    panelWidth,
    detailView,
    setDensity,
    setTheme,
    setPanelWidth,
    setDetailView,
  } = useAppearance();
  const { oldNames, setOldNames } = useTerms();
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  return (
    <Pop
      trigger={
        <button className="ui-iconbtn" aria-label="Appearance">
          <SunMoon />
        </button>
      }
    >
      <div className="group-title">Theme</div>
      {THEMES.map((t) => (
        <button
          key={t.value}
          className={`item ${theme === t.value ? "active" : ""}`}
          onClick={() => setTheme(t.value)}
        >
          {t.value === "dark" ? (
            <Moon />
          ) : t.value === "light" ? (
            <Sun />
          ) : (
            <Monitor />
          )}
          <span style={{ flex: 1 }}>{t.label}</span>
          {theme === t.value && <Check />}
        </button>
      ))}
      <div className="group-title" style={{ marginTop: "var(--sp-2)" }}>
        Density
      </div>
      {DENSITIES.map((d) => (
        <button
          key={d.value}
          className={`item ${density === d.value ? "active" : ""}`}
          onClick={() => setDensity(d.value)}
        >
          <span style={{ flex: 1 }}>
            {d.label}
            <span
              className="ui-muted"
              style={{ marginLeft: 8, fontSize: "var(--fs-xs)" }}
            >
              {d.hint}
            </span>
          </span>
          {density === d.value && <Check />}
        </button>
      ))}
      <div className="group-title" style={{ marginTop: "var(--sp-2)" }}>
        Detail panel
      </div>
      {PANEL_WIDTHS.map((w) => (
        <button
          key={w.value}
          className={`item ${panelWidth === w.value ? "active" : ""}`}
          onClick={() => setPanelWidth(w.value)}
          title="How wide the right detail panel opens"
        >
          <PanelRight />
          <span style={{ flex: 1 }}>
            {w.label}
            <span
              className="ui-muted"
              style={{ marginLeft: 8, fontSize: "var(--fs-xs)" }}
            >
              {w.hint}
            </span>
          </span>
          {panelWidth === w.value && <Check />}
        </button>
      ))}
      <div className="group-title" style={{ marginTop: "var(--sp-2)" }}>
        Detail view
      </div>
      {DETAIL_VIEWS.map((v) => (
        <button
          key={v.value}
          className={`item ${detailView === v.value ? "active" : ""}`}
          onClick={() => setDetailView(v.value)}
          title="Where a record opens: the right panel, a popup over the page, or the whole page"
        >
          {v.value === "popup" ? (
            <AppWindow />
          ) : v.value === "full" ? (
            <Maximize2 />
          ) : (
            <PanelRight />
          )}
          <span style={{ flex: 1 }}>
            {v.label}
            <span
              className="ui-muted"
              style={{ marginLeft: 8, fontSize: "var(--fs-xs)" }}
            >
              {v.hint}
            </span>
          </span>
          {detailView === v.value && <Check />}
        </button>
      ))}
      <div className="group-title" style={{ marginTop: "var(--sp-2)" }}>
        Names
      </div>
      <button
        className={`item ${oldNames ? "active" : ""}`}
        onClick={() => setOldNames(!oldNames)}
      >
        <BookOpen />
        <span style={{ flex: 1 }}>
          Old names beside labels
          <span
            className="ui-muted"
            style={{ marginLeft: 8, fontSize: "var(--fs-xs)" }}
          >
            hover any label for its meaning
          </span>
        </span>
        {oldNames && <Check />}
      </button>
      <div
        className="ui-muted"
        style={{
          fontSize: "var(--fs-xs)",
          padding: "6px 8px 2px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <ThemeIcon style={{ width: 12, height: 12 }} /> Saved in this browser
      </div>
    </Pop>
  );
}

export function AppShell({
  rail,
  utility,
  tabs,
  tabTrail,
  contexts,
  activeContext,
  onContext,
  contextTitle = "Context",
  title,
  user,
  children,
  banner,
  search,
  searchSide,
  onRailOrder,
  onRailMenu,
  railFoot,
  homeTo,
  homeTitle,
}: {
  rail: Array<RailItem>;
  utility: Array<RailItem>;
  /** given, the rail icons can be dragged into a new order within their group; called with that group's `to`s */
  onRailOrder?: (group: RailGroup, order: Array<string>) => void;
  /** right-click on a rail icon (hide, move) */
  onRailMenu?: (item: RailItem, at: RailAnchor) => void;
  /** under the utility group: the `Customize pages` trigger */
  railFoot?: ReactNode;
  tabs: Array<AppTab>;
  /** rendered after the module tabs (e.g. a quick-open button) */
  tabTrail?: ReactNode;
  contexts: Array<ContextOption>;
  activeContext: string;
  onContext: (id: string) => void;
  /** the heading over the context list (the console says "Fabric") */
  contextTitle?: string;
  title: string;
  /** `menu`: items under the avatar (e.g. Sign out) */
  user: { initials: string; name: string; badge?: number; menu?: ReactNode };
  children: ReactNode;
  /** a full-width strip between the top bar and the content, e.g. the read-only notice */
  banner?: ReactNode;
  /** the ⌘K trigger (`PaletteButton`), left of the appearance popover */
  search?: ReactNode;
  /** beside the search bar */
  searchSide?: ReactNode;
  /** given, the M logo links here (a module's page list) */
  homeTo?: string;
  homeTitle?: string;
}) {
  const { Link, pathname } = useKitRouter();
  const ctx = contexts.find((c) => c.id === activeContext) ?? contexts[0];
  return (
    <div className="shell">
      <nav className="rail" aria-label="Sections">
        {homeTo ? (
          <Link
            to={homeTo}
            className="brand"
            title={homeTitle}
            aria-label={homeTitle ?? "Home"}
          >
            M
          </Link>
        ) : (
          <div className="brand">M</div>
        )}
        <RailGroupList
          items={rail}
          group="rail"
          onOrder={onRailOrder}
          onMenu={onRailMenu}
        />
        <div className="spacer" />
        <div className="divider" />
        <RailGroupList
          items={utility}
          group="utility"
          onOrder={onRailOrder}
          onMenu={onRailMenu}
        />
        {railFoot}
      </nav>
      <header className="topbar">
        {ctx && (
          <Pop
            placement="bottom-start"
            trigger={
              <button className="ctx" aria-label="Switch context">
                <Dot tone={ctx.tone} />
                <span style={{ flex: 1, textAlign: "left" }}>{ctx.label}</span>
                <ChevronDown
                  style={{ width: 14, height: 14, color: "var(--c-muted)" }}
                />
              </button>
            }
          >
            <div className="group-title">{contextTitle}</div>
            {contexts.map((c) => (
              <button
                key={c.id}
                className={`item ${c.id === ctx.id ? "active" : ""}`}
                onClick={() => onContext(c.id)}
              >
                <Dot tone={c.tone} />
                <span style={{ flex: 1 }}>{c.label}</span>
                {c.id === ctx.id && <Check />}
              </button>
            ))}
          </Pop>
        )}
        <div className="tabs">
          {tabs.map((t) => {
            const Icon = t.icon;
            const to = t.to ?? "/";
            const lit = t.active || (!t.href && isActivePath(pathname, to));
            const cls = `tab ${lit ? "active" : ""}`;
            return t.href ? (
              <a key={t.label} className={cls} href={t.href} title={t.label}>
                <Icon /> <span className="tab-label">{t.label}</span>
              </a>
            ) : (
              <Link
                key={t.label}
                to={to}
                className={cls}
                title={t.label}
                aria-current={lit ? "page" : undefined}
              >
                <Icon /> <span className="tab-label">{t.label}</span>
              </Link>
            );
          })}
          {tabTrail}
        </div>
        <div className="title">{title}</div>
        <div className="right">
          {searchSide}
          {search}
          <AppearancePopover />
          <Pop
            trigger={
              <button className="avatar" aria-label={user.name}>
                {user.initials}
                {user.badge ? (
                  <span className="badge">{user.badge}</span>
                ) : null}
              </button>
            }
          >
            <div className="group-title">{user.name}</div>
            {user.menu}
          </Pop>
        </div>
      </header>
      {banner ? <div className="banner">{banner}</div> : null}
      <div className="content">{children}</div>
    </div>
  );
}
