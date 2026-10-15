/**
 * The pager bar every list shows under itself: ‹ › and "21-40 of 683 partners", then (right) any extra controls and
 * "Rows Per Page". DenseTable draws its bottom bar with it; use it alone under a list that is not a table (cards, a
 * board). `pageIndex` is 0-based.
 */
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export type PageState = { pageIndex: number; pageSize: number };

export function Pagination({
  pageIndex,
  pageSize,
  total,
  onChange,
  pageSizes = [25, 50, 100, 200],
  label = "",
  note,
  extra,
}: PageState & {
  /** every row, across pages */
  total: number;
  onChange: (p: PageState) => void;
  /** the "Rows Per Page" choices; [] hides the picker */
  pageSizes?: Array<number>;
  /** what the rows are ("partners"), after the count */
  label?: string;
  /** a muted remark after the count */
  note?: ReactNode;
  /** controls at the right, before "Rows Per Page" (the table's Customize columns) */
  extra?: ReactNode;
}) {
  const pages = Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(total, (pageIndex + 1) * pageSize);
  return (
    <div className="ui-foot">
      <span className="pager">
        <button type="button" onClick={() => onChange({ pageIndex: pageIndex - 1, pageSize })} disabled={pageIndex <= 0} aria-label="Previous page">
          <ChevronLeft />
        </button>
        <button type="button" onClick={() => onChange({ pageIndex: pageIndex + 1, pageSize })} disabled={pageIndex >= pages - 1} aria-label="Next page">
          <ChevronRight />
        </button>
      </span>
      <span className="ui-num">
        {from.toLocaleString("en-IN")}-{to.toLocaleString("en-IN")} of {total.toLocaleString("en-IN")} {label}
      </span>
      {note && <span>· {note}</span>}
      <span style={{ flex: 1 }} />
      {extra}
      {pageSizes.length > 0 && (
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          Rows Per Page:
          <select className="ui-select" value={pageSize} onChange={(e) => onChange({ pageIndex: 0, pageSize: Number(e.target.value) })}>
            {pageSizes.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
