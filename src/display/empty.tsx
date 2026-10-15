import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

/**
 * The kit's one empty state: what is missing, why, and the next step. Tables say it through
 * `DenseTable emptyText`; panels, sections and pages use this.
 */

export function Empty({
  icon: Icon,
  title,
  children,
  action,
  compact,
}: {
  icon?: LucideIcon;
  /** one short line: "No tasks yet" */
  title: ReactNode;
  /** a sentence on why / what this is */
  children?: ReactNode;
  /** buttons or a link: the next step */
  action?: ReactNode;
  /** a single quiet line inside a panel section */
  compact?: boolean;
}) {
  if (compact)
    return (
      <div className="mds-empty-line mds-muted">
        {title}
        {action && <span className="mds-empty-action">{action}</span>}
      </div>
    );
  return (
    <div className="mds-empty-state">
      {Icon && <Icon className="mds-empty-icon" aria-hidden />}
      <div className="mds-empty-title">{title}</div>
      {children && <div className="mds-empty-text mds-muted">{children}</div>}
      {action && <div className="mds-empty-actions">{action}</div>}
    </div>
  );
}
