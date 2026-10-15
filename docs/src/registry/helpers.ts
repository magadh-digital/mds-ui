// The Helpers section: date(), the formats, locale and storage, form checks and hooks.
import type { DocPage } from "../registry";
import { DatePage, FormChecksPage, FormatsPage, HooksPage, LocaleStoragePage } from "../pages/helpers";

export const pages: Array<DocPage> = [
  { path: "/helpers/date", title: "date()", section: "helpers", render: DatePage, keywords: "dayjs date format tokens add subtract startOf endOf diff isBefore quarter week" },
  { path: "/helpers/formats", title: "Formats", section: "helpers", render: FormatsPage, keywords: "day dayTime hhmm monthYear ago num money rupees currency" },
  { path: "/helpers/locale", title: "Locale and storage", section: "helpers", render: LocaleStoragePage, keywords: "configureLocale kitLocale localeNumber configureStorage storageKey currency week" },
  { path: "/helpers/form-checks", title: "Form checks", section: "helpers", render: FormChecksPage, keywords: "validate required numberIn dateLike digits maxLen check useFormErrors" },
  { path: "/helpers/hooks", title: "Hooks", section: "helpers", render: HooksPage, keywords: "useDebounced debounce" },
];
