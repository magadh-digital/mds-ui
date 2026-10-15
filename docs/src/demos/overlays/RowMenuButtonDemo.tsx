// demo: RowMenuButton on a list that is not a table, opening the menu under the button
import { RowMenuButton, toast, useContextMenu, type MenuItem } from "@mds/ui";
import { Pencil, Trash2, Warehouse } from "lucide-react";

const WAREHOUSES = [
  { id: "gaya", name: "Gaya main yard", stock: "1,240 t" },
  { id: "patna", name: "Patna depot", stock: "386 t" },
];

export default function RowMenuButtonDemo() {
  const menu = useContextMenu();
  const items = (w: (typeof WAREHOUSES)[number]): Array<MenuItem> => [
    { key: "edit", label: "Edit", icon: Pencil, kbd: "E", onSelect: () => toast.info(`Editing ${w.name}`) },
    {
      key: "delete",
      label: "Delete",
      icon: Trash2,
      danger: true,
      sep: true,
      confirm: { title: `Delete ${w.name}?`, danger: true, typed: "DELETE", confirmLabel: "Delete" },
      onSelect: () => toast.ok(`${w.name} deleted`),
    },
  ];
  return (
    <div className="mds-vstack" style={{ gap: 8, maxWidth: 360 }}>
      {WAREHOUSES.map((w) => (
        <div key={w.id} className="mds-card mds-hstack" style={{ padding: "8px 12px" }} onContextMenu={(e) => menu.open(e, items(w), w.name)}>
          <Warehouse style={{ width: 16 }} aria-hidden />
          <span style={{ flex: 1 }}>{w.name}</span>
          <span className="mds-num mds-muted">{w.stock}</span>
          <RowMenuButton
            label={`Actions for ${w.name}`}
            expanded={menu.menu?.title === w.name}
            onOpen={(el) => menu.openAt(el, items(w), w.name)}
          />
        </div>
      ))}
      {menu.element}
    </div>
  );
}
