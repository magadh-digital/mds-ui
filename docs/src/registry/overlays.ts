// The Overlays section: tooltip, popovers, confirms, menus, the dialog, toasts and the ⌘K palette.
import type { DocPage } from "../registry";
import { ConfirmDialogPage, ConfirmPopPage, DialogPage, HoverPopPage, PalettePage, PopPage, RowMenuPage, TipPage, ToastPage } from "../pages/overlays";

export const pages: Array<DocPage> = [
  { path: "/components/tip", title: "Tip", section: "overlays", render: TipPage, keywords: "tooltip hint hover" },
  { path: "/components/pop", title: "Pop and EditPop", section: "overlays", render: PopPage, keywords: "popover editpop inline edit" },
  { path: "/components/hover-pop", title: "HoverPop", section: "overlays", render: HoverPopPage, keywords: "hover card summary popover" },
  { path: "/components/confirm-pop", title: "ConfirmPop", section: "overlays", render: ConfirmPopPage, keywords: "confirm delete typed reason ActionConfirm" },
  { path: "/components/confirm-dialog", title: "ConfirmDialog and useConfirm", section: "overlays", render: ConfirmDialogPage, keywords: "confirm modal ask promise" },
  { path: "/components/row-menu", title: "Row menu", section: "overlays", render: RowMenuPage, keywords: "context menu right click useContextMenu RowMenuButton actionsToMenu MoreMenu FootActions" },
  { path: "/components/dialog", title: "Dialog", section: "overlays", render: DialogPage, keywords: "modal frame" },
  { path: "/components/toast", title: "Toasts", section: "overlays", render: ToastPage, keywords: "toast notification Toaster snackbar" },
  { path: "/components/command-palette", title: "Command palette", section: "overlays", render: PalettePage, keywords: "cmdk command k useCommands PaletteButton search" },
];
