// The inputs pages: buttons, fields, forms, pickers, toggles, file input and the action bars.
import { Code, Demo, Page, Props, Section } from "../ui";

import ButtonVariants from "../demos/inputs/ButtonVariants";
import buttonVariants from "../demos/inputs/ButtonVariants.tsx?raw";
import ButtonLoading from "../demos/inputs/ButtonLoading";
import buttonLoading from "../demos/inputs/ButtonLoading.tsx?raw";
import IconAndLink from "../demos/inputs/IconAndLink";
import iconAndLink from "../demos/inputs/IconAndLink.tsx?raw";
import TextFields from "../demos/inputs/TextFields";
import textFields from "../demos/inputs/TextFields.tsx?raw";
import InvalidFields from "../demos/inputs/InvalidFields";
import invalidFields from "../demos/inputs/InvalidFields.tsx?raw";
import CheckboxList from "../demos/inputs/CheckboxList";
import checkboxList from "../demos/inputs/CheckboxList.tsx?raw";
import FormRowDemo from "../demos/inputs/FormRowDemo";
import formRowDemo from "../demos/inputs/FormRowDemo.tsx?raw";
import InlineInputDemo from "../demos/inputs/InlineInputDemo";
import inlineInputDemo from "../demos/inputs/InlineInputDemo.tsx?raw";
import AutocompleteSingle from "../demos/inputs/AutocompleteSingle";
import autocompleteSingle from "../demos/inputs/AutocompleteSingle.tsx?raw";
import AutocompleteMultiple from "../demos/inputs/AutocompleteMultiple";
import autocompleteMultiple from "../demos/inputs/AutocompleteMultiple.tsx?raw";
import AutocompleteGroups from "../demos/inputs/AutocompleteGroups";
import autocompleteGroups from "../demos/inputs/AutocompleteGroups.tsx?raw";
import AutocompleteServer from "../demos/inputs/AutocompleteServer";
import autocompleteServer from "../demos/inputs/AutocompleteServer.tsx?raw";
import DateRangeBasic from "../demos/inputs/DateRangeBasic";
import dateRangeBasic from "../demos/inputs/DateRangeBasic.tsx?raw";
import DateRangeWindow from "../demos/inputs/DateRangeWindow";
import dateRangeWindow from "../demos/inputs/DateRangeWindow.tsx?raw";
import DateRangeFinancialYear from "../demos/inputs/DateRangeFinancialYear";
import dateRangeFinancialYear from "../demos/inputs/DateRangeFinancialYear.tsx?raw";
import DateInputDemo from "../demos/inputs/DateInputDemo";
import dateInputDemo from "../demos/inputs/DateInputDemo.tsx?raw";
import ToggleFilter from "../demos/inputs/ToggleFilter";
import toggleFilter from "../demos/inputs/ToggleFilter.tsx?raw";
import ToggleField from "../demos/inputs/ToggleField";
import toggleField from "../demos/inputs/ToggleField.tsx?raw";
import ToggleMultiple from "../demos/inputs/ToggleMultiple";
import toggleMultiple from "../demos/inputs/ToggleMultiple.tsx?raw";
import SegDemo from "../demos/inputs/SegDemo";
import segDemo from "../demos/inputs/SegDemo.tsx?raw";
import PillsDemo from "../demos/inputs/PillsDemo";
import pillsDemo from "../demos/inputs/PillsDemo.tsx?raw";
import SwitchDemo from "../demos/inputs/SwitchDemo";
import switchDemo from "../demos/inputs/SwitchDemo.tsx?raw";
import FileInputPhotos from "../demos/inputs/FileInputPhotos";
import fileInputPhotos from "../demos/inputs/FileInputPhotos.tsx?raw";
import FileInputExisting from "../demos/inputs/FileInputExisting";
import fileInputExisting from "../demos/inputs/FileInputExisting.tsx?raw";
import ActionRowDemo from "../demos/inputs/ActionRowDemo";
import actionRowDemo from "../demos/inputs/ActionRowDemo.tsx?raw";
import BulkBarDemo from "../demos/inputs/BulkBarDemo";
import bulkBarDemo from "../demos/inputs/BulkBarDemo.tsx?raw";

export function ButtonsPage() {
  return (
    <Page
      title="Buttons"
      lead="Button for actions with a label, IconButton for an icon on its own, LinkButton for a quiet action inside text. Use them instead of a bare <button> with kit classes."
    >
      <Section title="Examples">
        <Demo title="Variants, sizes and icons" source={buttonVariants}>
          <ButtonVariants />
        </Demo>
        <Demo title="Loading while an action runs" source={buttonLoading}>
          <ButtonLoading />
        </Demo>
        <Demo title="IconButton and LinkButton" source={iconAndLink}>
          <IconAndLink />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            Every button is <code>type="button"</code> by default, so it never submits a form by accident. Pass{" "}
            <code>type="submit"</code> when you want that.
          </li>
          <li>
            <code>loading</code> swaps the icon for a spinner, disables the button and sets <code>aria-busy</code>. Clicks
            are blocked until you turn it off.
          </li>
          <li>
            <code>IconButton</code> needs a <code>label</code>: it becomes the screen-reader name and the hover text (unless
            you pass your own <code>title</code>). <code>active</code> sets <code>aria-pressed</code>, for an on / off icon.
          </li>
          <li>All three take the native button props and a <code>ref</code>.</li>
        </ul>
      </Section>
      <Section title="Rules">
        <ul>
          <li>
            One <code>primary</code> button per view: the action that matters. Everything else is outline, a link, or goes
            behind a <code>MoreMenu</code>.
          </li>
          <li>
            Destructive actions use <code>danger</code> and ask first (<code>ConfirmPop</code>, or <code>confirm</code> on an
            action). A disabled button carries a <code>title</code> that says why.
          </li>
        </ul>
      </Section>
      <Section title="Props">
        <h3>Button</h3>
        <Props of="Button" />
        <h3>IconButton</h3>
        <Props of="IconButton" />
        <h3>LinkButton</h3>
        <p>The native button props; it only adds the link look.</p>
        <Props of="LinkButton" />
      </Section>
    </Page>
  );
}

export function TextFieldsPage() {
  return (
    <Page
      title="Text fields"
      lead="Input, Textarea, Select and Checkbox: the native controls with the kit's look, an invalid state, and wiring to the FormRow around them."
    >
      <Section title="Examples">
        <Demo title="In a form" source={textFields}>
          <TextFields />
        </Demo>
        <Demo title="Invalid" source={invalidFields}>
          <InvalidFields />
        </Demo>
        <Demo title="Checkbox list with counts" source={checkboxList}>
          <CheckboxList />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            <code>Input</code>, <code>Textarea</code> and <code>Select</code> take every native prop and a <code>ref</code>.
            They stay plain controlled (or uncontrolled) elements.
          </li>
          <li>
            <code>invalid</code> gives a red border and <code>aria-invalid</code>. Inside a <code>FormRow</code> with an{" "}
            <code>error</code> the field turns invalid on its own, and the row's label, hint and error are wired to it (no{" "}
            <code>id</code> needed).
          </li>
          <li>
            <code>Select</code> takes <code>options</code> (or <code>&lt;option&gt;</code> children). <code>placeholder</code>{" "}
            adds a first, empty choice with the value <code>""</code>.
          </li>
          <li>
            <code>Textarea</code> starts at 3 rows.
          </li>
          <li>
            <code>Checkbox</code> calls <code>onChange(checked)</code> with a boolean, not the event. Its <code>label</code>{" "}
            is required and clickable; <code>count</code> shows a muted number after it, in the app's locale. It has no{" "}
            <code>invalid</code> state and does not read a FormRow's error.
          </li>
        </ul>
      </Section>
      <Section title="Which control">
        <ul>
          <li>2–4 fixed choices: <code>ToggleGroup</code>.</li>
          <li>5 or more fixed choices: <code>Select</code>.</li>
          <li>A list to search, or one that comes from the server: <code>Autocomplete</code>.</li>
          <li>
            One date: <code>DateInput</code>, never <code>&lt;input type="date"&gt;</code>.
          </li>
        </ul>
      </Section>
      <Section title="Props">
        <h3>Input</h3>
        <Props of="Input" />
        <h3>Textarea</h3>
        <Props of="Textarea" />
        <h3>Select</h3>
        <Props of="Select" />
        <h3>Checkbox</h3>
        <Props of="Checkbox" />
      </Section>
    </Page>
  );
}

export function FormsPage() {
  return (
    <Page
      title="Forms"
      lead="FormRow lays out one field: label and hint on the left, the control and its error on the right. SaveBar shows while the form has unsaved changes. InlineInput edits one value inside a row."
    >
      <Section title="Examples">
        <Demo title="FormRow and SaveBar" source={formRowDemo}>
          <FormRowDemo />
        </Demo>
        <Demo title="InlineInput in a table" source={inlineInputDemo}>
          <InlineInputDemo />
        </Demo>
      </Section>
      <Section title="How FormRow labels the control">
        <ul>
          <li>
            The kit control inside registers itself with the row. The label's <code>htmlFor</code> points at it, and{" "}
            <code>hint</code> and <code>error</code> become its <code>aria-describedby</code>. This works for{" "}
            <code>Input</code>, <code>Select</code>, <code>Textarea</code>, <code>Autocomplete</code>, <code>DateInput</code>{" "}
            and <code>FileInput</code>. A <code>DateRange</code> takes the row's label as its name, but not the hint or
            error.
          </li>
          <li>
            For a control that is not the kit's, give it an <code>id</code> and pass the same id as <code>htmlFor</code>.
          </li>
          <li>
            An <code>error</code> shows under the control and marks it invalid. <code>required</code> adds a muted "*" and
            "(required)" for screen readers; it does not check anything.
          </li>
          <li>
            The label goes through the glossary (<code>TermsProvider</code>), so a known term gets its hover.
          </li>
          <li>
            <code>Checkbox</code>, <code>Switch</code> and <code>ToggleGroup</code> carry their own labels; give a
            ToggleGroup its <code>label</code> too.
          </li>
        </ul>
      </Section>
      <Section title="SaveBar">
        <ul>
          <li>
            Renders nothing while <code>dirty</code> is false. When dirty it sticks to the bottom with "Unsaved changes",
            Discard and the save button.
          </li>
          <li>
            <code>saving</code> disables both buttons and the save button reads "Saving…".
          </li>
          <li>
            Validate in <code>onSave</code> before you send (<code>check</code>, <code>required</code>,{" "}
            <code>useFormErrors</code>), put each message on its FormRow, and show a toast when it saves.
          </li>
        </ul>
      </Section>
      <Section title="InlineInput">
        <ul>
          <li>
            Calls <code>onCommit</code> on blur or Enter, and only when the text changed. Esc puts the old value back.
          </li>
          <li>
            A new <code>value</code> from the caller shows only while the field is not being edited, so a refetch never
            overwrites what someone is typing.
          </li>
          <li>
            In a table there is no visible label: pass <code>label</code> ("Rate for TMT bar 8 mm").
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          Forms use <code>FormRow</code> (label, <code>required</code>, <code>error</code>, <code>hint</code>) and{" "}
          <code>SaveBar</code>. Validate before sending; show a toast on success.
        </p>
      </Section>
      <Section title="Props">
        <h3>FormRow</h3>
        <Props of="FormRow" />
        <h3>SaveBar</h3>
        <Props of="SaveBar" />
        <h3>InlineInput</h3>
        <Props of="InlineInput" />
      </Section>
    </Page>
  );
}

export function AutocompletePage() {
  return (
    <Page
      title="Autocomplete"
      lead="The kit's one searchable picker, for any list longer than a few fixed choices: partners, accounts, products, warehouses. It picks one value or several, filters locally or shows what your server found."
    >
      <Section title="Examples">
        <Demo title="One pick" source={autocompleteSingle}>
          <AutocompleteSingle />
        </Demo>
        <Demo title="Several picks as chips" source={autocompleteMultiple}>
          <AutocompleteMultiple />
        </Demo>
        <Demo title="Groups and disabled rows" source={autocompleteGroups}>
          <AutocompleteGroups />
        </Demo>
        <Demo title="Server search" source={autocompleteServer}>
          <AutocompleteServer />
        </Demo>
      </Section>
      <Section title="Options">
        <p>
          Map your data once to <code>{"{ value, label }"}</code> rows. <code>hint</code> is a muted second part (a city, a
          code), <code>keywords</code> are extra words to match that the row does not show, <code>group</code> puts rows
          under a heading and <code>disabled</code> greys a row out.
        </p>
      </Section>
      <Section title="Keyboard and mouse">
        <ul>
          <li>A click, ↓ or ↑ opens the list. Typing opens it too and filters it.</li>
          <li>
            The filter is a case- and accent-blind "contains" over the label, hint and keywords ("ram" finds "Rām Traders").
          </li>
          <li>
            While the list is open one enabled row is always highlighted (the pick, else the first match), so Enter picks
            it. ↓ ↑ move and skip disabled rows.
          </li>
          <li>Esc and Tab close the list without changing the pick. × clears the pick and keeps the focus in the box.</li>
          <li>Opening a single box shows the whole list with the pick ticked, not just rows matching its label.</li>
        </ul>
      </Section>
      <Section title="Several picks">
        <ul>
          <li>
            <code>multiple</code>: <code>value</code> is an array in click order; the picks show as chips under the box.
          </li>
          <li>
            The list stays open while you tick rows; ticking a picked row unticks it. Backspace in an empty box removes the
            last chip.
          </li>
          <li>
            A picked row that is <code>disabled</code> is locked: its chip has no ×, and neither Backspace nor the box's ×
            removes it.
          </li>
          <li>
            <code>onChange(values, options, cause)</code> says what happened: <code>"pick"</code>, <code>"remove"</code>{" "}
            or <code>"clear"</code>.
          </li>
          <li>
            The typed text stays after a pick so you can pick more from the same search; <code>clearSearchOnPick</code>{" "}
            empties it instead.
          </li>
        </ul>
      </Section>
      <Section title="Groups">
        <p>
          Headings listed in <code>groupOrder</code> come first, in that order; the other groups follow A→Z. Rows keep
          your order inside a group.
        </p>
      </Section>
      <Section title="Server search">
        <ul>
          <li>
            Pass <code>localFilter={"{false}"}</code> when your rows already are the server's matches (the server may match
            on fields the row does not show, like a GSTIN). The rows show as given.
          </li>
          <li>
            <code>onSearchChange</code> fires when the person types or clears, not when they pick. Debounce it with{" "}
            <code>useDebounced</code>.
          </li>
          <li>
            Opening the list calls <code>onSearchChange("")</code>, so it starts from the full list rather than the last
            search's rows.
          </li>
          <li>
            <code>loading</code> shows "Searching…" while the list is empty.
          </li>
          <li>
            <code>useKeepPicked</code> keeps the picked row in the list (ticked) after the search has moved on. For a pick
            saved earlier that the search never loaded, pass that row as the third argument so the box can show its
            label. For several saved picks, pass <code>pickedOptions</code>.
          </li>
        </ul>
        <Code>{`
// the saved partner comes with the record; the search rows come from the server
const options = useKeepPicked(rows, partnerId, record.partner && { value: record.partner.id, label: record.partner.name });

<Autocomplete options={options} localFilter={false} loading={isFetching}
  onSearchChange={setTerm} value={partnerId} onChange={setPartnerId} />`}</Code>
      </Section>
      <Section title="Rules">
        <p>
          Search-then-pick is one <code>Autocomplete</code>. Never put a search input next to a <code>&lt;select&gt;</code>{" "}
          or above a list of result buttons. For 2–4 fixed choices use a <code>ToggleGroup</code>; for a short fixed list a{" "}
          <code>Select</code>.
        </p>
      </Section>
      <Section title="Props">
        <Props of="Autocomplete" />
        <h3>useKeepPicked</h3>
        <Code>{`useKeepPicked(options: AutocompleteOption[], value: string | null | undefined, extra?: AutocompleteOption | null): AutocompleteOption[]`}</Code>
      </Section>
    </Page>
  );
}

export function DateRangePage() {
  return (
    <Page
      title="DateRange"
      lead="The date filter every list uses: one field, a calendar where a range is two clicks, a Day / Range switch and the usual shortcuts. For one date in a form use DateInput."
    >
      <Section title="Examples">
        <Demo title="A day or a range" source={dateRangeBasic}>
          <DateRangeBasic />
        </Demo>
        <Demo title="Always a window, fewer shortcuts" source={dateRangeWindow}>
          <DateRangeWindow />
        </Demo>
        <Demo title="The financial year follows the locale" source={dateRangeFinancialYear}>
          <DateRangeFinancialYear />
        </Demo>
      </Section>
      <Section title="Value">
        <p>
          <code>{"{ from, to }"}</code> as <code>YYYY-MM-DD</code> strings, easy to keep in the URL. A blank side is
          open-ended, and <code>{"{}"}</code> means every date (the field reads <code>emptyLabel</code>, "All time").
        </p>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            Day mode: one click picks the day and closes. Range mode: the first click sets one end, the hover previews the
            range, the second click sets the other end (in either order) and closes.
          </li>
          <li>
            Shortcuts: Today, Yesterday, 7 days and 30 days (both ending today), This month, Last month, This FY and All.
            One click applies it and closes; the multi-day ones switch to Range. The shortcut that matches the value is
            highlighted.
          </li>
          <li>
            "This FY" runs from the locale's <code>fyStartMonth</code> (April by default) for twelve months; its hover
            names the months ("Apr to Mar").
          </li>
          <li>
            <code>allowAll={"{false}"}</code> hides the All shortcut and the field's ×, for pages that must have a window.{" "}
            <code>presets</code> picks which shortcuts show.
          </li>
          <li>The calendar opens on the month of <code>from</code>. Weeks start on the locale's <code>weekStartsOn</code>.</li>
          <li>A second click on the field closes it, as do Esc and a click outside.</li>
        </ul>
      </Section>
      <Section title="Keyboard">
        <ul>
          <li>← → move a day, ↑ ↓ a week.</li>
          <li>Page Up / Page Down move a month; with Shift, a year.</li>
          <li>Home / End go to the start / end of the week. Enter or Space picks the day.</li>
          <li>Esc closes and returns the focus to the field.</li>
        </ul>
      </Section>
      <Section title="Helpers">
        <Code>{`
presetRange("30d")      // { from: "2026-09-16", to: "2026-10-15" }
presetRange("fy")       // the financial year around today, from configureLocale's fyStartMonth
rangeLabel(value)       // "Oct 1, 2026 – Oct 15, 2026", or "All time"

configureLocale({ fyStartMonth: 0, weekStartsOn: 1 });  // once, at start-up (or UIProvider locale={...})`}</Code>
      </Section>
      <Section title="Rules">
        <p>
          Dates use the kit picker. On a list page it goes in <code>Toolbar filters</code>; its shortcuts sit in two rows
          no wider than the calendar.
        </p>
      </Section>
      <Section title="Props">
        <Props of="DateRange" />
      </Section>
    </Page>
  );
}

export function DateInputPage() {
  return (
    <Page
      title="DateInput"
      lead="One date in a form, such as a bill date or an expiry: the kit's calendar under a field that reads Oct 15, 2026. Use it instead of the browser's date input, which looks different in every browser."
    >
      <Section title="Examples">
        <Demo title="With min and max" source={dateInputDemo}>
          <DateInputDemo />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            The value is <code>YYYY-MM-DD</code>, or <code>""</code> for none. <code>onChange</code> gets the same.
          </li>
          <li>
            <code>min</code> / <code>max</code> grey out the days outside. They cannot be picked, and the arrow keys stop at
            the bounds.
          </li>
          <li>
            Today and Clear sit under the calendar. Today is disabled when today is outside the bounds. Clear and the
            field's × show only while a date is picked and <code>clearable</code> is on.
          </li>
          <li>
            <code>format</code> changes how the field reads the date (default <code>MMM D, YYYY</code>).
          </li>
          <li>
            Inside a <code>FormRow</code> the row's label names it; elsewhere pass <code>label</code>. The keys are the same
            as DateRange's calendar.
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          One date in a form is a <code>DateInput</code>; never <code>&lt;input type="date"&gt;</code>. A date filter on a
          list is a <code>DateRange</code>.
        </p>
      </Section>
      <Section title="Props">
        <Props of="DateInput" />
      </Section>
    </Page>
  );
}

export function ToggleGroupPage() {
  return (
    <Page
      title="ToggleGroup"
      lead="A filter with 2–4 choices, all visible, one click to pick. Nothing picked means all rows, so there is no All button."
    >
      <Section title="Examples">
        <Demo title="A filter with counts" source={toggleFilter}>
          <ToggleFilter />
        </Demo>
        <Demo title="A field that keeps one choice" source={toggleField}>
          <ToggleField />
        </Demo>
        <Demo title="Several at once" source={toggleMultiple}>
          <ToggleMultiple />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            The value is the picked choice, or <code>""</code> for none (no filter). Clicking the picked choice again
            clears it; its hover says "Click again to show all".
          </li>
          <li>
            <code>clearable={"{false}"}</code> keeps one choice picked, for a form field rather than a filter.
          </li>
          <li>
            <code>multiple</code>: the value is an array, always in the options' order whatever the click order. None picked
            means no filter.
          </li>
          <li>
            <code>count</code> shows a muted number after the label, in the app's locale. Each button is a toggle (
            <code>aria-pressed</code>); <code>label</code> names the group.
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          2–4 choices: a <code>ToggleGroup</code>, with no "All" button. 5 or more: a <code>Select</code>. A searchable
          list: an <code>Autocomplete</code>. A view switch (not a filter): a <code>Seg</code>.
        </p>
      </Section>
      <Section title="Props">
        <Props of="ToggleGroup" />
      </Section>
    </Page>
  );
}

export function SegPillsPage() {
  return (
    <Page
      title="Seg and Pills"
      lead="Seg switches between views of the same data (List / Board, Day / Range), or between sister pages in a toolbar. Pills are smaller buttons for one choice, such as a chart's period. Neither is a filter."
    >
      <Section title="Examples">
        <Demo title="Seg" source={segDemo}>
          <SegDemo />
        </Demo>
        <Demo title="Pills" source={pillsDemo}>
          <PillsDemo />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>Both always have one choice picked; clicking it again does nothing.</li>
          <li>
            <code>Seg</code> is a radio group: Tab reaches the picked choice, ← → (and Home / End) pick the next one.
          </li>
          <li>
            <code>Pills</code> are toggle buttons; the picked one carries a tick, so it does not rely on colour alone.
            Labels are plain strings.
          </li>
          <li>
            Give both a <code>label</code> for screen readers.
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          A filter with 2–4 choices is a <code>ToggleGroup</code> (it can be cleared); a view switch is a <code>Seg</code>.
          Sections of one record are <code>Tabs</code>.
        </p>
      </Section>
      <Section title="Props">
        <h3>Seg</h3>
        <Props of="Seg" />
        <h3>Pills</h3>
        <Props of="Pills" />
      </Section>
    </Page>
  );
}

export function SwitchPage() {
  return (
    <Page
      title="Switch"
      lead="An on / off setting that takes effect when flipped, such as a notification or an active flag. In a form saved with a SaveBar, or a filter list, use a Checkbox."
    >
      <Section title="Examples">
        <Demo title="With a label, and icon-only in a table" source={switchDemo}>
          <SwitchDemo />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            <code>onChange</code> gets the new boolean. The control is a <code>role="switch"</code> button with{" "}
            <code>aria-checked</code>, so Space and Enter flip it.
          </li>
          <li>
            <code>label</code> is required. It shows beside the switch and the whole row is clickable;{" "}
            <code>hideLabel</code> keeps it for screen readers only (a table cell).
          </li>
        </ul>
      </Section>
      <Section title="Props">
        <Props of="Switch" />
      </Section>
    </Page>
  );
}

export function FileInputPage() {
  return (
    <Page
      title="FileInput"
      lead="The kit's one file picker: click or drop, the type / size / count checks, and previews that open in the file viewer. Your page keeps its own upload request."
    >
      <Section title="Examples">
        <Demo title="Several photos" source={fileInputPhotos}>
          <FileInputPhotos />
        </Demo>
        <Demo title="An edit form with saved files" source={fileInputExisting}>
          <FileInputExisting />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            Controlled: <code>files</code> is the picked <code>File</code> list and <code>onChange</code> gets the next one.
            Without <code>multiple</code> a new file replaces the old one.
          </li>
          <li>
            <code>accept</code> takes extensions (<code>.xlsx</code>), wildcards (<code>image/*</code>) and exact types (
            <code>application/pdf</code>), comma-separated. <code>maxSizeMb</code> refuses larger files.{" "}
            <code>maxFiles</code> keeps the first ones and says "At most N files".
          </li>
          <li>
            A refused file is named under the zone with the reason, and does not change the list.
          </li>
          <li>
            The hint under the prompt is built from <code>accept</code>, <code>maxSizeMb</code> and <code>maxFiles</code>{" "}
            ("images · up to 5 MB · max 3"); <code>hint</code> replaces it.
          </li>
          <li>
            Thumbnails open in the file viewer as one list, saved files first: ← → move, zoom, rotate, PDFs inline. New
            files have a remove ×; <code>existing</code> files are shown only.
          </li>
          <li>
            Inside a <code>FormRow</code> the row's label names the drop zone; elsewhere pass <code>label</code>.
          </li>
        </ul>
      </Section>
      <Section title="Uploading">
        <Code>{`
const body = new FormData();
photos.forEach((f) => body.append("photos", f));   // your field names stay
await api.post(\`/deliveries/\${id}/photos\`, body);`}</Code>
      </Section>
      <Section title="Rules">
        <p>
          Pick or upload files with <code>FileInput</code>; open a file with <code>useFileViewer</code> and{" "}
          <code>FileThumb</code>. Never <code>window.open</code> a photo or build a lightbox.
        </p>
      </Section>
      <Section title="Props">
        <Props of="FileInput" />
      </Section>
    </Page>
  );
}

export function ActionsPage() {
  return (
    <Page
      title="ActionRow and BulkBar"
      lead="ActionRow holds the actions for one record in its panel. BulkBar shows above a table while rows are selected and holds the actions for all of them. Both take the same Action objects as the row menu."
    >
      <Section title="Examples">
        <Demo title="ActionRow for one record" source={actionRowDemo}>
          <ActionRowDemo />
        </Demo>
        <Demo title="BulkBar for selected rows" source={bulkBarDemo}>
          <BulkBarDemo />
        </Demo>
      </Section>
      <Section title="The Action">
        <Code>{`
type Action = {
  key: string;
  label: string;
  onClick?: (reason?: string) => void | Promise<unknown>;
  primary?: boolean;   // the one filled button
  danger?: boolean;
  disabled?: boolean;
  title?: string;      // say why it is disabled
  icon?: ReactNode;    // shown on buttons, not on links
  confirm?: { title: string; description?: ReactNode; confirmLabel?: string; danger?: boolean;
              reason?: { label: string; required?: boolean }; typed?: string };
  element?: ReactNode; // your own element instead (ActionRow and BulkBar only)
};`}</Code>
        <p>
          With <code>confirm</code> the action asks in a small popover first; the typed reason reaches{" "}
          <code>onClick</code>. Destructive deletes pass <code>typed: "DELETE"</code>. The popover closes when{" "}
          <code>onClick</code> resolves and stays open if it throws, so the person can try again.
        </p>
      </Section>
      <Section title="ActionRow">
        <ul>
          <li>
            The first two <code>buttons</code> show as full-width buttons (<code>primary</code> fills the one that matters).
            Any further buttons are not shown, so put them in <code>links</code>.
          </li>
          <li>
            <code>links</code> sit in a second row as text links and wrap when they run out of room.
          </li>
        </ul>
      </Section>
      <Section title="BulkBar">
        <ul>
          <li>
            Renders nothing while <code>count</code> is 0. It shows the count with <code>unit</code>, an optional{" "}
            <code>summary</code> (the selected total) and Clear.
          </li>
          <li>
            Pass only the actions every selected row allows. The first <code>primary</code> one is filled, one more is
            outlined, the rest are links. Actions with no <code>onClick</code>, <code>confirm</code> or{" "}
            <code>element</code> are left out.
          </li>
          <li>
            A confirm adds "Applies to N {"<unit>"}." to its text, so the person sees how many rows it touches.
          </li>
          <li>
            <code>total</code> with <code>onSelectAll</code> offers "Select all N" when only one page is picked.
          </li>
          <li>
            <code>children</code> are inputs the action needs (a UTR, a note); they sit just before the buttons.
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          Row actions go in the row menu (<code>onRowContextMenu</code> with <code>actionsToMenu</code>), never a cell full
          of buttons. Risky actions ask first with <code>confirm</code>.
        </p>
      </Section>
      <Section title="Props">
        <h3>ActionRow</h3>
        <Props of="ActionRow" />
        <h3>BulkBar</h3>
        <Props of="BulkBar" />
      </Section>
    </Page>
  );
}
