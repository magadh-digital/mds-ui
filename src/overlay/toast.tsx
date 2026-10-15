import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Small one-line toasts, bottom-right, auto-dismiss. No library: a tiny store + one portal. */

export type ToastKind = "ok" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; text: string };

let seq = 0;
let items: Array<ToastItem> = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const toast = {
  show(kind: ToastKind, text: string, ms = kind === "error" ? 6000 : 3000) {
    const id = ++seq;
    items = [...items, { id, kind, text }];
    emit();
    setTimeout(() => toast.dismiss(id), ms);
    return id;
  },
  ok: (text: string) => toast.show("ok", text),
  error: (text: string) => toast.show("error", text),
  info: (text: string) => toast.show("info", text),
  dismiss(id: number) {
    items = items.filter((t) => t.id !== id);
    emit();
  },
};

/** Mount once in the root layout. */
export function Toaster() {
  const [list, setList] = useState(items);
  useEffect(() => {
    const l = () => setList(items);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);
  if (list.length === 0) return null;
  return createPortal(
    <div className="toasts" role="status" aria-live="polite">
      {list.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.kind}`}
          onClick={() => toast.dismiss(t.id)}
        >
          {t.kind === "ok" ? (
            <CheckCircle2 />
          ) : t.kind === "error" ? (
            <XCircle />
          ) : (
            <Info />
          )}
          <span>{t.text}</span>
        </div>
      ))}
    </div>,
    document.body,
  );
}
