// The docs' building blocks: a page, an anchored section, highlighted code, a live demo with its exact source, and
// a props table generated from the TypeScript types. Plain HTML and the site's own CSS (docs.css), not the kit.
import { useState, type ReactNode } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { useAppearance } from "@mds/ui";
import props from "./props.json";

type Prop = { name: string; type: string; required: boolean; default?: string; description: string };
const PROPS = props as Record<string, { file: string; description: string; props: Array<Prop> }>;

export const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function Page({ title, lead, children }: { title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <article className="d-article">
      <header className="d-article-head">
        <h1>{title}</h1>
        {lead && <p className="d-lead">{lead}</p>}
      </header>
      {children}
    </article>
  );
}

export function Section({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  const anchor = id ?? slug(title);
  return (
    <section className="d-section">
      <h2 id={anchor}>
        <a href={`#${anchor}`} className="d-anchor" aria-hidden tabIndex={-1}>
          #
        </a>
        {title}
      </h2>
      {children}
    </section>
  );
}

const LANG: Record<string, string> = { tsx: "tsx", ts: "tsx", bash: "bash", css: "css", json: "json", sh: "bash" };

export function Code({ children, lang = "tsx", title }: { children: string; lang?: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const text = children.trim();
  const dark = useAppearance().resolvedTheme === "dark";
  return (
    <div className="d-code">
      {title && <div className="d-code-title">{title}</div>}
      <button
        type="button"
        className="d-copy"
        onClick={() => {
          void navigator.clipboard?.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        }}
        aria-label="Copy code"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <Highlight code={text} language={LANG[lang] ?? "tsx"} theme={dark ? themes.vsDark : themes.github}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre>
            <code>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, k) => (
                    <span key={k} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}

/** A live example over the very source that renders it (imported with ?raw), so the code shown always runs. */
export function Demo({ title, source, children }: { title?: string; source: string; children: ReactNode }) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  return (
    <figure className="d-demo">
      <div className="d-demo-bar">
        {title ? <figcaption>{title}</figcaption> : <span />}
        <div className="d-tabs" role="tablist">
          {(["preview", "code"] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
              {t === "preview" ? "Preview" : "Code"}
            </button>
          ))}
        </div>
      </div>
      {tab === "preview" ? <div className="d-demo-stage">{children}</div> : <Code>{stripDemoHeader(source)}</Code>}
    </figure>
  );
}
// demo files open with a one-line `// demo: …` comment for the docs; readers see the code from the imports on
const stripDemoHeader = (s: string) => s.replace(/^\/\/[^\n]*\n/, "");

/** The props of a component, from the TypeScript types and their doc comments (scripts/props.ts). */
export function Props({ of }: { of: string }) {
  const doc = PROPS[of];
  if (!doc) return <p className="d-muted">No props found for {of}.</p>;
  return (
    <div className="d-props">
      {doc.props.length ? (
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {doc.props.map((p) => (
                <tr key={p.name}>
                  <td>
                    <code className="d-prop">
                      {p.name}
                      {p.required && <span className="d-req" title="required">*</span>}
                    </code>
                  </td>
                  <td>
                    <code className="d-type">{p.type}</code>
                  </td>
                  <td>{p.default ? <code>{p.default}</code> : <span className="d-muted">—</span>}</td>
                  <td>{p.description || <span className="d-muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="d-muted">{of} takes no props.</p>
      )}
      <p className="d-source">
        <code>{of}</code> · <code>src/{doc.file}</code>
      </p>
    </div>
  );
}

/** A short note box: tip / warning. */
export function Note({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warn" }) {
  return <div className={`d-note ${tone}`}>{children}</div>;
}
