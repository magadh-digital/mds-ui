import { type DragEvent, useState } from "react";

/**
 * Drag to sort — one hook for every list the user may arrange by hand: the rail's pages, the rows of a customiser
 * popover, the columns of a table (18 Sep 2026). HTML5 DnD, so it costs no library; ↑ ↓ arrows beside it cover touch.
 *
 * `useDragSort(ids, onOrder, group, axis)` → `props(id)` spreads onto each item; the item under the pointer gets
 * `.drop-before` / `.drop-after` (`axis: 'y'` = above / below, `'x'` = left / right), the lifted one `.dragging`. Only
 * items from the same `group` accept a drop, so a rail page cannot land among the utility icons.
 */

const MIME = "application/x-mgdh-sort";
export type DropMark = { id: string; before: boolean } | null;

/** swap `id` with its neighbour; the same array when it cannot move */
export const moveId = (
  ids: Array<string>,
  id: string,
  dir: -1 | 1,
): Array<string> => {
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return ids;
  const next = [...ids];
  next[i] = ids[j]!;
  next[j] = ids[i]!;
  return next;
};
/** put `dragged` before or after `target`; the same array when nothing changes */
export const dropId = (
  ids: Array<string>,
  dragged: string,
  target: string,
  before: boolean,
): Array<string> => {
  if (dragged === target || !ids.includes(dragged) || !ids.includes(target))
    return ids;
  const rest = ids.filter((id) => id !== dragged);
  const at = rest.indexOf(target) + (before ? 0 : 1);
  return [...rest.slice(0, at), dragged, ...rest.slice(at)];
};
/** the full order with its visible members re-sequenced as `visibleNext`; hidden members keep their slots */
export const mergeOrder = (
  full: Array<string>,
  visibleNext: Array<string>,
): Array<string> => {
  const queue = [...visibleNext];
  return full.map((id) => (visibleNext.includes(id) ? queue.shift()! : id));
};

export function useDragSort(
  ids: Array<string>,
  onOrder: (next: Array<string>) => void,
  group = "sort",
  axis: "x" | "y" = "y",
) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [mark, setMark] = useState<DropMark>(null);
  const isBefore = (e: DragEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    return axis === "y"
      ? e.clientY < r.top + r.height / 2
      : e.clientX < r.left + r.width / 2;
  };
  const props = (id: string) => ({
    draggable: true,
    onDragStart: (e: DragEvent) => {
      e.dataTransfer.setData(MIME, `${group}\n${id}`);
      e.dataTransfer.effectAllowed = "move";
      setDragging(id);
    },
    onDragOver: (e: DragEvent) => {
      if (!e.dataTransfer.types.includes(MIME) || !dragging || dragging === id)
        return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const before = isBefore(e);
      setMark((m) =>
        m && m.id === id && m.before === before ? m : { id, before },
      );
    },
    onDragLeave: (e: DragEvent) => {
      if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
      setMark((m) => (m?.id === id ? null : m));
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      const [g, dragged] = (e.dataTransfer.getData(MIME) || "").split("\n");
      setMark(null);
      setDragging(null);
      if (g !== group || !dragged) return;
      const next = dropId(ids, dragged, id, isBefore(e));
      if (next !== ids) onOrder(next);
    },
    onDragEnd: () => {
      setMark(null);
      setDragging(null);
    },
    className: `${dragging === id ? " dragging" : ""}${mark?.id === id ? (mark.before ? " drop-before" : " drop-after") : ""}`,
  });
  return { props, dragging, mark };
}
