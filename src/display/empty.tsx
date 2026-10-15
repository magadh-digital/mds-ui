import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import "./empty.css";

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
      <div className="ui-empty-line ui-muted">
        {title}
        {action && <span className="ui-empty-action">{action}</span>}
      </div>
    );
  return (
    <div className="ui-empty-state">
      {Icon && <Icon className="ui-empty-icon" aria-hidden />}
      <div className="ui-empty-title">{title}</div>
      {children && <div className="ui-empty-text ui-muted">{children}</div>}
      {action && <div className="ui-empty-actions">{action}</div>}
    </div>
  );
}
