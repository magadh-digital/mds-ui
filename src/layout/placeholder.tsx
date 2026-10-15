/** A section that is planned but not built yet: says which phase brings it, links to the plan. */
export function Placeholder({
  section,
  phase,
}: {
  section: string;
  phase: number;
}) {
  return (
    <div className="main">
      <div className="toolbar">
        <span style={{ fontWeight: 600 }}>{section}</span>
      </div>
      <div className="placeholder">
        {section} is coming in phase {phase}. Until then, use the old page.
      </div>
    </div>
  );
}
