/**
 * The user's arrangement of one module's rail (pages.tsx): the two gated groups in the saved order without the hidden
 * pages, the shell props that let the icons be dragged and right-clicked, the ⌘K page list (hidden ones still there),
 * and the `Customize pages` popover for the rail's foot. One state, three surfaces. Shared by every module shell.
 *
 * `gate` is the app's permission check: it gets every item (with its opaque `permission`) and returns the ones the
 * person may open. `pathname` defaults to the kit router's (core/router.tsx).
 *
 *   const L = useRailLayout("orders", PRIMARY, UTILITY, (items) => items.filter((i) => can(i.permission)));
 *   <AppShell rail={L.rail} utility={L.utility} {...L.shellProps} …>{page}{L.menu}</AppShell>
 *   <CommandPalette pages={L.pages} />
 */
import { ArrowDown, ArrowUp, Eye, EyeOff, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { useKitRouter } from "../core/router";
import { mergeOrder } from "../data/dragsort";
import { PagesPop, movePage, orderPages, usePageLayout } from "../data/pages";
import { useContextMenu, type MenuItem } from "../overlay/menu";
import { useCommands } from "../overlay/palette";
import type { RailAnchor, RailGroup, RailItem } from "./shell";

/** a rail item with the permission it needs; the kit never reads `permission`, only the app's `gate` does */
export type GatedItem = RailItem & { permission?: string };

export function useRailLayout(
  module: string,
  primary: Array<GatedItem>,
  utility: Array<GatedItem>,
  gate: (items: Array<GatedItem>) => Array<GatedItem>,
  pathname?: string,
) {
  const router = useKitRouter();
  const path = pathname ?? router.pathname;
  const pl = usePageLayout(module);
  const menu = useContextMenu();
  const allRail = gate(primary);
  const allUtility = gate(utility);
  const rail = pl.arrange(allRail);
  const util = pl.arrange(allUtility);
  const groupIds = (g: RailGroup) =>
    orderPages(g === "rail" ? allRail : allUtility, pl.layout.order).map(
      (i) => i.to,
    );
  /** replace one group's sequence inside the saved order (one order across both groups) */
  const setGroupOrder = (g: RailGroup, next: Array<string>) =>
    pl.setOrder(
      g === "rail"
        ? [...next, ...groupIds("utility")]
        : [...groupIds("rail"), ...next],
    );
  const onRailOrder = (g: RailGroup, visibleNext: Array<string>) =>
    setGroupOrder(g, mergeOrder(groupIds(g), visibleNext));
  const onRailMenu = (item: RailItem, at: RailAnchor) => {
    const g: RailGroup = allRail.some((i) => i.to === item.to)
      ? "rail"
      : "utility";
    const visible = (g === "rail" ? rail : util).map((i) => i.to);
    const i = visible.indexOf(item.to);
    const move = (dir: -1 | 1) =>
      onRailOrder(g, movePage(visible, item.to, dir));
    const items: Array<MenuItem> = [
      {
        key: "up",
        label: "Move up",
        icon: ArrowUp,
        disabled: i <= 0,
        onSelect: () => move(-1),
      },
      {
        key: "down",
        label: "Move down",
        icon: ArrowDown,
        disabled: i < 0 || i >= visible.length - 1,
        onSelect: () => move(1),
      },
      {
        key: "hide",
        label: "Hide page",
        icon: EyeOff,
        sep: true,
        disabled: visible.length <= 1,
        title: visible.length <= 1 ? "keep one page" : undefined,
        onSelect: () => pl.setHidden(item.to, true),
      },
    ];
    if (pl.layout.hidden.length)
      items.push({
        key: "show",
        label: `Show hidden pages (${pl.layout.hidden.length})`,
        icon: Eye,
        sep: true,
        onSelect: pl.showAll,
      });
    if (pl.layout.order.length)
      items.push({
        key: "reset",
        label: "Reset order",
        icon: RotateCcw,
        sep: !pl.layout.hidden.length,
        onSelect: () => pl.setOrder([]),
      });
    menu.open(at, items, item.label);
  };
  const railFoot: ReactNode = (
    <PagesPop
      groups={[
        { title: "Pages", items: allRail },
        { title: "More", items: allUtility },
      ]}
      layout={pl.layout}
      onOrder={pl.setOrder}
      onHidden={pl.setHidden}
      onReset={pl.reset}
    />
  );
  // ⌘K keeps every page, in the user's order; a hidden one says so
  const pages = orderPages([...allRail, ...allUtility], pl.layout.order).map(
    (i) => ({ ...i, hidden: pl.isHidden(i.to) }),
  );
  const here = [...allRail, ...allUtility].find((i) =>
    i.exact
      ? path === i.to
      : path === i.to || path.startsWith(i.to + "/"),
  );
  useCommands("pages", [
    ...(here &&
    !pl.isHidden(here.to) &&
    (allRail.some((i) => i.to === here.to) ? rail : util).length > 1
      ? [
          {
            id: "pages:hide",
            label: `Hide this page from the rail: ${here.label}`,
            group: "Page layout",
            icon: EyeOff,
            keywords: "hide page rail customize",
            run: () => pl.setHidden(here.to, true),
          },
        ]
      : []),
    ...(pl.layout.hidden.length
      ? [
          {
            id: "pages:show",
            label: `Show hidden pages (${pl.layout.hidden.length})`,
            group: "Page layout",
            icon: Eye,
            keywords: "show unhide page rail customize",
            run: pl.showAll,
          },
        ]
      : []),
    ...(pl.customized
      ? [
          {
            id: "pages:reset",
            label: "Reset page order and hidden pages",
            group: "Page layout",
            icon: RotateCcw,
            keywords: "reset pages rail customize order",
            run: pl.reset,
          },
        ]
      : []),
  ]);
  return {
    rail,
    utility: util,
    pages,
    shellProps: { onRailOrder, onRailMenu, railFoot },
    menu: menu.element,
  };
}
