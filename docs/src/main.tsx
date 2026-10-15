// The docs site: a classic documentation layout (header, sidebar, content, "On this page"), its own look; the kit
// appears in the live demos. UIProvider wraps it so every demo works as it would in an app.
import { createRoot } from "react-dom/client";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { ArrowLeft, ArrowRight, Github, Menu, Monitor, Moon, Search, Sun, X } from "lucide-react";
import "@mds/ui/styles.css";
import "./docs.css";
import { UIProvider, useAppearance, useKitRouter } from "@mds/ui";
import pkg from "../../package.json";
import { GROUPS, PAGES, pageAt, type DocPage } from "./registry";

const GITHUB = "https://github.com/magadh-digital/mds-ui";

function Link({ to, className, children, onClick }: { to: string; className?: string; children: React.ReactNode; onClick?: () => void }) {
  const { navigate } = useKitRouter();
  return (
    <a
      href={to}
      className={className}
      onClick={(e: MouseEvent) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onClick?.();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useAppearance();
  const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  return (
    <button type="button" className="d-icon" onClick={() => setTheme(next)} aria-label={`Theme: ${theme}. Switch to ${next}`} title={`Theme: ${theme}`}>
      <Icon size={17} />
    </button>
  );
}

function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { navigate } = useKitRouter();
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const hits = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return PAGES;
    return PAGES.filter((p) => `${p.title} ${p.section} ${p.keywords ?? ""}`.toLowerCase().includes(t));
  }, [q]);
  useEffect(() => {
    if (open) {
      setQ("");
      setI(0);
      setTimeout(() => input.current?.focus(), 0);
    }
  }, [open]);
  if (!open) return null;
  const go = (p: DocPage | undefined) => {
    if (!p) return;
    navigate(p.path);
    onClose();
  };
  return (
    <div className="d-search-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="d-search" role="dialog" aria-label="Search the docs">
        <div className="d-search-input">
          <Search size={16} />
          <input
            ref={input}
            value={q}
            placeholder="Search components and guides…"
            onChange={(e) => {
              setQ(e.target.value);
              setI(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") (e.preventDefault(), setI((v) => Math.min(v + 1, hits.length - 1)));
              else if (e.key === "ArrowUp") (e.preventDefault(), setI((v) => Math.max(v - 1, 0)));
              else if (e.key === "Enter") go(hits[i]);
              else if (e.key === "Escape") onClose();
            }}
          />
          <kbd>Esc</kbd>
        </div>
        <ul className="d-search-list">
          {hits.length === 0 && <li className="d-muted d-search-empty">No results for “{q}”</li>}
          {hits.map((p, k) => (
            <li key={p.path}>
              <button type="button" className={k === i ? "on" : ""} onMouseEnter={() => setI(k)} onClick={() => go(p)}>
                <span>{p.title}</span>
                <span className="d-muted">{GROUPS.find((g) => g.id === p.section)?.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** "On this page": the h2s of the article, the one in view highlighted. */
function Toc({ path }: { path: string }) {
  const [items, setItems] = useState<Array<{ id: string; text: string }>>([]);
  const [active, setActive] = useState("");
  useEffect(() => {
    const read = () =>
      setItems(
        [...document.querySelectorAll<HTMLElement>(".d-article h2[id]")].map((h) => ({ id: h.id, text: h.textContent?.replace(/^#/, "") ?? "" })),
      );
    read();
    const mo = new MutationObserver(read);
    const main = document.querySelector(".d-article");
    if (main) mo.observe(main, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [path]);
  useEffect(() => {
    const onScroll = () => {
      let cur = items[0]?.id ?? "";
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top < 120) cur = it.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);
  if (items.length < 2) return null;
  return (
    <nav className="d-toc" aria-label="On this page">
      <div className="d-toc-title">On this page</div>
      {items.map((it) => (
        <a key={it.id} href={`#${it.id}`} className={it.id === active ? "on" : ""}>
          {it.text}
        </a>
      ))}
    </nav>
  );
}

function Site() {
  const { pathname } = useKitRouter();
  const page = pageAt(pathname);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const index = page ? PAGES.indexOf(page) : -1;
  const prev = index > 0 ? PAGES[index - 1] : undefined;
  const next = index >= 0 && index < PAGES.length - 1 ? PAGES[index + 1] : undefined;

  useEffect(() => {
    document.title = !page || page.path === "/" ? "@mds/ui: React UI kit for data-heavy apps" : `${page.title} · @mds/ui`;
    if (!location.hash) window.scrollTo(0, 0);
    setMenu(false);
  }, [page]);
  // the command palette page mounts the kit's own palette, which takes ⌘K there
  const paletteDemo = pathname === "/components/command-palette";
  useEffect(() => {
    if (paletteDemo) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((s) => !s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteDemo]);

  const Body = page?.render;
  return (
    <div className="d-site">
      <header className="d-header">
        <button type="button" className="d-icon d-menu-btn" onClick={() => setMenu((m) => !m)} aria-label="Menu">
          {menu ? <X size={18} /> : <Menu size={18} />}
        </button>
        <Link to="/" className="d-brand">
          <span className="d-logo">M</span>
          <span>mds/ui</span>
          <span className="d-version">v{pkg.version}</span>
        </Link>
        <nav className="d-top-nav">
          <Link to="/">Docs</Link>
          <Link to={PAGES.find((p) => p.section === "inputs")?.path ?? "/"}>Components</Link>
        </nav>
        <span className="d-grow" />
        <button type="button" className="d-search-btn" onClick={() => setSearch(true)}>
          <Search size={15} />
          <span>Search docs…</span>
          <kbd>⌘K</kbd>
        </button>
        <a className="d-icon" href={GITHUB} target="_blank" rel="noreferrer" aria-label="GitHub">
          <Github size={17} />
        </a>
        <ThemeToggle />
      </header>

      <div className="d-body">
        <aside className={`d-sidebar${menu ? " open" : ""}`} aria-label="Docs navigation">
          {GROUPS.map((g) => {
            const pages = PAGES.filter((p) => p.section === g.id);
            if (!pages.length) return null;
            return (
              <div key={g.id} className="d-nav-group">
                <div className="d-nav-title">{g.label}</div>
                {pages.map((p) => (
                  <Link key={p.path} to={p.path} className={`d-nav-link${p === page ? " on" : ""}`}>
                    {p.title}
                  </Link>
                ))}
              </div>
            );
          })}
        </aside>
        {menu && <div className="d-scrim" onClick={() => setMenu(false)} />}

        <main className="d-main">
          {Body ? (
            <Body />
          ) : (
            <article className="d-article">
              <h1>Page not found</h1>
              <p className="d-lead">
                There is no page at <code>{pathname}</code>. <Link to="/">Go to the introduction</Link>.
              </p>
            </article>
          )}
          {page && (
            <nav className="d-pager" aria-label="Previous and next page">
              {prev ? (
                <Link to={prev.path} className="d-pager-link">
                  <span className="d-muted">
                    <ArrowLeft size={14} /> Previous
                  </span>
                  {prev.title}
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link to={next.path} className="d-pager-link right">
                  <span className="d-muted">
                    Next <ArrowRight size={14} />
                  </span>
                  {next.title}
                </Link>
              )}
            </nav>
          )}
          <footer className="d-footer">
            MIT licensed · <a href={GITHUB}>GitHub</a> · npm <code>@mds/ui</code>
          </footer>
        </main>

        <Toc path={pathname} />
      </div>
      <SearchDialog open={search} onClose={() => setSearch(false)} />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <UIProvider storagePrefix="mds-ui-docs">
    <Site />
  </UIProvider>,
);
