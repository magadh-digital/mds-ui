// The layout pages: UIProvider, the slide-over and its panel parts, the app shell, appearance and the placeholder.
import type { ReactNode } from "react";
import { MiniTable, useKitRouter } from "@mds/ui";
import { Code, Demo, Page, Props, Section } from "../ui";

import SlideOverRecord from "../demos/layout/SlideOverRecord";
import slideOverRecord from "../demos/layout/SlideOverRecord.tsx?raw";
import SlideOverStack from "../demos/layout/SlideOverStack";
import slideOverStack from "../demos/layout/SlideOverStack.tsx?raw";
import PanelParts from "../demos/layout/PanelParts";
import panelParts from "../demos/layout/PanelParts.tsx?raw";
import AppShellDemo from "../demos/layout/AppShellDemo";
import appShellDemo from "../demos/layout/AppShellDemo.tsx?raw";
import AppearanceDemo from "../demos/layout/AppearanceDemo";
import appearanceDemo from "../demos/layout/AppearanceDemo.tsx?raw";
import PlaceholderDemo from "../demos/layout/PlaceholderDemo";
import placeholderDemo from "../demos/layout/PlaceholderDemo.tsx?raw";

/** a link to another page of the site, through the kit's router */
function To({ to, children }: { to: string; children: ReactNode }) {
  const { Link } = useKitRouter();
  return <Link to={to}>{children}</Link>;
}

type SigRow = { name: string; sig: string; does: ReactNode };
/** a hand-written signature table for hooks and functions (props.json covers components only) */
function Sig({ label, rows }: { label: string; rows: Array<SigRow> }) {
  return (
    <div className="doc-props">
      <MiniTable
        label={label}
        rows={rows}
        rowKey={(r) => r.name}
        cols={[
          { key: "name", header: "Name", cell: (r) => <code className="doc-prop">{r.name}</code> },
          { key: "sig", header: "Type", cell: (r) => <code className="doc-type">{r.sig}</code> },
          { key: "does", header: "What it is", cell: (r) => r.does },
        ]}
      />
    </div>
  );
}

// ---------------------------------------------------------------- UIProvider

export function UIProviderPage() {
  return (
    <Page
      title="UIProvider"
      lead="One wrapper around the whole app that mounts everything the kit's components rely on, in the right order. Put it once at the root."
    >
      <Section title="Usage">
        <Code>{`
import "@mds/ui/styles.css";
import { UIProvider } from "@mds/ui";

createRoot(document.getElementById("root")!).render(
  <UIProvider storagePrefix="my-app.ui" locale={{ locale: "en-US", currency: "USD" }}>
    <App />
  </UIProvider>,
);`}</Code>
        <p>
          There is no live demo here: this whole site runs inside one <code>UIProvider</code>, and a second one would take
          over the page's theme. The router, locale and storage options are explained on{" "}
          <To to="/providers">Providers and router</To> and <To to="/locale">Locale and saved choices</To>.
        </p>
      </Section>
      <Section title="What it mounts">
        <ul>
          <li>
            <code>AppearanceProvider</code>: theme, density, panel width and detail view (see{" "}
            <To to="/components/appearance">Appearance</To>). <code>AppShell</code> and <code>useAppearance</code> need it.
          </li>
          <li>
            <code>PanelStackProvider</code>: one stack for the slide-overs below it, so several open panels layer and close
            in order.
          </li>
          <li>
            <code>TermsProvider</code> with your <code>glossary</code>: the meaning of a label on hover.
          </li>
          <li>
            <code>RouterProvider</code>, when you pass <code>router</code>; without it the shell and ⌘K use the browser's
            history.
          </li>
          <li>
            <code>{"<Toaster />"}</code>, unless <code>toaster={"{false}"}</code> (when the app mounts its own).
          </li>
        </ul>
        <p>
          <code>storagePrefix</code> and <code>locale</code> are applied during the provider's render, before the providers
          below read saved choices. Each piece is exported on its own for apps that want only one.
        </p>
      </Section>
      <Section title="Props">
        <Props of="UIProvider" />
      </Section>
    </Page>
  );
}

// ---------------------------------------------------------------- SlideOver

export function SlideOverPage() {
  return (
    <Page
      title="SlideOver and panel parts"
      lead="A record opens in a slide-over at the right, on top of the list, never a modal. The body knows the record and fills the head, tab counts and foot; the parts below lay out what goes inside."
    >
      <Section title="Examples">
        <Demo title="A record from a list" source={slideOverRecord}>
          <SlideOverRecord />
        </Demo>
        <Demo title="A linked record on top" source={slideOverStack}>
          <SlideOverStack />
        </Demo>
        <Demo title="Body parts without a panel" source={panelParts}>
          <PanelParts />
        </Demo>
      </Section>

      <Section title="Placement">
        <p>
          The panel is positioned against its nearest positioned parent. In an app that is the shell's content area
          (<code>.mds-content</code>), so the rail and top bar stay visible. Elsewhere, give the parent{" "}
          <code>position: relative</code> and <code>overflow: hidden</code>, as the demos do.
        </p>
      </Section>

      <Section title="Behaviour">
        <ul>
          <li>
            Width: 680 px by default; the reader picks narrow, default, wide or wider in Appearance (the px are for the
            compact density and scale with it).
          </li>
          <li>
            Esc closes the top panel, unless a popover, menu or dialog is open: that Esc is theirs. The × in the head
            closes it too.
          </li>
          <li>
            Focus moves into the panel when it opens (onto an element with <code>data-autofocus</code>, else the panel),
            and back to the row or button that opened it when it closes.
          </li>
          <li>
            The body mounts only while open. <code>keepMounted</code> keeps it mounted while closed (a form whose pickers
            must keep their state).
          </li>
          <li>
            <code>tabs</code> + <code>tab</code> + <code>onTab</code> draw a tab strip of icons and labels;{" "}
            <code>PanelTabCounts</code> from the body adds counts (<code>{"{ lines: 2, findings: { n: 1, tone: 'warn' } }"}</code>
            ).
          </li>
        </ul>
      </Section>

      <Section title="Stacking">
        <ul>
          <li>
            A page may keep several slide-overs mounted. Each open one joins a stack; only the most recently opened is in
            view. The ones under it keep their state but are inert and out of the tab order.
          </li>
          <li>
            The panel on top shows a ‹ "Back to …" button named after the panel under it (its <code>title</code>, or{" "}
            <code>label</code> when the title is not plain text). Esc and ‹ close the top panel only.
          </li>
          <li>
            Without a <code>PanelStackProvider</code> all slide-overs share one stack for the document;{" "}
            <code>UIProvider</code> mounts one. A provider gives its subtree a stack of its own.
          </li>
        </ul>
      </Section>

      <Section title="Detail view">
        <p>
          The reader chooses where a record opens (Appearance › Detail view): the side panel, a popup centred over the
          page, or the full page. The ⤢ button in the head switches to full page and back; leaving full page returns to
          whichever of side panel or popup the reader last chose. In full page the list's filter sidebar steps aside. The
          button shows only under an <code>AppearanceProvider</code>.
        </p>
      </Section>

      <Section title="The parts">
        <ul>
          <li>
            <code>PanelHead</code>: the second head row, under the title: <code>Chips</code> (a row of{" "}
            <code>StatusChip</code> / <code>ToneChip</code>) and a <code>FlowStrip</code>.
          </li>
          <li>
            <code>FlowStrip</code>: the record's stages; each step is <code>done</code> (green), <code>now</code> (blue),{" "}
            <code>hold</code> (amber), <code>bad</code> (red) or <code>todo</code>, with its time under it.
          </li>
          <li>
            <code>PanelTitle</code>: lets the body set the head's title and state word (the record's number once loaded).
          </li>
          <li>
            <code>PanelFoot</code>: the sticky action row: a "Next: …" <code>note</code> at the left, buttons at the right,
            one primary at most.
          </li>
          <li>
            <code>StatTiles</code>: the figures that decide the record, right under the tabs. <code>StatusLine</code>: one
            sentence on where it stands.
          </li>
          <li>
            <code>PanelSection</code>: a titled section with an optional <code>action</code>. <code>FoldSection</code>: one
            that folds and edits in place (the pencil calls <code>onEdit</code>; render the editor in <code>editor</code>{" "}
            while <code>editing</code>; Save and Cancel live inside it).
          </li>
          <li>
            <code>KeyValue</code>: label and value pairs; <code>copy</code> adds a copy button, <code>sub</code> a muted note.
            An empty value shows "—".
          </li>
          <li>
            <code>PanelColumns</code> + <code>PanelBlock</code>: two labelled blocks side by side (billing | shipping); they
            stack when the panel is narrow.
          </li>
        </ul>
      </Section>

      <Section title="Rules">
        <ul>
          <li>A row click opens the detail panel; row actions live in the row menu and the panel's foot.</li>
          <li>Sections of one record are tabs: the panel's own <code>tabs</code>, or <code>Tabs</code> inside the body.</li>
        </ul>
      </Section>

      <Section title="Props">
        <Props of="SlideOver" />
        <Props of="PanelHead" />
        <Props of="PanelFoot" />
        <Props of="PanelTitle" />
        <Props of="PanelTabCounts" />
        <Props of="Chips" />
        <Props of="FlowStrip" />
        <Props of="StatTiles" />
        <Props of="StatusLine" />
        <Props of="PanelSection" />
        <Props of="FoldSection" />
        <Props of="KeyValue" />
        <Props of="PanelColumns" />
        <Props of="PanelBlock" />
        <Props of="PanelStackProvider" />
      </Section>
    </Page>
  );
}

// ---------------------------------------------------------------- AppShell

export function AppShellPage() {
  return (
    <Page
      title="AppShell"
      lead="The app frame: an icon rail at the left, a top bar with a context switch, module tabs, the page title, the ⌘K button, appearance and the avatar, an optional banner, and the page."
    >
      <Section title="Examples">
        <Demo title="A module frame with useRailLayout" source={appShellDemo}>
          <AppShellDemo />
        </Demo>
        <p>
          The preview keeps its router in memory so its links do not move this page. The shell fills the window (100vh) by
          default; <code>{'style={{ height: "100%" }}'}</code> makes it fill a box instead.
        </p>
      </Section>

      <Section title="Usage">
        <Code>{`
const L = useRailLayout("orders", PRIMARY, UTILITY, (items) => items.filter((i) => can(i.permission)));

<AppShell rail={L.rail} utility={L.utility} {...L.shellProps}
  tabs={tabs} contexts={yards} activeContext={yard} onContext={setYard}
  title="Orders" user={{ initials: "SK", name: "Satyam" }} search={<PaletteButton />}>
  <Outlet />
  {L.menu}
</AppShell>
<CommandPalette pages={L.pages} />`}</Code>
        <p>
          Links go through the kit router (<code>useKitRouter</code>), so the shell imports no router; pass yours through{" "}
          <code>UIProvider router</code> (see <To to="/providers">Providers and router</To>).
        </p>
      </Section>

      <Section title="The slots">
        <ul>
          <li>
            <code>rail</code> and <code>utility</code>: the two icon groups (pages, then settings at the foot). An item is lit
            on its path and below it, unless <code>exact</code>; <code>active</code> lights it anyway (a sister page reached
            through its tabs).
          </li>
          <li>
            <code>brand</code>: the logo at the top of the rail (the first letter of <code>title</code> by default).{" "}
            <code>homeTo</code> makes it a link (a module's page list).
          </li>
          <li>
            <code>contexts</code> / <code>activeContext</code> / <code>onContext</code>: the switch at the top left (a yard, a
            company); <code>contextTitle</code> heads its list. Pass <code>[]</code> for none.
          </li>
          <li>
            <code>tabs</code>: module tabs (<code>to</code> through the router, or <code>href</code> for another app);{" "}
            <code>tabTrail</code> follows them.
          </li>
          <li>
            <code>search</code>: the ⌘K trigger (<code>PaletteButton</code>); <code>searchSide</code> sits beside it.
          </li>
          <li>
            <code>user</code>: the avatar's initials, name, a <code>badge</code> count and a <code>menu</code> (Sign out).
          </li>
          <li>
            <code>banner</code>: a full-width strip under the top bar (a read-only notice).
          </li>
          <li>The appearance popover is built in, and puts its settings in ⌘K.</li>
        </ul>
      </Section>

      <Section title="useRailLayout">
        <p>
          <code>useRailLayout(module, primary, utility, gate, pathname?)</code> joins the reader's saved page order (see{" "}
          <To to="/components/page-order">Page order</To>) to the shell. <code>gate</code> is the app's permission check:
          it gets every item (with its opaque <code>permission</code>) and returns the ones the person may open.
        </p>
        <Sig
          label="useRailLayout result"
          rows={[
            { name: "rail / utility", sig: "RailItem[]", does: "The allowed items in the saved order, without hidden ones. Pass to AppShell." },
            { name: "shellProps", sig: "{ onRailOrder, onRailMenu, railFoot }", does: "Spread into AppShell: drag to reorder, right-click to move or hide, and the Customize pages button at the rail's foot." },
            { name: "menu", sig: "ReactNode", does: "The right-click menu; render it once inside the shell." },
            { name: "pages", sig: "Array<RailItem & { hidden: boolean }>", does: "Every allowed page for CommandPalette, hidden ones too." },
          ]}
        />
        <p>
          It also adds "Hide this page from the rail", "Show hidden pages" and "Reset page order" to ⌘K. The last visible
          page of a group cannot be hidden.
        </p>
      </Section>

      <Section title="Rules">
        <ul>
          <li>
            Sister pages share one rail entry; the page switches between them with a <code>Seg</code> or <code>Tabs</code>{" "}
            in its toolbar.
          </li>
          <li>Opening a module goes to the last page used there; the logo can link to the module's page list.</li>
        </ul>
      </Section>

      <Section title="Props">
        <Props of="AppShell" />
        <Props of="AppearancePopover" />
      </Section>
    </Page>
  );
}

// ---------------------------------------------------------------- Appearance

export function AppearancePage() {
  return (
    <Page
      title="Appearance"
      lead="The reader's theme, density, detail panel width and detail view, remembered in this browser. AppearanceProvider keeps them; useAppearance reads and sets them; AppShell's appearance popover is the usual way in."
    >
      <Section title="Examples">
        <Demo title="Switch them live" source={appearanceDemo}>
          <AppearanceDemo />
        </Demo>
        <p>These are this site's own settings: the whole page follows, and the choice is kept for your next visit.</p>
      </Section>

      <Section title="Behaviour">
        <ul>
          <li>
            The provider sets <code>data-mds-theme</code>, <code>data-mds-density</code>, <code>data-mds-panel</code> and{" "}
            <code>data-mds-detail</code> on <code>{"<html>"}</code>; the stylesheet does the rest.
          </li>
          <li>
            Defaults: system theme, compact density (large on a touch screen), the default panel width and the side panel.
          </li>
          <li>
            The first render (and the server's) uses the defaults; the saved choices are read right after mount, before the
            first paint. They live under <code>{"<prefix>.theme"}</code>, <code>.density</code>, <code>.panel</code> and{" "}
            <code>.detail</code>.
          </li>
          <li>The system theme follows the operating system live.</li>
          <li>
            Full page is its own state: leaving it returns to the last of side panel or popup (<code>windowedView</code>).
          </li>
          <li>
            <code>applyAppearance(density, theme, panelWidth?, detailView?)</code> sets the same attributes; an app can run
            it in an inline script before the first paint.
          </li>
        </ul>
      </Section>

      <Section title="useAppearance">
        <p>
          Throws outside an <code>AppearanceProvider</code> (UIProvider includes one). <code>useAppearanceOptional()</code>{" "}
          returns <code>null</code> instead, for components that can do without it.
        </p>
        <Sig
          label="useAppearance result"
          rows={[
            { name: "theme / setTheme", sig: "'light' | 'dark' | 'system'", does: "The reader's choice." },
            { name: "resolvedTheme", sig: "'light' | 'dark'", does: "What is showing now (system resolved)." },
            { name: "density / setDensity", sig: "'compact' | 'comfortable' | 'large'", does: "Font size and row heights (40, 52 or 67 px rows)." },
            { name: "panelWidth / setPanelWidth", sig: "'narrow' | 'default' | 'wide' | 'wider'", does: "The slide-over's width: 560, 680, 800 or 960 px at compact density." },
            { name: "detailView / setDetailView", sig: "'panel' | 'popup' | 'full'", does: "Where a record opens." },
            { name: "windowedView", sig: "'panel' | 'popup'", does: "The view to return to from full page." },
          ]}
        />
        <p>
          The choices with their labels and hints are exported for your own settings screen: <code>THEMES</code>,{" "}
          <code>DENSITIES</code>, <code>PANEL_WIDTHS</code> and <code>DETAIL_VIEWS</code>.
        </p>
      </Section>

      <Section title="Props">
        <Props of="AppearanceProvider" />
      </Section>
    </Page>
  );
}

// ---------------------------------------------------------------- Placeholder

export function PlaceholderPage() {
  return (
    <Page title="Placeholder" lead="A section that is not available yet: its name in a toolbar, then a short muted message. Use it for a rail entry whose page is still to come.">
      <Section title="Examples">
        <Demo title="A section still to come" source={placeholderDemo}>
          <PlaceholderDemo />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <p>
          It renders a <code>mds-main</code> column, so it fills the shell's content area like any page. Without a{" "}
          <code>message</code> it says "This section is not available yet." For an empty list or panel, use{" "}
          <code>Empty</code> instead.
        </p>
      </Section>
      <Section title="Props">
        <Props of="Placeholder" />
      </Section>
    </Page>
  );
}
