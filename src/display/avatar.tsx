/**
 * A person or a company as a small round badge: the photo when there is one (and it loads), else up to two initials on
 * a colour picked from the name, so the same name always gets the same colour.
 */
import { useState } from "react";

const TONES = ["var(--c-accent)", "var(--c-ok)", "var(--c-warn)", "var(--c-purple)", "var(--c-error)", "var(--c-muted)"];
export const initials = (name: string) => {
  const words = name.replace(/^m\/?s\.?\s+/i, "").trim().split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? "") + (words.length > 1 ? words[words.length - 1]![0] : (words[0]?.[1] ?? ""))).toUpperCase();
};
const toneOf = (name: string) => {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length]!;
};

export function Avatar({ name, src, size = 28, title }: { name: string; src?: string | null; size?: number; title?: string }) {
  const [broken, setBroken] = useState(false);
  const c = toneOf(name || "?");
  return (
    <span
      className="ui-avatar"
      title={title ?? name}
      aria-label={name}
      role="img"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4), color: c, background: `color-mix(in srgb, ${c} 16%, transparent)` }}
    >
      {src && !broken ? <img src={src} alt="" onError={() => setBroken(true)} /> : initials(name || "?")}
    </span>
  );
}
