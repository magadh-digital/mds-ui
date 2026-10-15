// @mds/ui: every component and helper. Subpaths ("@mds/ui/table") load one module alone;
// the stylesheet is "@mds/ui/styles.css" (imported here too).
import "./styles.css";

// core
export * from "./core/date";
export * from "./core/format";
export * from "./core/hooks";
export * from "./core/router";
export * from "./core/service_pages";
export * from "./core/types";
export * from "./core/validate";

// overlay
export * from "./overlay/confirm";
export * from "./overlay/confirmdialog";
export * from "./overlay/dialog";
export * from "./overlay/floating";
export * from "./overlay/menu";
export * from "./overlay/palette";
export * from "./overlay/pop";
export * from "./overlay/tip";
export * from "./overlay/toast";

// inputs
export * from "./inputs/actions";
export * from "./inputs/autocomplete";
export * from "./inputs/calendar";
export * from "./inputs/controls";
export * from "./inputs/dateinput";
export * from "./inputs/daterange";
export * from "./inputs/fileinput";
export * from "./inputs/form";
export * from "./inputs/seg";
export * from "./inputs/switch";
export * from "./inputs/toggle";

// display
export * from "./display/avatar";
export * from "./display/buttons";
export * from "./display/cards";
export * from "./display/chart";
export * from "./display/chip";
export * from "./display/dot";
export * from "./display/empty";
export * from "./display/feedback";
export * from "./display/fileviewer";
export * from "./display/flowstrip";
export * from "./display/skeleton";
export * from "./display/stats";
export * from "./display/tabs";
export * from "./display/term";

// data
export * from "./data/columns";
export * from "./data/dragsort";
export * from "./data/listpage";
export * from "./data/minitable";
export * from "./data/pages";
export * from "./data/pagination";
export * from "./data/sidebar";
export * from "./data/table";
export * from "./data/toolbar";

// layout
export * from "./layout/appearance";
export * from "./layout/panel";
export * from "./layout/placeholder";
export * from "./layout/raillayout";
export * from "./layout/shell";

// two helpers share a name: `num` formats a number (core/format); the URL-search parser is `searchNum`
export { num } from "./core/format";
export { num as searchNum } from "./data/listpage";
