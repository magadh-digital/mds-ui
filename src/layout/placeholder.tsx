import type { ReactNode } from "react";

/** A section that is not available yet: its name in a toolbar, then a short muted message. */
export function Placeholder({
  title,
  message,
}: {
  title: string;
  /** what the reader sees under the title; "This section is not available yet." by default */
  message?: ReactNode;
}) {
  return (
    <div className="mds-main">
      <div className="mds-toolbar">
        <span style={{ fontWeight: 600 }}>{title}</span>
      </div>
      <div className="mds-placeholder">{message ?? "This section is not available yet."}</div>
    </div>
  );
}
