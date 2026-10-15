import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Tip } from "../overlay/tip.js";
import { storageKey } from "../core/storage.js";

/**
 * Words with a hover: any label that has a glossary entry shows its description first and its old name under it.
 * `Term` looks a label up by its text (table headers, field names, titles) or by a coded key (`state:…`, `tag:…`); the
 * "old names" preference appends the old name beside the label everywhere. A word with an entry takes the keyboard
 * focus too, so the meaning shows for keyboard users as well.
 */

/** A glossary row: what the word means, and the name it had before (shown on hover and with "old names"). */
export type GlossaryEntry = { d: string; old?: string };
/**
 * The app's glossary, handed to `TermsProvider`. Without one, every `Term` renders its plain label, so the kit works
 * with no glossary at all.
 */
export type Glossary = {
  /** the entry for a label's text or a coded key (`state:arrived`) */
  lookup: (key: string) => GlossaryEntry | undefined;
  /** the label to show for a coded key */
  label?: (key: string) => string;
};
const NO_GLOSSARY: Glossary = { lookup: () => undefined };
const GlossaryCtx = createContext<Glossary>(NO_GLOSSARY);

const KEY = () => storageKey("oldNames");
type Terms = { oldNames: boolean; setOldNames: (v: boolean) => void };
const Ctx = createContext<Terms>({ oldNames: false, setOldNames: () => {} });

export function TermsProvider({
  children,
  glossary = NO_GLOSSARY,
}: {
  children: ReactNode;
  glossary?: Glossary;
}) {
  // the saved choice is read after mount, so the server's HTML and the first render agree
  const [oldNames, set] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem(KEY()) === "1") set(true);
    } catch {
      /* private mode */
    }
  }, []);
  const setOldNames = useCallback((v: boolean) => {
    set(v);
    try {
      localStorage.setItem(KEY(), v ? "1" : "0");
    } catch {
      /* private mode */
    }
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("old-names", oldNames);
  }, [oldNames]);
  const value = useMemo(
    () => ({ oldNames, setOldNames }),
    [oldNames, setOldNames],
  );
  return (
    <GlossaryCtx.Provider value={glossary}>
      <Ctx.Provider value={value}>{children}</Ctx.Provider>
    </GlossaryCtx.Provider>
  );
}
export const useTerms = () => useContext(Ctx);

/** The hover body for an entry: description, then the old name. */
export function TermBody({
  label,
  entry,
}: {
  label: string;
  entry: GlossaryEntry;
}) {
  return (
    <div className="term-tip">
      <div className="term-tip-title">{label}</div>
      <div>{entry.d}</div>
      {entry.old && <div className="term-tip-old">Old name: {entry.old}</div>}
    </div>
  );
}

/**
 * A label with its meaning on hover. `k` is a coded key (`state:arrived`); without it the label text is the key.
 * Labels with no entry render as plain text, so it is safe on every header.
 */
export function Term({
  label,
  k,
  children,
  placement = "bottom",
}: {
  label: string;
  k?: string;
  children?: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
}) {
  const { oldNames } = useTerms();
  const entry = useContext(GlossaryCtx).lookup(k ?? label);
  if (!entry) return <>{children ?? label}</>;
  return (
    <Tip label={<TermBody label={label} entry={entry} />} placement={placement}>
      <span className="term" tabIndex={0}>
        {children ?? label}
        {oldNames && entry.old && (
          <span className="term-old"> · {entry.old}</span>
        )}
      </span>
    </Tip>
  );
}

/** A coded value (state, tag, flag, payable kind, rule, freight terms) with its meaning on hover. */
export function Code({
  k,
  children,
  placement,
}: {
  k: string;
  children?: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
}) {
  const label = useContext(GlossaryCtx).label?.(k) ?? k;
  return (
    <Term k={k} label={label} placement={placement}>
      {children}
    </Term>
  );
}

/** The hover content for a rail item or a title, when the caller renders its own trigger. */
export function useTermTip(): (label: string) => ReactNode {
  const { lookup } = useContext(GlossaryCtx);
  return (label: string) => {
    const entry = lookup(label);
    return entry ? <TermBody label={label} entry={entry} /> : label;
  };
}
