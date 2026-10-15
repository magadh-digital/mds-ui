// The Data section: the page table, the small table, the pager, the toolbar, the filter sidebar, list state and page order.
import type { DocPage } from "../registry";
import { DenseTablePage, ListStatePage, MiniTablePage, PageOrderPage, PaginationPage, SidebarPage, ToolbarPage } from "../pages/data";

export const pages: Array<DocPage> = [
  { path: "/components/dense-table", title: "DenseTable", section: "data", render: DenseTablePage, keywords: "table grid list sorting paging columns selection row menu expand loading" },
  { path: "/components/mini-table", title: "MiniTable", section: "data", render: MiniTablePage, keywords: "small table panel lines highlight" },
  { path: "/components/pagination", title: "Pagination", section: "data", render: PaginationPage, keywords: "pager pages rows per page cards" },
  { path: "/components/toolbar", title: "Toolbar", section: "data", render: ToolbarPage, keywords: "search refresh filters title count chips tabs more menu" },
  { path: "/components/sidebar", title: "Sidebar and FilterGroup", section: "data", render: SidebarPage, keywords: "filters filter group count checkbox collapse searchbox" },
  { path: "/components/list-state", title: "List state in the URL", section: "data", render: ListStatePage, keywords: "useListState baseSearch search params url navigate useSelection rowsToTsv" },
  { path: "/components/page-order", title: "Page order", section: "data", render: PageOrderPage, keywords: "usePageLayout PagesPop customize pages hide rail order" },
];
