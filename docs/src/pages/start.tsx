// The setup pages: install, providers, theming, router, locale and saved choices.
import { Code, Page, Section } from "../ui";

export function GettingStarted() {
  return (
    <Page
      title="Getting started"
      lead="@mds/ui is a light React UI kit for data-heavy apps: list pages, dense tables, filters, side panels, pickers, a date range, a file viewer, an app shell and a ⌘K palette."
    >
      <Section title="Install">
        <Code lang="bash">npm install @mds/ui</Code>
        <p>
          React 19 is the only peer. The kit brings <code>@floating-ui/react</code>, <code>@tanstack/react-table</code> and{" "}
          <code>lucide-react</code> with it; bundlers keep only what you import.
        </p>
      </Section>
      <Section title="Set up once">
        <Code>{`
import "@mds/ui/styles.css";
import { UIProvider } from "@mds/ui";

createRoot(document.getElementById("root")!).render(
  <UIProvider>
    <App />
  </UIProvider>,
);`}</Code>
        <p>
          <code>UIProvider</code> mounts what the components rely on: appearance (theme, density, panel width), the
          slide-over stack, the toast host, and optionally your router, a glossary, the locale and the storage prefix.
          The stylesheet is imported once; the JavaScript never imports CSS, so the package also loads in Node, SSR and
          test runners.
        </p>
      </Section>
      <Section title="A list page">
        <Code>{`
import { Toolbar, DenseTable, ToggleGroup, DateRange, StatusChip } from "@mds/ui";

function Orders() {
  const [status, setStatus] = useState<"" | "open" | "closed">("");
  const [range, setRange] = useState({});
  const [q, setQ] = useState("");
  return (
    <div className="main">
      <Toolbar
        title="Orders"
        count={rows.length}
        onRefresh={refetch}
        refreshing={isFetching}
        filters={<>
          <DateRange value={range} onChange={setRange} />
          <ToggleGroup label="Status" value={status} onChange={setStatus}
            options={[{ value: "open", label: "Open" }, { value: "closed", label: "Closed" }]} />
        </>}
        search={{ value: q, onChange: setQ, placeholder: "Search orders" }}
      />
      <DenseTable label="Orders" columns={columns} data={rows} getRowId={(r) => r.id}
        loading={isFetching} sorting={sorting} onSortingChange={setSorting}
        pagination={page} onPaginationChange={setPage} />
    </div>
  );
}`}</Code>
      </Section>
    </Page>
  );
}

export function Theming() {
  return (
    <Page title="Theming" lead="Every colour and size is a CSS variable. A theme is a set of values; dark mode comes free.">
      <Section title="Override the variables">
        <Code lang="css">{`
:root { --c-accent: #0f766e; --c-accent-soft: rgba(15, 118, 110, 0.1); }
:root.dark { --c-accent: #2dd4bf; }`}</Code>
        <p>
          The main ones: <code>--c-canvas</code>, <code>--c-surface</code>, <code>--c-text</code>, <code>--c-muted</code>,{" "}
          <code>--c-border</code>, <code>--c-accent</code>, <code>--c-ok</code>, <code>--c-warn</code>, <code>--c-error</code>,{" "}
          <code>--c-purple</code>, <code>--radius-md</code>, <code>--ui-scale</code>, <code>--table-row-h</code>.
        </p>
      </Section>
      <Section title="Density and the reader's theme">
        <p>
          The appearance popover in <code>AppShell</code> (or <code>useAppearance()</code>) switches light / dark / system,
          compact / comfortable / large density, the slide-over width and where a record opens. Choices are remembered per
          reader.
        </p>
      </Section>
    </Page>
  );
}

export function Providers() {
  return (
    <Page title="Providers and router" lead="One wrapper, UIProvider, or the pieces on their own.">
      <Section title="UIProvider">
        <Code>{`
<UIProvider
  router={router}                    // optional: { pathname, navigate, Link }; browser history otherwise
  glossary={{ lookup, label }}       // optional: hovers on headers and labels
  locale={{ locale: "en-US", currency: "USD", weekStartsOn: 1, fyStartMonth: 0 }}  // optional
  storagePrefix="my-app.ui"          // optional: where saved choices live
  toaster={true}                     // mount the toast host (default)
>
  <App />
</UIProvider>`}</Code>
      </Section>
      <Section title="With TanStack Router">
        <Code>{`
const navigate = useNavigate();
const pathname = useLocation({ select: (l) => l.pathname });
const router = useMemo(() => ({
  pathname,
  navigate: (to: string) => navigate({ href: to }),
  Link: ({ to, ...p }) => <Link to={to} {...p} />,
}), [pathname, navigate]);

<UIProvider router={router}>…</UIProvider>`}</Code>
        <p>
          The shell, the rail and the ⌘K palette only call <code>useKitRouter()</code>; any router fits the same three
          fields. Without one they use the browser's history (this site does).
        </p>
      </Section>
      <Section title="The pieces">
        <p>
          <code>AppearanceProvider</code>, <code>PanelStackProvider</code>, <code>TermsProvider</code>,{" "}
          <code>RouterProvider</code>, <code>&lt;Toaster /&gt;</code>, <code>configureLocale()</code> and{" "}
          <code>configureStorage()</code> are exported too, for apps that want only one.
        </p>
      </Section>
    </Page>
  );
}

export function LocaleStorage() {
  return (
    <Page title="Locale and saved choices">
      <Section title="Locale">
        <Code>{`configureLocale({ locale: "en-US", currency: "USD", weekStartsOn: 1, fyStartMonth: 0 });`}</Code>
        <p>
          Numbers, money (<code>money()</code>), the calendar's first weekday and the financial-year shortcut follow it.
          The defaults read the Indian way: en-IN grouping (1,23,456), rupees, weeks from Sunday, the year from April.
        </p>
      </Section>
      <Section title="Saved choices">
        <Code>{`configureStorage({ prefix: "my-app.ui" });`}</Code>
        <p>
          The reader's theme, density, panel width, column picks and widths, page order and recent ⌘K items live in
          localStorage as <code>&lt;prefix&gt;.&lt;name&gt;</code> (<code>mds-ui</code> by default). They are read after
          mount, so server-rendered HTML matches the first client render.
        </p>
      </Section>
    </Page>
  );
}
