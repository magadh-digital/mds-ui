import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

export type Tone = "ok" | "warn" | "error" | "accent" | "neutral";

/** What a confirm asks; the same spec drives ConfirmPop (panel, bulk bar) and the inline confirm of the context menu. */
export type ConfirmSpec = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  reason?: { label: string; required?: boolean };
  /** the word to type before the button enables (destructive deletes: "DELETE") */
  typed?: string;
};

/**
 * One action model for three surfaces: the panel's ActionRow, the row's context menu and the BulkBar. `confirm` makes the
 * surface ask first (the reason, if any, reaches onClick); `element` is an escape hatch for the panel only.
 */
export type Action = {
  key: string;
  label: string;
  onClick?: (reason?: string) => unknown;
  disabled?: boolean;
  title?: string;
  primary?: boolean;
  danger?: boolean;
  icon?: ReactNode;
  /** the icon for menus (a lucide component) */ lucide?: LucideIcon;
  confirm?: ConfirmSpec;
  element?: ReactNode;
};
