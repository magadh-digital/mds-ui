// The display pages: chips, toolbar figures, tabs, empty states, feedback, avatars, the file viewer, dots, cards and
// charts, the lane strip and glossary hovers.
import { Code, Demo, Page, Props, Section } from "../ui";
import ToneChips from "../demos/display/ToneChips";
import toneChips from "../demos/display/ToneChips.tsx?raw";
import StatusChips from "../demos/display/StatusChips";
import statusChips from "../demos/display/StatusChips.tsx?raw";
import StatusWords from "../demos/display/StatusWords";
import statusWords from "../demos/display/StatusWords.tsx?raw";
import ToolbarStatsDemo from "../demos/display/ToolbarStatsDemo";
import toolbarStatsDemo from "../demos/display/ToolbarStatsDemo.tsx?raw";
import TabsDemo from "../demos/display/TabsDemo";
import tabsDemo from "../demos/display/TabsDemo.tsx?raw";
import EmptyDemo from "../demos/display/EmptyDemo";
import emptyDemo from "../demos/display/EmptyDemo.tsx?raw";
import SpinnerKbd from "../demos/display/SpinnerKbd";
import spinnerKbd from "../demos/display/SpinnerKbd.tsx?raw";
import ProgressDemo from "../demos/display/ProgressDemo";
import progressDemo from "../demos/display/ProgressDemo.tsx?raw";
import AvatarDemo from "../demos/display/AvatarDemo";
import avatarDemo from "../demos/display/AvatarDemo.tsx?raw";
import FileViewerDemo from "../demos/display/FileViewerDemo";
import fileViewerDemo from "../demos/display/FileViewerDemo.tsx?raw";
import FileThumbSizes from "../demos/display/FileThumbSizes";
import fileThumbSizes from "../demos/display/FileThumbSizes.tsx?raw";
import DotHealth from "../demos/display/DotHealth";
import dotHealth from "../demos/display/DotHealth.tsx?raw";
import EntityCards from "../demos/display/EntityCards";
import entityCards from "../demos/display/EntityCards.tsx?raw";
import SeriesChartDemo from "../demos/display/SeriesChartDemo";
import seriesChartDemo from "../demos/display/SeriesChartDemo.tsx?raw";
import TimelinesStrip from "../demos/display/TimelinesStrip";
import timelinesStrip from "../demos/display/TimelinesStrip.tsx?raw";
import LaneStripDemo from "../demos/display/LaneStripDemo";
import laneStripDemo from "../demos/display/LaneStripDemo.tsx?raw";
import GlossaryDemo from "../demos/display/GlossaryDemo";
import glossaryDemo from "../demos/display/GlossaryDemo.tsx?raw";

export function ChipsPage() {
  return (
    <Page
      title="Chips"
      lead="The kit's one status or tag chip. StatusChip turns a raw status word into a toned, readable chip; ToneChip is the chip itself, for tags and anything that is not a status."
    >
      <Section title="Examples">
        <Demo title="ToneChip" source={toneChips}>
          <ToneChips />
        </Demo>
        <Demo title="StatusChip" source={statusChips}>
          <StatusChips />
        </Demo>
        <Demo title="statusTone and statusLabel" source={statusWords}>
          <StatusWords />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            Tones: <code>ok</code>, <code>warn</code>, <code>error</code>, <code>accent</code>, <code>neutral</code>,{" "}
            <code>muted</code> and <code>purple</code> (for tags). The colour comes from a theme variable, so it reads in light
            and dark.
          </li>
          <li><code>dim</code> fades a chip (an unused provider, a past item). With <code>onClick</code> the chip is a button.</li>
          <li>
            <code>statusTone(status, fallback = "accent", overrides?)</code>: <code>approved</code>, <code>paid</code>,{" "}
            <code>delivered</code>… are ok; <code>pending</code>, <code>draft</code>, <code>in progress</code>… warn;{" "}
            <code>rejected</code>, <code>cancelled</code>, <code>overdue</code>… error; <code>inactive</code>,{" "}
            <code>archived</code>, <code>not required</code>… muted; anything else the fallback. Case, spaces and underscores
            don't matter. An empty status is muted.
          </li>
          <li>
            <code>statusLabel(status, keep?)</code>: <code>ON_HOLD</code> → "On hold". Words in <code>keep</code> stay in
            capitals. An empty value reads "—".
          </li>
          <li>
            <code>StatusChip</code> uses both: <code>tones</code> gives the page's own words first, <code>keep</code> the
            abbreviations, and <code>tone</code> / <code>label</code> override outright. No status and no label shows a quiet "—".
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          Use <code>StatusChip</code> / <code>ToneChip</code> with plain-word labels. No local colour tables or hex colours, and
          never a raw enum on screen ("Shop visit", not <code>SHOP_VISIT</code>).
        </p>
      </Section>
      <Section title="Props">
        <p><code>ToneChip</code>'s <code>children</code> is the chip's text.</p>
        <Props of="ToneChip" />
        <Props of="StatusChip" />
      </Section>
    </Page>
  );
}

export function ToolbarStatsPage() {
  return (
    <Page
      title="ToolbarStats"
      lead="A page's headline figures, inline in its Toolbar: the day's totals, counts per state. A figure can be a button that filters the list."
    >
      <Section title="Examples">
        <Demo title="In a Toolbar" source={toolbarStatsDemo}>
          <ToolbarStatsDemo />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            Each item has a <code>label</code> and <code>value</code>; <code>sub</code> adds a muted part after the value ("/ 52"),
            and <code>tone</code> colours the value.
          </li>
          <li>An item with <code>onClick</code> is a button; give it a <code>title</code> that says what the click does.</li>
          <li>An empty list renders nothing.</li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          Headline figures go in the toolbar (its children slot, before the page's buttons), never in a band above the table.
          A page that keeps its sidebar may put its summary in one block at the sidebar's top instead.
        </p>
      </Section>
      <Section title="Props">
        <Props of="ToolbarStats" />
      </Section>
    </Page>
  );
}

export function TabsPage() {
  return (
    <Page title="Tabs" lead="Tabs for the sections of one record or page (Details · Items · Files), with optional counts. You render the active section.">
      <Section title="Examples">
        <Demo title="Record sections" source={tabsDemo}>
          <TabsDemo />
        </Demo>
      </Section>
      <Section title="Keyboard">
        <ul>
          <li>← → move to the previous or next enabled tab and select it; Home / End go to the ends. Disabled tabs are skipped.</li>
          <li>Only the selected tab is in the Tab order. Counts are formatted in the app's locale.</li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          Tabs are for sections of one record. A filter of 2–4 choices is a <code>ToggleGroup</code>; a view switch is a{" "}
          <code>Seg</code>. Don't give a page a second tab row when it already has a view switch.
        </p>
      </Section>
      <Section title="Props">
        <Props of="Tabs" />
      </Section>
    </Page>
  );
}

export function EmptyPage() {
  return (
    <Page title="Empty" lead="The kit's one empty state: what is missing, why, and the next step. Tables say it through DenseTable's emptyText; panels, sections and pages use this.">
      <Section title="Examples">
        <Demo title="Full and compact" source={emptyDemo}>
          <EmptyDemo />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li><code>title</code> is one short line. <code>children</code> is a sentence on why. <code>action</code> is the next step.</li>
          <li><code>compact</code> is a single quiet line for a panel section; it shows the title and action only (no icon, no sentence).</li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>Use <code>Empty</code> (with <code>compact</code> inside panels) rather than a hand-made message. An empty table cell shows a quiet "—" instead.</p>
      </Section>
      <Section title="Props">
        <Props of="Empty" />
      </Section>
    </Page>
  );
}

export function FeedbackPage() {
  return (
    <Page title="Spinner, Progress and Kbd" lead="Small status pieces: something is loading, how far a job is, a key to press.">
      <Section title="Examples">
        <Demo title="Spinner and Kbd" source={spinnerKbd}>
          <SpinnerKbd />
        </Demo>
        <Demo title="Progress" source={progressDemo}>
          <ProgressDemo />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            <code>Spinner</code> is a live region; its <code>label</code> ("Loading" by default) is read by screen readers, and shown
            beside the icon with <code>showLabel</code>.
          </li>
          <li>
            <code>Progress</code> clamps <code>value</code> to 0–100 and shows the rounded percentage beside the label (hide it with{" "}
            <code>showValue={"{false}"}</code>). <code>value={"{null}"}</code> is a job with no known end: the bar slides.
          </li>
          <li><code>Kbd</code> draws one key; put several side by side for a chord.</li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          A table's loading state is its own veil and spinner (<code>DenseTable loading</code>), never a progress bar or
          skeleton rows. A button that runs an action uses <code>Button loading</code>.
        </p>
      </Section>
      <Section title="Props">
        <Props of="Spinner" />
        <Props of="Progress" />
        <p><code>Kbd</code> takes its key as <code>children</code>.</p>
      </Section>
    </Page>
  );
}

export function AvatarPage() {
  return (
    <Page title="Avatar" lead="A person or company as a small round badge: the photo when there is one, else up to two initials on a colour picked from the name.">
      <Section title="Examples">
        <Demo title="Initials, photos and sizes" source={avatarDemo}>
          <AvatarDemo />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>Initials are the first letters of the first and last words; a one-word name takes its first two letters. A leading "M/S" is skipped.</li>
          <li>The same name always gets the same colour.</li>
          <li>A photo that fails to load falls back to the initials.</li>
          <li>The name is the accessible name and, unless <code>title</code> is given, the hover text.</li>
        </ul>
      </Section>
      <Section title="Props">
        <Props of="Avatar" />
      </Section>
    </Page>
  );
}

export function FileViewerPage() {
  return (
    <Page
      title="File viewer"
      lead="The kit's one way to open an image or a file: a thumbnail that opens a full-screen viewer, with several files as one list, zoom and rotate for images, and PDFs inline."
    >
      <Section title="Examples">
        <Demo title="Several files" source={fileViewerDemo}>
          <FileViewerDemo />
        </Demo>
        <Demo title="FileThumb sizes and states" source={fileThumbSizes}>
          <FileThumbSizes />
        </Demo>
      </Section>
      <Section title="Usage">
        <Code>{`
const viewer = useFileViewer();
const files = photos.map((p) => ({ src: p.url, name: p.fileName, caption: \`\${p.by} · \${hhmm(p.at)}\` }));

{files.map((f, i) => <FileThumb key={f.src} file={f} onOpen={() => viewer.open(files, i)} />)}
{viewer.element}`}</Code>
        <p>
          <code>useFileViewer()</code> returns <code>{"{ open(files, index?), close, isOpen, element }"}</code>. A file is{" "}
          <code>{"{ src, name?, kind?, caption?, thumb? }"}</code>. <code>kind</code> ("image", "pdf" or "file") is guessed from the
          extension of <code>name</code>, then of the URL; pass it when neither has one.
        </p>
      </Section>
      <Section title="Keyboard">
        <ul>
          <li>← → (or the side arrows, or the strip of thumbnails) move between files; the head shows "2 / 5".</li>
          <li>+ / − zoom (50% to 400%), 0 resets, R rotates; double-click an image toggles 200%. Esc closes.</li>
          <li>Focus moves in on open, Tab stays inside, and focus returns on close. The keys don't fire while typing in a field or under a dialog.</li>
          <li>A click on the dark area around the file closes it. The page under it does not scroll, and its table keys stand aside.</li>
        </ul>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>Images fit the screen. PDFs render in a frame. Other files (a spreadsheet, a zip) get a card with Open and Download.</li>
          <li>A URL with no extension is tried as an image first, then shown in a frame.</li>
          <li>The head has Open in a new tab and Download for every file.</li>
          <li>
            <code>FileThumb</code> shows <code>emptyLabel</code> ("No file") when there is no file, "Unavailable" when the image fails,
            and a PDF / File tile for documents. Its click does not reach the row under it.
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          Never <code>window.open</code> a photo or build a lightbox. Build the file list from your own URLs. To pick or upload
          files, use <code>FileInput</code>.
        </p>
      </Section>
      <Section title="Props">
        <Props of="FileThumb" />
        <Props of="FileViewer" />
        <p><code>FileViewer</code> is what <code>useFileViewer().element</code> renders; mount it yourself only to own the index.</p>
      </Section>
    </Page>
  );
}

export function DotPage() {
  return (
    <Page title="Dot and HealthBar" lead="A status dot beside a word, and a row of coloured segments for a stretch of time (a day, hour by hour).">
      <Section title="Examples">
        <Demo title="Dots and a day's health" source={dotHealth}>
          <DotHealth />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            Tones are <code>ok</code>, <code>warn</code>, <code>error</code>, <code>accent</code> and <code>neutral</code>.{" "}
            <code>needs</code> draws a ring: the row is waiting for a person.
          </li>
          <li>
            A dot with <code>label</code> (or <code>title</code>) is announced ("Approval waiting, needs you"). Without either it is
            decoration beside a word that already says it, and screen readers skip it.
          </li>
          <li>
            <code>HealthBar</code> draws one segment per tone in <code>segments</code>. Screen readers hear a count per tone
            ("Health: 12 good, 2 warning, 2 problem"), or <code>label</code>. <code>labels</code> puts three time marks under it.
          </li>
        </ul>
      </Section>
      <Section title="Props">
        <Props of="Dot" />
        <Props of="HealthBar" />
      </Section>
    </Page>
  );
}

export function CardsChartsPage() {
  return (
    <Page
      title="Cards and charts"
      lead="Pieces for overview pages, drawn as plain SVG and CSS with no chart library: an overview card per entity, a series chart, per-entity health timelines and a strip of top tiles."
    >
      <Section title="Examples">
        <Demo title="EntityCard" source={entityCards}>
          <EntityCards />
        </Demo>
        <Demo title="SeriesChart" source={seriesChartDemo}>
          <SeriesChartDemo />
        </Demo>
        <Demo title="Timelines and IconStrip" source={timelinesStrip}>
          <TimelinesStrip />
        </Demo>
      </Section>
      <Section title="EntityCard">
        <ul>
          <li>
            Name with a type icon, a status <code>Dot</code> with a sub-label, a <code>HealthBar</code> with three time labels, an
            optional provider (an initial and a name) and a row of icon + value figures.
          </li>
          <li>
            <code>offline</code> dims the sub-label and provider and replaces the figures with <code>offlineNote</code> ("No recent activity" by default).
          </li>
          <li>With <code>onClick</code> the card is a button (Enter or Space opens it); without, it is plain content.</li>
          <li>Lay cards out in a <code>{'<div className="mds-cards">'}</code> grid (cards at least 230 px wide).</li>
        </ul>
      </Section>
      <Section title="SeriesChart">
        <ul>
          <li>
            Several series on one x axis. Day strings (<code>YYYY-MM-DD</code>) are sorted and read "15 Oct"; other{" "}
            <code>x</code> values keep the order they first appear in. <code>formatX</code> changes how a value reads. The
            chart measures its width, so the axis labels never stretch, with about one label per 90 px. A missing point
            counts as 0. <code>label</code> is its accessible name.
          </li>
          <li>The y axis rounds up to 1, 2 or 5 × a power of ten, with short labels (1.2k).</li>
          <li>One series gets a faint area under its line. Colours come from the theme unless a series gives <code>color</code>.</li>
          <li>The legend shows each series' total; hovering shows the values of the day under the pointer. <code>unit</code> follows each value.</li>
          <li>No points: the <code>empty</code> text shows instead.</li>
        </ul>
      </Section>
      <Section title="Timelines and IconStrip">
        <ul>
          <li>
            <code>Timelines</code>: one row per entity with a label, a health bar and a <code>right</code> figure. A row with{" "}
            <code>onOpen</code> has a chevron and opens on click, Enter or Space.
          </li>
          <li>
            <code>IconStrip</code>: tiles with a count above the icon and a truncated label below; a tile with{" "}
            <code>onClick</code> is a button. An empty list shows "—".
          </li>
        </ul>
      </Section>
      <Section title="Props">
        <Props of="EntityCard" />
        <Props of="SeriesChart" />
        <Props of="Timelines" />
        <Props of="IconStrip" />
      </Section>
    </Page>
  );
}

export function LaneStripPage() {
  return (
    <Page
      title="Lane strip"
      lead="A record's steps in lanes, grouped by who does them, as a workflow engine reports them: done, to do, blocked or not needed, with what each step waits for."
    >
      <Section title="Examples">
        <Demo title="A sales order's steps" source={laneStripDemo}>
          <LaneStripDemo />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            Each node shows a glyph for its state (✓ done, ! blocked, – not needed), an optional mono <code>tag</code>, its word (
            <code>what</code>), an optional party after an arrow (<code>to</code>) and a second line (<code>sub</code>).
          </li>
          <li>
            <code>join</code> is how a node meets the one before it in its lane: <code>needs</code> draws →, <code>beside</code> draws ||.{" "}
            <code>after</code> lists the steps of other lanes it waits for, as "↳ after …".
          </li>
          <li>
            <code>changed</code> marks a done step whose source changed since (warn tone); <code>current</code> marks the record the
            strip is shown for; <code>fact</code> draws a step quieter (something kept from elsewhere, not work).
          </li>
          <li>
            A node is a button that calls <code>onOpen(key)</code>, or with <code>pop</code> the trigger of a popover (a blocked step's
            reasons). Not-needed nodes are dimmed and can't be focused.
          </li>
          <li><code>mark</code> is a second glyph beside the state's; what it means and how it looks is up to the page.</li>
        </ul>
      </Section>
      <Section title="Keyboard">
        <ul>
          <li>← → move along the nodes, Enter opens one.</li>
          <li>
            In a table row of its own (DenseTable's second row), ↑ goes to the row above and ↓ to the row below, and ← from the first
            node goes back up. A table enters the strip at its first node.
          </li>
        </ul>
      </Section>
      <Section title="Props">
        <Props of="LaneStrip" />
        <p>
          A lane is <code>{"{ lane, label, nodes }"}</code>; a node is <code>LaneNode</code> (<code>key</code>, <code>state</code>,{" "}
          <code>what</code>, <code>join</code>, and the optional fields above).
        </p>
      </Section>
    </Page>
  );
}

export function GlossaryPage() {
  return (
    <Page
      title="Glossary hovers"
      lead="Words with a meaning on hover. Give the kit your glossary once; every table header and every Term that has an entry then shows what it means and the name it had before."
    >
      <Section title="Examples">
        <Demo title="Term, Code and old names" source={glossaryDemo}>
          <GlossaryDemo />
        </Demo>
      </Section>
      <Section title="Usage">
        <Code>{`
const glossary: Glossary = {
  lookup: (key) => entries[key],          // { d: "what it means", old?: "the old name" }
  label: (key) => labels[key] ?? key,     // the word to show for a coded key ("state:arrived" → "Arrived")
};

// once, for the whole app
<UIProvider glossary={glossary}>…</UIProvider>

// or for one part of it
<TermsProvider glossary={glossary}>…</TermsProvider>

<Term label="Net weight" />          // looked up by its text
<Term label="Arrived" k="state:arrived" />
<Code k="state:arrived" />           // label from glossary.label`}</Code>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            A word with an entry shows a Tip with the label, the description and "Old name: …". It also takes keyboard focus, so
            keyboard users see the meaning too.
          </li>
          <li>A word with no entry renders as plain text, so <code>Term</code> is safe on every header. With no glossary at all, every Term is plain text.</li>
          <li><code>DenseTable</code> and <code>MiniTable</code> wrap every column header in a <code>Term</code>.</li>
          <li>
            The "old names" choice (<code>useTerms().setOldNames</code>, also in the AppShell's appearance menu) adds the old name
            beside each label everywhere. It is saved per browser.
          </li>
          <li><code>Term</code> takes <code>children</code> to show something other than the label while looking the label up.</li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          The kit never imports the app's glossary; it comes in through <code>UIProvider glossary</code> or{" "}
          <code>TermsProvider</code>. Labels are plain words, never raw enum values.
        </p>
      </Section>
      <Section title="Props">
        <Props of="Term" />
        <Props of="Code" />
        <Props of="TermsProvider" />
      </Section>
    </Page>
  );
}
