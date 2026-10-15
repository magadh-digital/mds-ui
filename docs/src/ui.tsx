// The docs' own building blocks: a page frame, a live demo with its exact source, a code block and a props table.
import { useState, type ReactNode } from "react";
import { MiniTable, Seg } from "@mds/ui";
import props from "./props.json";

type Prop = { name: string; type: string; required: boolean; default?: string; description: string };
const PROPS = props as Record<string, { file: string; description: string; props: Array<Prop> }>;

export function Page({ title, lead, children }: { title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <article className="doc-page">
      <h1>{title}</h1>
      {lead && <p className="doc-lead">{lead}</p>}
      {children}
    </article>
  );
}

export function Section({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <section className="doc-section" id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function Code({ children, lang = "tsx" }: { children: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const text = children.trim();
  return (
    <div className="doc-code" data-lang={lang}>
      <button
        type="button"
        className="doc-copy"
        onClick={() => {
          void navigator.clipboard?.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre>
        <code>{text}</code>
      </pre>
    </div>
  );
}

/** A live example over the very source that renders it (imported with ?raw), so the code shown always runs. */
export function Demo({ title, source, children }: { title?: string; source: string; children: ReactNode }) {
  const [view, setView] = useState<"preview" | "code">("preview");
  return (
    <figure className="doc-demo">
      <div className="doc-demo-head">
        {title && <figcaption>{title}</figcaption>}
        <Seg value={view} onChange={setView} options={[{ value: "preview", label: "Preview" }, { value: "code", label: "Code" }]} />
      </div>
      {view === "preview" ? <div className="doc-demo-body">{children}</div> : <Code>{stripDemoHeader(source)}</Code>}
    </figure>
  );
}
// demo files open with a one-line comment for the docs; the reader sees the code from the imports on
const stripDemoHeader = (s: string) => s.replace(/^\/\/[^\n]*\n/, "");

/** The props of a component, from the TypeScript types and their doc comments (scripts/props.ts). */
export function Props({ of }: { of: string }) {
  const doc = PROPS[of];
  if (!doc) return <p className="mds-muted">No props found for {of}.</p>;
  if (!doc.props.length) return <p className="mds-muted">{of} takes no props.</p>;
  return (
    <div className="doc-props">
      <MiniTable
        label={`${of} props`}
        rows={doc.props}
        rowKey={(p) => p.name}
        className="rows2"
        cols={[
          { key: "name", header: "Prop", cell: (p) => <code className="doc-prop">{p.name}{p.required ? "" : "?"}</code> },
          { key: "type", header: "Type", cell: (p) => <code className="doc-type">{p.type}</code> },
          { key: "default", header: "Default", cell: (p) => (p.default ? <code>{p.default}</code> : <span className="mds-muted">—</span>) },
          { key: "doc", header: "Description", cell: (p) => p.description || <span className="mds-muted">—</span> },
        ]}
      />
      <p className="doc-source">
        Source: <code>src/{doc.file}</code>
      </p>
    </div>
  );
}
