/**
 * A confirm you open from code: a delete chosen in a row menu, an action at the end of a flow. `ConfirmPop` needs a
 * button to sit under; this one is a small centred dialog with the same parts (title, description, an optional reason,
 * an optional word to type) and the same `ConfirmSpec`.
 *
 *   const ask = useConfirm();
 *   const ok = await ask.confirm({ title: "Delete partner", danger: true, typed: "DELETE" });  // reason string, or null
 *   {ask.element}
 */
import { AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { ConfirmSpec } from "../core/types.js";
import { Dialog } from "./dialog.js";

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  danger,
  typed,
  reason,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  /** the word the person must type to enable the button (a destructive delete: "DELETE") */
  typed?: string;
  reason?: { label: string; required?: boolean };
  /** runs with the reason ("" without one); the dialog closes when it resolves, stays open when it throws */
  onConfirm: (reason: string) => unknown;
}) {
  const [text, setText] = useState("");
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);
  const close = () => {
    if (busy) return;
    setText("");
    setWord("");
    onClose();
  };
  const ready = !busy && !(reason?.required && !text.trim()) && !(typed && word.trim() !== typed);
  const run = async () => {
    if (!ready) return;
    setBusy(true);
    try {
      await onConfirm(text.trim());
      setText("");
      setWord("");
      onClose();
    } catch {
      /* the caller shows its own error; the dialog stays for another try */
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog
      open={open}
      size="sm"
      onClose={close}
      title={
        <span className="mds-confirm-title">
          {danger && <AlertTriangle />}
          {title}
        </span>
      }
      label={title}
      footer={
        <div className="mds-hstack" style={{ justifyContent: "flex-end", gap: 8, width: "100%" }}>
          <button type="button" className="mds-btn" onClick={close} disabled={busy}>
            Cancel
          </button>
          <button type="button" className={`mds-btn ${danger ? "danger" : "primary"}`} onClick={run} disabled={!ready}>
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      }
    >
      <form
        className="mds-confirm mds-confirm-dialog"
        onSubmit={(e) => {
          e.preventDefault();
          void run();
        }}
      >
        {description && <div className="mds-muted">{description}</div>}
        {reason && (
          <textarea
            className="mds-input mds-textarea"
            placeholder={reason.label}
            aria-label={reason.label}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            data-autofocus={!typed || undefined}
          />
        )}
        {typed && (
          <input
            className="mds-input"
            placeholder={`Type ${typed} to confirm`}
            aria-label={`Type ${typed} to confirm`}
            value={word}
            onChange={(e) => setWord(e.target.value)}
            data-autofocus
          />
        )}
        <button type="submit" hidden />
      </form>
    </Dialog>
  );
}

/**
 * `confirm(spec)` opens a ConfirmDialog and resolves with the reason ("" without one), or null when cancelled, when a
 * newer `confirm` replaces it, or when the component holding the hook unmounts.
 */
export function useConfirm() {
  const [spec, setSpec] = useState<(ConfirmSpec & { key: number }) | null>(null);
  const settle = useRef<((v: string | null) => void) | null>(null);
  const calls = useRef(0);
  // a page that goes away mid-question answers "cancelled", so an awaiting caller never hangs
  useEffect(
    () => () => {
      settle.current?.(null);
      settle.current = null;
    },
    [],
  );
  const confirm = useCallback(
    (s: ConfirmSpec) =>
      new Promise<string | null>((resolve) => {
        settle.current?.(null);
        settle.current = resolve;
        // a fresh key per call: the dialog remounts, so a reason or typed word never carries into the next question
        setSpec({ ...s, key: ++calls.current });
      }),
    [],
  );
  const done = (v: string | null) => {
    settle.current?.(v);
    settle.current = null;
    setSpec(null);
  };
  return {
    confirm,
    element: spec ? (
      <ConfirmDialog
        key={spec.key}
        open
        title={spec.title}
        description={spec.description}
        confirmLabel={spec.confirmLabel}
        danger={spec.danger}
        typed={spec.typed}
        reason={spec.reason}
        onClose={() => done(null)}
        onConfirm={(r) => done(r)}
      />
    ) : null,
  };
}
