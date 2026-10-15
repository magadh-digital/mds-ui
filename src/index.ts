// @magadhtech/ui: every component and helper. Subpaths ("@magadhtech/ui/table") load one module alone;
// the stylesheet is "@magadhtech/ui/styles.css" (imported here too).
import "./styles.css";

// core
export * from "./core/date";
export * from "./core/format";
export * from "./core/hooks";
export * from "./core/types";
export * from "./core/validate";

// overlay
export * from "./overlay/confirm";
export * from "./overlay/dialog";
export * from "./overlay/floating";
export * from "./overlay/menu";
export * from "./overlay/pop";
export * from "./overlay/tip";
export * from "./overlay/toast";

// inputs
export * from "./inputs/actions";
export * from "./inputs/autocomplete";
export * from "./inputs/daterange";
export * from "./inputs/fileinput";
export * from "./inputs/form";
export * from "./inputs/seg";
export * from "./inputs/switch";
export * from "./inputs/toggle";

// display
export * from "./display/buttons";
export * from "./display/cards";
export * from "./display/chart";
export * from "./display/chip";
export * from "./display/dot";
export * from "./display/empty";
export * from "./display/fileviewer";
export * from "./display/flowstrip";
export * from "./display/skeleton";
export * from "./display/term";

// data
export * from "./data/columns";
export * from "./data/dragsort";
export * from "./data/listpage";
export * from "./data/minitable";
export * from "./data/pages";
export * from "./data/sidebar";
export * from "./data/table";
export * from "./data/toolbar";

// layout
export * from "./layout/appearance";
export * from "./layout/panel";
export * from "./layout/placeholder";

// two helpers share a name: `num` formats a number (core/format); the URL-search parser is `searchNum`
export { num } from "./core/format";
export { num as searchNum } from "./data/listpage";
