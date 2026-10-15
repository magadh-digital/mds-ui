// The overlay pages: tooltip, popovers, confirms, menus, the dialog, toasts and the ⌘K palette.
import { Code, Demo, Page, Props, Section } from "../ui";
import TipBasic from "../demos/overlays/TipBasic";
import tipBasic from "../demos/overlays/TipBasic.tsx?raw";
import TipText from "../demos/overlays/TipText";
import tipText from "../demos/overlays/TipText.tsx?raw";
import PopBasic from "../demos/overlays/PopBasic";
import popBasic from "../demos/overlays/PopBasic.tsx?raw";
import PopControlled from "../demos/overlays/PopControlled";
import popControlled from "../demos/overlays/PopControlled.tsx?raw";
import EditPopRate from "../demos/overlays/EditPopRate";
import editPopRate from "../demos/overlays/EditPopRate.tsx?raw";
import HoverPopOrder from "../demos/overlays/HoverPopOrder";
import hoverPopOrder from "../demos/overlays/HoverPopOrder.tsx?raw";
import ConfirmPopReason from "../demos/overlays/ConfirmPopReason";
import confirmPopReason from "../demos/overlays/ConfirmPopReason.tsx?raw";
import ConfirmPopDelete from "../demos/overlays/ConfirmPopDelete";
import confirmPopDelete from "../demos/overlays/ConfirmPopDelete.tsx?raw";
import ActionConfirmDemo from "../demos/overlays/ActionConfirmDemo";
import actionConfirmDemo from "../demos/overlays/ActionConfirmDemo.tsx?raw";
import UseConfirmDemo from "../demos/overlays/UseConfirmDemo";
import useConfirmDemo from "../demos/overlays/UseConfirmDemo.tsx?raw";
import ConfirmDialogDemo from "../demos/overlays/ConfirmDialogDemo";
import confirmDialogDemo from "../demos/overlays/ConfirmDialogDemo.tsx?raw";
import RowMenuTable from "../demos/overlays/RowMenuTable";
import rowMenuTable from "../demos/overlays/RowMenuTable.tsx?raw";
import RowMenuButtonDemo from "../demos/overlays/RowMenuButtonDemo";
import rowMenuButtonDemo from "../demos/overlays/RowMenuButtonDemo.tsx?raw";
import MoreMenuDemo from "../demos/overlays/MoreMenuDemo";
import moreMenuDemo from "../demos/overlays/MoreMenuDemo.tsx?raw";
import FootActionsDemo from "../demos/overlays/FootActionsDemo";
import footActionsDemo from "../demos/overlays/FootActionsDemo.tsx?raw";
import DialogForm from "../demos/overlays/DialogForm";
import dialogForm from "../demos/overlays/DialogForm.tsx?raw";
import DialogSizes from "../demos/overlays/DialogSizes";
import dialogSizes from "../demos/overlays/DialogSizes.tsx?raw";
import ToastDemo from "../demos/overlays/ToastDemo";
import toastDemo from "../demos/overlays/ToastDemo.tsx?raw";
import PaletteDemo from "../demos/overlays/PaletteDemo";
import paletteDemo from "../demos/overlays/PaletteDemo.tsx?raw";

export function TipPage() {
  return (
    <Page
      title="Tip"
      lead="A short hint that shows on hover or keyboard focus. Use it for a word or two of extra meaning: what an icon does, the full name behind a code, the parts of a total."
    >
      <Section title="Examples">
        <Demo title="Placements" source={tipBasic}>
          <TipBasic />
        </Demo>
        <Demo title="On text" source={tipText}>
          <TipText />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>Opens 250 ms after the pointer arrives and closes 50 ms after it leaves. Keyboard focus opens it at once.</li>
          <li>Esc closes it. It flips to the other side when there is no room, and sits above every other layer.</li>
          <li>
            The child element itself becomes the trigger (it takes the ref and the hover props). Text that is not an element
            is wrapped in a span. Give a plain <code>span</code> trigger <code>tabIndex={"{0}"}</code> so keyboard users reach it.
          </li>
          <li>A disabled button gets no pointer events, so a Tip on it never shows. Put the reason in the button's <code>title</code> or wrap the button in a span.</li>
          <li>
            <code>IconButton</code> already shows its <code>label</code> as the native tooltip. Don't wrap it in a Tip, or two hints
            appear.
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          A Tip holds a hint, never content someone needs to act on. For a summary with figures or links, use{" "}
          <code>HoverPop</code>. For a glossary word, use <code>Term</code>.
        </p>
      </Section>
      <Section title="Props">
        <p>
          <code>children</code> is the trigger element.
        </p>
        <Props of="Tip" />
      </Section>
    </Page>
  );
}

export function PopPage() {
  return (
    <Page
      title="Pop and EditPop"
      lead="A small popover under its trigger. Pop holds any small content; EditPop is a small editor (a rate, a quantity, a few fields) that would otherwise open a second slide-over."
    >
      <Section title="Examples">
        <Demo title="Pop" source={popBasic}>
          <PopBasic />
        </Demo>
        <Demo title="Pop with controlled open state" source={popControlled}>
          <PopControlled />
        </Demo>
        <Demo title="EditPop" source={editPopRate}>
          <EditPopRate />
        </Demo>
      </Section>
      <Section title="Usage">
        <Code>{`
// Pop keeps its own open state
<Pop trigger={<Button>Contacts</Button>} label="Contacts">…</Pop>

// own the state to close it from inside, after a save
const [open, setOpen] = useState(false);
<Pop trigger={<Button>Change</Button>} open={open} onOpenChange={setOpen}>
  <Button onClick={() => { save(); setOpen(false); }}>Save</Button>
</Pop>

// EditPop's body is a function that gets close()
<EditPop trigger={<IconAction icon={Pencil} label="Edit rate" />} title="Edit rate">
  {(close) => <RateForm onSaved={close} />}
</EditPop>`}</Code>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>A click on the trigger opens and closes it. Esc or a press outside closes it.</li>
          <li>
            A press inside a list, calendar or row menu that the popover opened does not count as outside. Nested layers close
            one at a time on Esc.
          </li>
          <li>The body mounts only while open, so its queries run then and not with the page.</li>
          <li>Focus moves into the popover on open and back to the trigger on close. EditPop focuses the first field in its body.</li>
          <li>
            EditPop draws a title row with a × button. The title names the popover for screen readers. Without a title, pass{" "}
            <code>label</code>.
          </li>
          <li>
            Placement is one of <code>bottom-end</code> (default), <code>bottom-start</code>, <code>top-start</code>,{" "}
            <code>top-end</code>. It flips when there is no room.
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          Details of a record stay in the slide-over. Use EditPop for a small edit beside the value it changes, and show a
          toast on success. A trigger inside a table cell is an <code>IconAction</code>, never a text link.
        </p>
      </Section>
      <Section title="Props">
        <p>
          Pop's <code>children</code> is its body. EditPop's <code>children</code> is a function{" "}
          <code>{"(close: () => void) => ReactNode"}</code>.
        </p>
        <Props of="Pop" />
        <Props of="EditPop" />
      </Section>
    </Page>
  );
}

export function HoverPopPage() {
  return (
    <Page
      title="HoverPop"
      lead="A popover that opens on hover or focus, for a summary behind a cell: an order behind its number, a partner behind a name."
    >
      <Section title="Examples">
        <Demo title="Order summary" source={hoverPopOrder}>
          <HoverPopOrder />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            Opens after <code>delay</code> (300 ms by default) on pointer enter or focus, and closes 150 ms after the pointer
            leaves both the trigger and the popover. Moving onto the popover keeps it open.
          </li>
          <li>The body mounts only while open, so a list of 200 rows costs nothing until a row is hovered.</li>
          <li>Focus stays on the trigger; the popover does not take it. Esc or a press outside closes it.</li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          The summary must also be reachable another way (the row click opens the detail), since touch screens have no hover.
          For a one-line hint use <code>Tip</code>.
        </p>
      </Section>
      <Section title="Props">
        <Props of="HoverPop" />
      </Section>
    </Page>
  );
}

export function ConfirmPopPage() {
  return (
    <Page
      title="ConfirmPop and ActionConfirm"
      lead="Ask before a destructive or irreversible action, in a small popover under the button. It can ask for a reason and, for deletes, a word to type."
    >
      <Section title="Examples">
        <Demo title="With a required reason" source={confirmPopReason}>
          <ConfirmPopReason />
        </Demo>
        <Demo title="Destructive delete: type DELETE" source={confirmPopDelete}>
          <ConfirmPopDelete />
        </Demo>
        <Demo title="ActionConfirm from an Action" source={actionConfirmDemo}>
          <ActionConfirmDemo />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            <code>onConfirm(reason)</code> gets the trimmed reason (<code>""</code> without one). The button reads "Working…"
            while it runs, and the popover cannot be closed until it finishes.
          </li>
          <li>The popover closes when <code>onConfirm</code> resolves. When it throws, it stays open for another try; show your own error toast.</li>
          <li>
            The confirm button stays disabled until a required reason is filled in and the <code>typed</code> word matches
            exactly. Then Enter in the typed field confirms.
          </li>
          <li>Each opening starts clean: a reason or a typed word never carries over.</li>
          <li>
            <code>ActionConfirm</code> takes an <code>Action</code> with a <code>confirm</code> spec and asks with it; the reason
            reaches <code>a.onClick</code>. <code>extra</code> is added after the spec's description.
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          Never use <code>window.confirm</code>, <code>alert</code> or <code>prompt</code>. Destructive deletes pass{" "}
          <code>typed: "DELETE"</code>. With no button to sit under (a menu item, the end of a flow), use{" "}
          <code>useConfirm</code>.
        </p>
      </Section>
      <Section title="Props">
        <Props of="ConfirmPop" />
        <Props of="ActionConfirm" />
      </Section>
    </Page>
  );
}

export function ConfirmDialogPage() {
  return (
    <Page
      title="ConfirmDialog and useConfirm"
      lead="A confirm you start from code, in a small centred dialog. Same parts and same spec as ConfirmPop, for when there is no button to sit under."
    >
      <Section title="Examples">
        <Demo title="useConfirm" source={useConfirmDemo}>
          <UseConfirmDemo />
        </Demo>
        <Demo title="ConfirmDialog with its own state" source={confirmDialogDemo}>
          <ConfirmDialogDemo />
        </Demo>
      </Section>
      <Section title="Usage">
        <Code>{`
const ask = useConfirm();

const reason = await ask.confirm({ title: "Delete partner", danger: true, typed: "DELETE" });
if (reason === null) return;   // cancelled
await deletePartner(id);

// render once in the component
{ask.element}`}</Code>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            <code>confirm(spec)</code> resolves with the reason (<code>""</code> without one) or <code>null</code> when
            cancelled, when a newer <code>confirm</code> replaces it, or when the component holding the hook unmounts.
          </li>
          <li>
            With <code>useConfirm</code> the dialog closes as soon as the person confirms, and your work runs after the promise
            resolves. To keep the dialog open with "Working…" while a request runs (and open for a retry when it fails), render{" "}
            <code>ConfirmDialog</code> yourself with an async <code>onConfirm</code>.
          </li>
          <li>
            Enter in the typed field confirms (Enter in the reason box adds a line). Esc first leaves a focused field, then
            closes (answering <code>null</code>).
          </li>
          <li>
            Focus moves to the typed field (or the reason) on open. With <code>ConfirmDialog</code>, the dialog closes when{" "}
            <code>onConfirm</code> resolves and stays open when it throws.
          </li>
          <li>
            The confirm button is filled <code>primary</code>, or red with <code>danger</code>.
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>Use it for a confirm started by code; a confirm on a visible button is a ConfirmPop. Destructive deletes pass <code>typed: "DELETE"</code>.</p>
      </Section>
      <Section title="Props">
        <Props of="ConfirmDialog" />
      </Section>
    </Page>
  );
}

export function RowMenuPage() {
  return (
    <Page
      title="Row menu"
      lead="One list of actions per record, shown as a right-click menu on its row, under a ⋯ button, in a toolbar's More button and in a panel's foot."
    >
      <Section title="Examples">
        <Demo title="Table rows: useContextMenu and actionsToMenu" source={rowMenuTable}>
          <RowMenuTable />
        </Demo>
        <Demo title="RowMenuButton outside a table" source={rowMenuButtonDemo}>
          <RowMenuButtonDemo />
        </Demo>
        <Demo title="MoreMenu: a toolbar's secondary actions" source={moreMenuDemo}>
          <MoreMenuDemo />
        </Demo>
        <Demo title="FootActions: the panel foot" source={footActionsDemo}>
          <FootActionsDemo />
        </Demo>
      </Section>
      <Section title="Usage">
        <Code>{`
const menu = useContextMenu();

<DenseTable … onRowContextMenu={(row, at) => menu.open(at, actionsToMenu(actionsFor(row)), row.id)} />
{menu.element}

// anywhere else
<div onContextMenu={(e) => menu.open(e, items, "Title")}>…</div>
<RowMenuButton onOpen={(el) => menu.openAt(el, items, "Title")} />`}</Code>
        <p>
          <code>DenseTable</code> and <code>MiniTable</code> add the ⋯ button themselves when given{" "}
          <code>onRowContextMenu</code>. <code>actionsToMenu</code> turns <code>Action</code>s into <code>MenuItem</code>s and skips
          actions that have only an <code>element</code>.
        </p>
      </Section>
      <Section title="Keyboard">
        <ul>
          <li>The menu opens at the pointer, or under the element for <code>openAt</code>, and stays inside the window.</li>
          <li>↑ ↓ move between enabled items, Home / End jump to the ends, Enter or Space picks.</li>
          <li>Esc, a press outside, a scroll outside, a resize or leaving the window closes it. Focus goes back where it was.</li>
          <li>
            An item with <code>confirm</code> asks inside the menu (Back returns to the list). The reason reaches{" "}
            <code>onSelect</code>.
          </li>
          <li>
            When <code>onSelect</code> returns a promise, the menu stays open until it settles; when it throws, the menu stays
            open so the person sees what failed.
          </li>
          <li>Items keyed <code>copy</code> and <code>open</code> are moved to the end, after a separator, so the record's main action stays first.</li>
          <li>A disabled item shows its <code>title</code> as the reason on hover.</li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          Row actions go in a row menu, never a cell full of small buttons. A row click opens the detail. Risky items carry{" "}
          <code>confirm</code>; destructive deletes pass <code>typed: "DELETE"</code>. A toolbar has one primary button and
          one <code>MoreMenu</code>, never a band of buttons above the table.
        </p>
      </Section>
      <Section title="Props">
        <Props of="RowMenuButton" />
        <Props of="MoreMenu" />
        <Props of="FootActions" />
        <Props of="ContextMenu" />
        <p>
          <code>useContextMenu()</code> returns <code>{"{ menu, open(at, items, title?), openAt(el, items, title?), close, element }"}</code>.
          A <code>MenuItem</code> has <code>key</code>, <code>label</code>, and optionally <code>icon</code>, <code>kbd</code>,{" "}
          <code>disabled</code>, <code>title</code>, <code>danger</code>, <code>sep</code>, <code>confirm</code> and{" "}
          <code>onSelect</code>.
        </p>
      </Section>
    </Page>
  );
}

export function DialogPage() {
  return (
    <Page
      title="Dialog"
      lead="The kit's one centred dialog, for the few things a slide-over cannot hold: a create form whose table needs the width, a confirm that needs fields. Details stay in slide-overs."
    >
      <Section title="Examples">
        <Demo title="A form with toolbar and footer" source={dialogForm}>
          <DialogForm />
        </Demo>
        <Demo title="Sizes" source={dialogSizes}>
          <DialogSizes />
        </Demo>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>
            Sizes: <code>sm</code> 420 px (a question), <code>md</code> 900 px (default), <code>lg</code> 1100 px,{" "}
            <code>xl</code> 1280 px, never wider than the window.
          </li>
          <li>
            <code>toolbar</code> sits in the title row before the ×. <code>footer</code> is pinned under the scrolling body.
          </li>
          <li>
            Esc goes one step at a time: an open list or popover inside closes first, then a focused text field is left (so a
            stray Esc never throws a typed form away), then the top dialog closes. The slide-over behind stays.
          </li>
          <li>
            Focus moves in on open (to a <code>data-autofocus</code> field, else the frame), Tab stays inside, and focus returns
            on close.
          </li>
          <li>A press that starts and ends on the backdrop closes it; a drag out of a field does not.</li>
          <li>It sits above slide-overs and the file viewer, under toasts and popovers.</li>
          <li>When the title is not plain text, pass <code>label</code> as the accessible name.</li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          Forms use <code>FormRow</code>, validate before sending and show a toast on success. A record's details open in a
          slide-over, not a dialog.
        </p>
      </Section>
      <Section title="Props">
        <Props of="Dialog" />
      </Section>
    </Page>
  );
}

export function ToastPage() {
  return (
    <Page title="Toasts" lead="Small one-line messages, bottom right, that go away by themselves. Show one after a save or when something fails.">
      <Section title="Examples">
        <Demo title="Kinds" source={toastDemo}>
          <ToastDemo />
        </Demo>
      </Section>
      <Section title="Usage">
        <Code>{`
toast.ok("Saved");                                // 3 s
toast.error("Could not save");                    // 6 s, announced at once
toast.info("Syncing…");                           // 3 s
const id = toast.show("info", "Uploading…", Infinity);   // stays until dismissed
toast.dismiss(id);`}</Code>
        <p>
          <code>UIProvider</code> mounts the <code>{"<Toaster />"}</code> host. Pass <code>toaster={"{false}"}</code> to it only
          when your app mounts its own <code>{"<Toaster />"}</code> once in the root layout. A toast fired before the host
          mounts still shows and times out.
        </p>
      </Section>
      <Section title="Behaviour">
        <ul>
          <li>Each call returns the toast's id. The time is the second argument: 6 s for errors, 3 s for the others by default.</li>
          <li>A toast waits while it is hovered or focused, and the timer goes on from where it stopped.</li>
          <li>A click, Esc, Enter or Delete on it, or its ×, dismisses it.</li>
          <li>Errors are announced at once (<code>role="alert"</code>); the others politely (<code>role="status"</code>).</li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>Use <code>toast</code> for feedback, never <code>alert</code>. Keep it to one line in plain words.</p>
      </Section>
      <Section title="Props">
        <Props of="Toaster" />
      </Section>
    </Page>
  );
}

export function PalettePage() {
  return (
    <Page
      title="Command palette"
      lead="The ⌘K box: jump to a page, reopen something recent, run the current page's actions or change the appearance, without leaving the keyboard."
    >
      <Section title="Examples">
        <Demo title="Page actions with useCommands" source={paletteDemo}>
          <PaletteDemo />
        </Demo>
        <p>
          In an app, <code>CommandPalette</code> is mounted once in the root layout; the demo mounts it itself. On this page ⌘K
          opens the demo's palette (elsewhere on the site it opens the docs search): try it, or use the buttons, then type
          "export", or "dia" to jump to the Dialog page.
        </p>
      </Section>
      <Section title="Usage">
        <Code>{`
// once, in the root layout (the app's router comes from UIProvider)
<AppShell … search={<PaletteButton />}>
  <Outlet />
  <CommandPalette pages={[{ to: "/orders", label: "Orders", icon: Package, keywords: "sales" }]} />
</AppShell>

// on a page: its actions are in ⌘K while it is mounted
useCommands("orders", [
  { id: "new", label: "New order", group: "Orders", run: () => setCreating(true) },
]);

// when a panel opens on a record, so it shows under Recent
rememberRecent({ id: order.id, label: order.number, hint: order.partner, to: "/orders", search: { id: order.id } });`}</Code>
      </Section>
      <Section title="Keyboard">
        <ul>
          <li>⌘K (Ctrl K) opens and closes it from anywhere. <code>palette.open(q)</code>, <code>palette.close()</code> and <code>palette.toggle()</code> do the same from code.</li>
          <li>Type to search pages, recent items, the other services' pages and page actions. Prefix <code>&gt;</code> for page actions only, <code>?</code> for the shortcuts list.</li>
          <li>↑ ↓ move, Home / End jump, Enter runs, Esc closes. Tab stays in the search box. Focus returns where it was.</li>
          <li>With nothing typed it lists up to 6 recent items and the pages. Appearance settings only show while typing.</li>
          <li>Matching: a substring beats a scattered match, and a hit at a word start beats one mid-word. <code>keywords</code> and <code>hint</code> are matched too.</li>
          <li>
            <code>useCommands</code> re-reads its list every time the palette opens, so closures stay fresh. Two registrations of
            one scope: the newest is listed, and the older comes back when it unmounts.
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <p>
          Mount <code>CommandPalette</code> once, in the app frame, with the router passed through <code>UIProvider</code>. <code>/</code> still
          focuses the page's own search box.
        </p>
      </Section>
      <Section title="Props">
        <Props of="CommandPalette" />
        <Props of="PaletteButton" />
        <p>
          A <code>Command</code> has <code>id</code>, <code>label</code>, <code>group</code>, <code>run</code>, and optionally{" "}
          <code>hint</code>, <code>icon</code>, <code>kbd</code> and <code>keywords</code>. Pass <code>shortcuts</code> to replace
          the <code>?</code> list (<code>Mod</code> in a key reads as ⌘ or Ctrl); the default is <code>DEFAULT_SHORTCUTS</code>.
        </p>
      </Section>
    </Page>
  );
}
