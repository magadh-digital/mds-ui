// The helper pages: date(), the formats, locale and storage, form checks and hooks.
import type { ReactNode } from "react";
import { MiniTable, useKitRouter } from "@mds/ui";
import { Code, Demo, Page, Section } from "../ui";

import DatePlayground from "../demos/helpers/DatePlayground";
import datePlayground from "../demos/helpers/DatePlayground.tsx?raw";
import FormatsDemo from "../demos/helpers/FormatsDemo";
import formatsDemo from "../demos/helpers/FormatsDemo.tsx?raw";
import LocaleDemo from "../demos/helpers/LocaleDemo";
import localeDemo from "../demos/helpers/LocaleDemo.tsx?raw";
import FormChecksDemo from "../demos/helpers/FormChecksDemo";
import formChecksDemo from "../demos/helpers/FormChecksDemo.tsx?raw";
import DebouncedDemo from "../demos/helpers/DebouncedDemo";
import debouncedDemo from "../demos/helpers/DebouncedDemo.tsx?raw";

/** a link to another page of the site, through the kit's router */
function To({ to, children }: { to: string; children: ReactNode }) {
  const { Link } = useKitRouter();
  return <Link to={to}>{children}</Link>;
}

type SigRow = { name: string; sig: string; does: ReactNode };
/** a hand-written signature table (props.json covers components only) */
function Sig({ label, rows }: { label: string; rows: Array<SigRow> }) {
  return (
    <div className="doc-props">
      <MiniTable
        label={label}
        rows={rows}
        rowKey={(r) => r.name}
        cols={[
          { key: "name", header: "Name", cell: (r) => <code className="doc-prop">{r.name}</code> },
          { key: "sig", header: "Signature", cell: (r) => <code className="doc-type">{r.sig}</code> },
          { key: "does", header: "What it does", cell: (r) => r.does },
        ]}
      />
    </div>
  );
}

/** two plain columns: a token or input, and what it gives */
function Pairs({ label, head, rows }: { label: string; head: [string, string]; rows: Array<[string, ReactNode]> }) {
  return (
    <MiniTable
      label={label}
      rows={rows}
      rowKey={(r) => r[0]}
      cols={[
        { key: "a", header: head[0], cell: (r) => <code>{r[0]}</code> },
        { key: "b", header: head[1], cell: (r) => r[1] },
      ]}
    />
  );
}

// ---------------------------------------------------------------- date()

export function DatePage() {
  return (
    <Page
      title="date()"
      lead="The kit's own date type: the part of dayjs a list page needs, with no dependency. Values are immutable; every change returns a new date."
    >
      <Section title="Examples">
        <Demo title="Try an input and a format" source={datePlayground}>
          <DatePlayground />
        </Demo>
      </Section>

      <Section title="Making a date">
        <Pairs
          label="date inputs"
          head={["Call", "Gives"]}
          rows={[
            ["date()", "now"],
            ['date("2026-10-15")', "that day at local midnight. A date-only string is a local day, as in dayjs (native Date would read it as UTC midnight and shift it)."],
            ['date("2026-10-15 14:30")', "local time (a space or T, no zone; seconds and milliseconds optional)"],
            ['date("2026-10-15T09:00Z")', "an instant (any string with a zone goes through Date)"],
            ["date(1760500000000)", "milliseconds since 1970"],
            ["date(new Date())", "a copy of a Date (or of another date())"],
            ['date(null) · date("") · date("junk")', "invalid"],
            ["date(undefined)", "now, as dayjs: check for a missing value before calling date()"],
          ]}
        />
        <p>
          <code>isDate(v)</code> tells whether <code>v</code> is a value <code>date()</code> made; whether{" "}
          <code>date()</code> can read a value is <code>date(v).isValid()</code>.
        </p>
      </Section>

      <Section title="Format tokens">
        <p>
          <code>format(pattern)</code>, shown for Thursday 15 Oct 2026, 14:30:05.123 in India. The default pattern is{" "}
          <code>YYYY-MM-DDTHH:mm:ssZ</code>. Words in the pattern go in brackets, or their letters are read as tokens.
        </p>
        <Pairs
          label="format tokens"
          head={["Token", "Output"]}
          rows={[
            ["YYYY · YY", "2026 · 26"],
            ["MMMM · MMM · MM · M", "October · Oct · 10 · 10"],
            ["DD · D", "15 · 15"],
            ["dddd · ddd · dd · d", "Thursday · Thu · Th · 4 (0 = Sunday)"],
            ["HH · H", "14 · 14 (24-hour)"],
            ["hh · h", "02 · 2 (12-hour)"],
            ["mm · m", "30 · 30"],
            ["ss · s", "05 · 5"],
            ["SSS", "123"],
            ["A · a", "PM · pm"],
            ["Z · ZZ", "+05:30 · +0530"],
            ["[on] DD MMM", "on 15 Oct (text in brackets is printed as is)"],
          ]}
        />
        <p>Month and day names are English; for dates in other languages use Intl directly.</p>
      </Section>

      <Section title="Changing a date">
        <Code>{`
date().subtract(6, "day").startOf("day");     // a week's range: from
date().endOf("day");                          //                  to
date("2026-01-31").add(1, "month");           // 28 Feb 2026: the month's last day, never 3 Mar
date("2026-10-15").startOf("quarter");        // 1 Oct 2026
date("2026-10-15").startOf("week");           // Sunday 11 Oct, or Monday 12 Oct with weekStartsOn: 1`}</Code>
        <ul>
          <li>
            Units: <code>millisecond second minute hour day week month quarter year</code>, also plural, and the short{" "}
            <code>ms s m h d w M Q y</code>.
          </li>
          <li>
            <code>add</code> / <code>subtract</code>: a fractional amount rounds as dayjs does: days and weeks to the
            nearest whole day, months, quarters and years toward zero.
          </li>
          <li>
            <code>startOf</code> / <code>endOf</code>: <code>endOf</code> is the last millisecond (23:59:59.999 for a day).
            A week starts on the locale's <code>weekStartsOn</code> (Sunday by default; see{" "}
            <To to="/helpers/locale">Locale and storage</To>).
          </li>
          <li>
            Getters as dayjs: <code>year()</code>, <code>month()</code> (0–11), <code>date()</code> (1–31),{" "}
            <code>day()</code> (0 = Sunday), <code>hour()</code>, <code>minute()</code>, <code>second()</code>,{" "}
            <code>millisecond()</code>, <code>daysInMonth()</code>; and <code>valueOf()</code>, <code>toDate()</code>,{" "}
            <code>toISOString()</code>, <code>toJSON()</code>, <code>clone()</code>.
          </li>
        </ul>
      </Section>

      <Section title="Differences and comparisons">
        <ul>
          <li>
            <code>a.diff(b, unit, float?)</code> is <code>a − b</code> in whole units, truncated toward zero; pass{" "}
            <code>true</code> for the exact fraction. Days and weeks count calendar days, so a clock change or the time of
            day does not make one day read as 0.96. Months, quarters and years follow dayjs's month rule.
          </li>
          <li>
            <code>isBefore</code>, <code>isAfter</code>, <code>isSame</code>, <code>isSameOrBefore</code>,{" "}
            <code>isSameOrAfter</code> take any date input and an optional unit: <code>isSame(other, "month")</code> is true
            for any time in the same month.
          </li>
        </ul>
        <Code>{`
date("2026-10-15").diff("2026-10-01", "day");        // 14
date("2026-10-15").diff("2026-09-30", "month", true); // 0.5
date(order.due).isBefore(date(), "day");              // overdue: due before today`}</Code>
      </Section>

      <Section title="Invalid input">
        <p>
          An invalid date stays invalid through every change. <code>isValid()</code> is false, <code>format()</code> gives{" "}
          <code>"Invalid Date"</code>, <code>diff()</code> gives <code>NaN</code>, comparisons are false and{" "}
          <code>toJSON()</code> is <code>null</code>. The <To to="/helpers/formats">formats</To> show "—" instead.
        </p>
      </Section>
    </Page>
  );
}

// ---------------------------------------------------------------- formats

export function FormatsPage() {
  return (
    <Page
      title="Formats"
      lead="One way to show dates, times, numbers and money across the app. Every helper takes a missing or unreadable value and shows a quiet “—”."
    >
      <Section title="Examples">
        <Demo title="The formats on real values" source={formatsDemo}>
          <FormatsDemo />
        </Demo>
      </Section>
      <Section title="The helpers">
        <Sig
          label="format helpers"
          rows={[
            { name: "day", sig: "(v: DateLike) => string", does: "15 Oct 2026" },
            { name: "dayTime", sig: "(v: DateLike) => string", does: "15 Oct 2026, 02:30 PM" },
            { name: "hhmm", sig: "(v: DateLike) => string", does: "02:30 PM" },
            { name: "monthYear", sig: "(v: DateLike) => string", does: "Oct 2026" },
            { name: "ago", sig: "(v: DateLike, now = Date.now()) => string", does: "“just now” within a minute either way; “5m ago”, “3h ago”, “2d ago”, or “in 5m” for a future time; the date past 30 days." },
            { name: "num", sig: "(v: number | string | null | undefined, digits?: number) => string", does: "A number in the locale (1,23,456 in en-IN); digits fixes the decimals." },
            { name: "money", sig: "(v: number | string | null | undefined, digits?: number) => string", does: "Money in the locale's currency: ₹1,23,456 · ₹1,234.50 · -₹1,234. Whole amounts show no decimals, others the currency's; digits fixes them." },
            { name: "rupees", sig: "(v, digits?) => string", does: "Deprecated: always rupees. Use money, which follows the locale's currency." },
          ]}
        />
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            Numbers and money follow the kit's locale (<code>configureLocale</code>, or <code>UIProvider locale</code>); see{" "}
            <To to="/helpers/locale">Locale and storage</To>.
          </li>
          <li>Numeric strings are read as numbers (<code>money("1250")</code>); an empty string is missing.</li>
          <li>
            <code>@mds/ui</code> exports this <code>num</code>; the URL-search parser of the same name is{" "}
            <code>searchNum</code>.
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          Dates, money and numbers always go through these helpers, never a local <code>toLocaleString</code> or a
          hand-made format. An empty cell shows "—".
        </p>
      </Section>
    </Page>
  );
}

// ---------------------------------------------------------------- locale and storage

export function LocaleStoragePage() {
  return (
    <Page
      title="Locale and storage"
      lead="Two app-wide settings, set once before the first render: how numbers, money and weeks read, and where the reader's saved choices live."
    >
      <Section title="Examples">
        <Demo title="One set of values in three locales" source={localeDemo}>
          <LocaleDemo />
        </Demo>
        <p>
          The overview is on <To to="/locale">Locale and saved choices</To>; this page lists the functions.
        </p>
      </Section>
      <Section title="Locale">
        <Code>{`configureLocale({ locale: "en-US", currency: "USD", weekStartsOn: 1, fyStartMonth: 0 });`}</Code>
        <Sig
          label="locale functions"
          rows={[
            { name: "configureLocale", sig: "(l: Partial<KitLocale>) => void", does: "Merges into the locale in force. UIProvider's locale prop calls it." },
            { name: "kitLocale", sig: "() => Readonly<KitLocale>", does: "The locale in force." },
            { name: "localeNumber", sig: "(n: number, opts?: Intl.NumberFormatOptions) => string", does: "A number in the locale, with any Intl options; num and money are built on it." },
          ]}
        />
        <Pairs
          label="KitLocale fields"
          head={["Field", "Meaning (default)"]}
          rows={[
            ["locale", "a BCP 47 tag for number formatting (en-IN: 1,23,456)"],
            ["currency", "an ISO 4217 code for money() (INR)"],
            ["weekStartsOn", "the first day of a week, 0 = Sunday … 6 = Saturday (0); startOf('week') and the calendar follow it"],
            ["fyStartMonth", "the financial year's first month, 0 = January (3 = April); the date range's financial-year shortcut follows it"],
          ]}
        />
        <p>
          The setting is read when a value is formatted; components do not re-render when it changes. Set it before the
          first render.
        </p>
      </Section>
      <Section title="Storage">
        <Code>{`configureStorage({ prefix: "my-app.ui" });   // or <UIProvider storagePrefix="my-app.ui">`}</Code>
        <Sig
          label="storage functions"
          rows={[
            { name: "configureStorage", sig: "(opts: { prefix: string }) => void", does: "Sets the localStorage prefix (trailing dots dropped); “mds-ui” by default." },
            { name: "storageKey", sig: "(name: string) => string", does: "The key for one saved choice: <prefix>.<name>. Use it for an app's own saved choices so they sit with the kit's." },
          ]}
        />
        <p>
          Kept under the prefix: theme, density, panel width and detail view, each table's column picks and widths, each
          list page's columns (<code>useListState</code>), each module's page order, and recent ⌘K items.
        </p>
      </Section>
    </Page>
  );
}

// ---------------------------------------------------------------- form checks

export function FormChecksPage() {
  return (
    <Page
      title="Form checks"
      lead="Small rules that run before Send, so a form says what is wrong per field while the person is still on it. The service's own field errors land on the same fields."
    >
      <Section title="Examples">
        <Demo title="Check, send, and show the service's refusal" source={formChecksDemo}>
          <FormChecksDemo />
        </Demo>
      </Section>
      <Section title="Rules">
        <p>
          A rule takes a value and gives a sentence, or <code>null</code> when it passes. Every rule except{" "}
          <code>required</code> lets an empty value pass, so optional fields need no special case.
        </p>
        <Sig
          label="rules"
          rows={[
            { name: "required", sig: '(what = "this") => Rule', does: "“Name is required” when blank (whitespace counts as blank)." },
            { name: "numberIn", sig: "({ min?, max?, unit?, integer?, positive? }) => Rule", does: "A number in [min, max]: “must be a number”, “at least 1 bag”, “at most 50 tonnes”, “must be a whole number”, “must be more than 0”." },
            { name: "dateLike", sig: "Rule", does: "A real calendar day written YYYY-MM-DD; 2026-02-30 is refused." },
            { name: "digits", sig: '(n: number, what = "number") => Rule', does: "Exactly n digits: “PIN code must be 6 digits”." },
            { name: "maxLen", sig: "(n: number) => Rule", does: "“at most 60 characters”." },
            { name: "all", sig: "(...rules: Rule[]) => Rule", does: "The first failing rule's sentence." },
            { name: "check", sig: "(values: Record<string, unknown>, rules: Record<string, Rule>) => FieldErrors", does: "One rule per field; the failures as { field: sentence }. {} means the form may be sent." },
          ]}
        />
      </Section>
      <Section title="useFormErrors">
        <Sig
          label="useFormErrors result"
          rows={[
            { name: "set", sig: "(e: FieldErrors) => void", does: "Show these field errors (the result of check)." },
            { name: "fromError", sig: "(e: unknown) => void", does: "From a refused request: an error with a fields array ({ field, message }) lands per field, a nested “lines.0.qty” under both the full path and “qty”; any other error becomes general." },
            { name: "clear", sig: "() => void", does: "Clear everything (on success)." },
            { name: "at", sig: "(k: string) => string | undefined", does: "The error for one field: pass it to FormRow error." },
            { name: "first", sig: "string | null", does: "The first field error, else the general one: for a toast or beside the Send button." },
            { name: "errors / general / has", sig: "FieldErrors / string | null / boolean", does: "The raw state." },
          ]}
        />
      </Section>
      <Section title="Usage">
        <ul>
          <li>
            Show each error on its field with <code>FormRow error={"{f.at(\"name\")}"}</code>; the row marks its control
            invalid and links the message for screen readers.
          </li>
          <li>Validate before sending, and show a toast on success.</li>
        </ul>
      </Section>
    </Page>
  );
}

// ---------------------------------------------------------------- hooks

export function HooksPage() {
  return (
    <Page title="Hooks" lead="useDebounced: a value that settles, for search boxes that query a server.">
      <Section title="Examples">
        <Demo title="Filter on the settled text" source={debouncedDemo}>
          <DebouncedDemo />
        </Demo>
      </Section>
      <Section title="useDebounced">
        <Sig
          label="useDebounced"
          rows={[
            { name: "useDebounced", sig: "<T>(value: T, delay: number) => T", does: "value, but it changes only after value has stayed the same for delay ms. The first render returns value at once." },
          ]}
        />
        <Code>{`
const [text, setText] = useState("");
const q = useDebounced(text.trim(), 300);
const partners = useQuery({ queryKey: ["partners", q], queryFn: () => api.partners(q) });`}</Code>
      </Section>
      <Section title="Rules">
        <ul>
          <li>Debounce with useDebounced, never a hand-made timer.</li>
          <li>
            A list page's toolbar search is already debounced by <To to="/components/list-state">useListState</To>; a
            server-searched picker is an <To to="/components/autocomplete">Autocomplete</To>.
          </li>
        </ul>
      </Section>
    </Page>
  );
}
