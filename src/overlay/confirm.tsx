import { AlertTriangle } from "lucide-react";
import { type ReactNode, useState } from "react";
import { type Action } from "../core/types.js";
import { Pop } from "./pop.js";

/**
 * Destructive or irreversible actions ask in a small popover, optionally with a reason.
 * `trigger` is the link/button that opens it.
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
  onConfirm: (reason: string) => void | Promise<void>;
  placement?: "bottom-end" | "bottom-start" | "top-start";
}) {
  const [text, setText] = useState("");
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Pop
      trigger={trigger}
      placement={placement}
      width="calc(var(--panel-w) * 0.8)"
    >
      <div className="confirm">
        <div className="confirm-title">
          {danger && <AlertTriangle />}
          {title}
        </div>
        {description && <div className="ui-muted">{description}</div>}
        {reason && (
          <textarea
            className="ui-input ui-textarea"
            placeholder={reason.label}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
          />
        )}
        {typed && (
          <input
            className="ui-input"
            placeholder={`Type ${typed} to confirm`}
            aria-label={`Type ${typed} to confirm`}
            value={word}
            onChange={(e) => setWord(e.target.value)}
            autoFocus
          />
        )}
        <div className="hstack" style={{ justifyContent: "flex-end" }}>
          <button
            className={`ui-btn ${danger ? "danger" : ""}`}
            disabled={
              busy ||
              (reason?.required && !text.trim()) ||
              (!!typed && word.trim() !== typed)
            }
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm(text.trim());
                setText("");
                setWord("");
              } finally {
                setBusy(false);
              }
            }}
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
}: {
  a: Action;
  trigger: ReactNode;
  extra?: ReactNode;
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
      onConfirm={(r) => Promise.resolve(a.onClick?.(r)).then(() => undefined)}
    />
  );
}
