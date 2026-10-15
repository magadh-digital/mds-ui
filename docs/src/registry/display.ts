// The Display section: chips, toolbar figures, tabs, empty states, feedback, avatars, the file viewer, dots, cards and
// charts, the lane strip and glossary hovers.
import type { DocPage } from "../registry";
import {
  AvatarPage,
  CardsChartsPage,
  ChipsPage,
  DotPage,
  EmptyPage,
  FeedbackPage,
  FileViewerPage,
  GlossaryPage,
  LaneStripPage,
  TabsPage,
  ToolbarStatsPage,
} from "../pages/display";

export const pages: Array<DocPage> = [
  { path: "/components/chips", title: "Chips", section: "display", render: ChipsPage, keywords: "ToneChip StatusChip statusTone statusLabel badge tag" },
  { path: "/components/toolbar-stats", title: "ToolbarStats", section: "display", render: ToolbarStatsPage, keywords: "figures totals counts kpi" },
  { path: "/components/tabs", title: "Tabs", section: "display", render: TabsPage, keywords: "sections tablist" },
  { path: "/components/empty", title: "Empty", section: "display", render: EmptyPage, keywords: "empty state nothing" },
  { path: "/components/feedback", title: "Spinner, Progress and Kbd", section: "display", render: FeedbackPage, keywords: "loading progress bar key shortcut" },
  { path: "/components/avatar", title: "Avatar", section: "display", render: AvatarPage, keywords: "initials photo person" },
  { path: "/components/file-viewer", title: "File viewer", section: "display", render: FileViewerPage, keywords: "useFileViewer FileThumb image pdf lightbox photo" },
  { path: "/components/dot", title: "Dot and HealthBar", section: "display", render: DotPage, keywords: "status dot health segments" },
  { path: "/components/cards-charts", title: "Cards and charts", section: "display", render: CardsChartsPage, keywords: "EntityCard SeriesChart Timelines IconStrip overview chart" },
  { path: "/components/lane-strip", title: "Lane strip", section: "display", render: LaneStripPage, keywords: "LaneStrip flow steps workflow" },
  { path: "/components/glossary", title: "Glossary hovers", section: "display", render: GlossaryPage, keywords: "Term Code TermsProvider glossary old names" },
];
