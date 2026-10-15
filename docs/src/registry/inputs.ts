// The inputs section: buttons and fields first, then forms, the pickers, the toggles, files and the action bars.
import type { DocPage } from "../registry";
import {
  ActionsPage,
  AutocompletePage,
  ButtonsPage,
  DateInputPage,
  DateRangePage,
  FileInputPage,
  FormsPage,
  SegPillsPage,
  SwitchPage,
  TextFieldsPage,
  ToggleGroupPage,
} from "../pages/inputs";

export const pages: Array<DocPage> = [
  { path: "/components/buttons", title: "Buttons", section: "inputs", render: ButtonsPage, keywords: "Button IconButton LinkButton primary danger loading" },
  { path: "/components/text-fields", title: "Text fields", section: "inputs", render: TextFieldsPage, keywords: "Input Textarea Select Checkbox invalid" },
  { path: "/components/forms", title: "Forms", section: "inputs", render: FormsPage, keywords: "FormRow SaveBar InlineInput label required hint error validate" },
  { path: "/components/autocomplete", title: "Autocomplete", section: "inputs", render: AutocompletePage, keywords: "combobox picker search select multiple chips groups server useKeepPicked" },
  { path: "/components/date-range", title: "DateRange", section: "inputs", render: DateRangePage, keywords: "date range calendar shortcuts financial year presetRange rangeLabel" },
  { path: "/components/date-input", title: "DateInput", section: "inputs", render: DateInputPage, keywords: "date picker calendar min max" },
  { path: "/components/toggle-group", title: "ToggleGroup", section: "inputs", render: ToggleGroupPage, keywords: "toggle filter choices counts" },
  { path: "/components/seg-pills", title: "Seg and Pills", section: "inputs", render: SegPillsPage, keywords: "segmented view switch radio pills" },
  { path: "/components/switch", title: "Switch", section: "inputs", render: SwitchPage, keywords: "toggle on off setting" },
  { path: "/components/file-input", title: "FileInput", section: "inputs", render: FileInputPage, keywords: "upload file drop images pdf" },
  { path: "/components/actions", title: "ActionRow and BulkBar", section: "inputs", render: ActionsPage, keywords: "actions bulk selection confirm" },
];
