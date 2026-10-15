// demo: Spinner sizes, with a visible label, and Kbd keys
import { Kbd, Spinner } from "@mds/ui";

export default function SpinnerKbd() {
  return (
    <div className="mds-vstack" style={{ gap: 12 }}>
      <div className="mds-hstack" style={{ gap: 16 }}>
        <Spinner />
        <Spinner size={24} />
        <Spinner showLabel label="Loading partners…" />
      </div>
      <div className="mds-hstack" style={{ gap: 6 }}>
        Press <Kbd>/</Kbd> to search, <Kbd>R</Kbd> to refresh, <Kbd>⌘</Kbd><Kbd>K</Kbd> to jump anywhere.
      </div>
    </div>
  );
}
