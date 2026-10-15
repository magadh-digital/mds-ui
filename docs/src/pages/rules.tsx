// The UI rules page: AGENTS.md itself, rendered, so the site and the repo can never disagree.
import type { ReactNode } from "react";
import agents from "../../../AGENTS.md?raw";
import { Page } from "../ui";

// inline markdown: `code`, **bold**, [text](url)
function inline(s: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  for (const m of s.matchAll(re)) {
    if (m.index! > last) out.push(s.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("`")) out.push(<code key={out.length}>{t.slice(1, -1)}</code>);
    else if (t.startsWith("**")) out.push(<strong key={out.length}>{t.slice(2, -2)}</strong>);
    else {
      const [, text, href] = /\[([^\]]+)\]\(([^)]+)\)/.exec(t)!;
      out.push(<a key={out.length} href={href}>{text}</a>);
    }
    last = m.index! + t.length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

function render(md: string): ReactNode[] {
  const lines = md.split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i]!;
    if (!l.trim()) { i++; continue; }
    if (l.startsWith("```")) {
      const body: string[] = [];
      for (i++; i < lines.length && !lines[i]!.startsWith("```"); i++) body.push(lines[i]!);
      i++;
      out.push(<pre key={out.length} className="doc-md-pre"><code>{body.join("\n")}</code></pre>);
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(l);
    if (h) {
      const level = h[1]!.length;
      const Tag = (level <= 2 ? "h2" : level === 3 ? "h3" : "h4") as "h2" | "h3" | "h4";
      out.push(<Tag key={out.length}>{inline(h[2]!)}</Tag>);
      i++;
      continue;
    }
    if (l.startsWith("|")) {
      const rows: string[][] = [];
      for (; i < lines.length && lines[i]!.startsWith("|"); i++) {
        if (/^\|\s*-/.test(lines[i]!)) continue;
        rows.push(lines[i]!.split("|").slice(1, -1).map((c) => c.trim()));
      }
      const [head, ...body] = rows;
      out.push(
        <div key={out.length} className="doc-md-table">
          <table>
            <thead><tr>{head!.map((c, k) => <th key={k}>{inline(c)}</th>)}</tr></thead>
            <tbody>{body.map((r, k) => <tr key={k}>{r.map((c, j) => <td key={j}>{inline(c)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (/^\s*[-*]\s/.test(l)) {
      const items: Array<{ depth: number; text: string }> = [];
      for (; i < lines.length && (/^\s*[-*]\s/.test(lines[i]!) || (/^\s{2,}\S/.test(lines[i]!) && items.length)); i++) {
        const m = /^(\s*)[-*]\s+(.*)$/.exec(lines[i]!);
        if (m) items.push({ depth: m[1]!.length >= 2 ? 1 : 0, text: m[2]! });
        else items[items.length - 1]!.text += " " + lines[i]!.trim();
      }
      out.push(
        <ul key={out.length}>
          {items.map((it, k) => <li key={k} style={{ marginLeft: it.depth * 18 }}>{inline(it.text)}</li>)}
        </ul>,
      );
      continue;
    }
    const para: string[] = [];
    for (; i < lines.length && lines[i]!.trim() && !/^(#|\||```|\s*[-*]\s)/.test(lines[i]!); i++) para.push(lines[i]!.trim());
    out.push(<p key={out.length}>{inline(para.join(" "))}</p>);
  }
  return out;
}

export function Rules() {
  // the title line of AGENTS.md is the page title here
  const body = agents.replace(/^# [^\n]*\n/, "");
  return (
    <Page title="UI rules" lead="The rules the kit is built around, for people and for coding agents. This page is AGENTS.md from the repository, as is.">
      <div className="doc-md">{render(body)}</div>
    </Page>
  );
}
