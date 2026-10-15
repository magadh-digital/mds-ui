// demo: Progress for a job with a known end, a tone, and one with no known end (value null)
import { useEffect, useState } from "react";
import { Button, Progress } from "@mds/ui";

export default function ProgressDemo() {
  const [done, setDone] = useState<number | null>(null);
  useEffect(() => {
    if (done === null || done >= 100) return;
    const t = setTimeout(() => setDone((d) => Math.min(100, (d ?? 0) + 7)), 200);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <div className="mds-vstack" style={{ gap: 16, maxWidth: 420 }}>
      <Progress label="Importing 240 invoices" value={done ?? 0} tone={done === 100 ? "ok" : "accent"} />
      <Progress label="Yard capacity used" value={86} tone="warn" />
      <Progress label="Waiting for the weighbridge" value={null} />
      <div>
        <Button onClick={() => setDone(0)}>{done === null ? "Start import" : "Run again"}</Button>
      </div>
    </div>
  );
}
