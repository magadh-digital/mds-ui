import { AlertTriangle } from "lucide-react";
import { type ReactNode, useState } from "react";
import { type Action } from "../core/types.js";
import { Pop, type PopPlacement } from "./pop.js";

/**
 * Destructive or irreversible actions ask in a small popover, optionally with a reason.
 * `trigger` is the link/button that opens it. The popover closes when `onConfirm` resolves; when it throws, the popover
 * stays open for another try (the caller shows its own error).
 */
export function ConfirmPop({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  reason,
  danger,
  typed,
  onConfirm,
  placement = "bottom-end",
}: {
  trigger: ReactNode;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  reason?: { label: string; required?: boolean };
  danger?: boolean;
  /** the word the person must type to enable the button (a destructive delete: "DELETE") */
  typed?: string;
  onConfirm: (reason: string) => void | Promise<unknown>;
  placement?: PopPlacement;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);
  const onOpenChange = (v: boolean) => {
    if (!v && busy) return; // a running confirm finishes before the popover goes
    // each opening starts clean: a typed DELETE or a reason never carries over to the next ask
    if (v) {
      setText("");
      setWord("");
    }
    setOpen(v);
  };
  const run = async () => {
    setBusy(true);
    try {
      await onConfirm(text.trim());
      setOpen(false);
    } catch {
      /* the caller shows its own error; the popover stays open for another try */
    } finally {
      setBusy(false);
    }
  };
  return (
    <Pop
      trigger={trigger}
      placement={placement}
      width="calc(var(--mds-panel-w) * 0.8)"
      label={title}
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="mds-confirm">
        <div className="mds-confirm-title">
          {danger && <AlertTriangle />}
          {title}
        </div>
        {description && <div className="mds-muted">{description}</div>}
        {reason && (
          <textarea
            className="mds-input mds-textarea"
            placeholder={reason.label}
            aria-label={reason.label}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
          />
        )}
        {typed && (
          <input
            className="mds-input"
            placeholder={`Type ${typed} to confirm`}
            aria-label={`Type ${typed} to confirm`}
            value={word}
            onChange={(e) => setWord(e.target.value)}
            autoFocus
          />
        )}
        <div className="mds-hstack" style={{ justifyContent: "flex-end" }}>
          <button
            type="button"
            className={`mds-btn ${danger ? "danger" : ""}`}
            disabled={
              busy ||
              (reason?.required && !text.trim()) ||
              (!!typed && word.trim() !== typed)
            }
            onClick={() => void run()}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </Pop>
  );
}

/** The confirm popover for an action that carries a `confirm` spec; `trigger` is the button or link. */
export function ActionConfirm({
  a,
  trigger,
  extra,
  placement,
}: {
  a: Action;
  trigger: ReactNode;
  extra?: ReactNode;
  placement?: PopPlacement;
}) {
  const c = a.confirm!;
  return (
    <ConfirmPop
      trigger={trigger}
      title={c.title}
      description={
        extra ? (
          <>
            {c.description}
            {c.description ? " " : ""}
            {extra}
          </>
        ) : (
          c.description
        )
      }
      confirmLabel={c.confirmLabel}
      reason={c.reason}
      typed={c.typed}
      danger={c.danger ?? a.danger}
      placement={placement}
      onConfirm={(r) => a.onClick?.(r)}
    />
  );
}
