// demo: toast.ok / error / info, and one that stays until dismissed
import { useRef } from "react";
import { Button, toast } from "@mds/ui";

export default function ToastDemo() {
  const syncing = useRef<number | null>(null);
  return (
    <div className="mds-hstack" style={{ gap: 8, flexWrap: "wrap" }}>
      <Button onClick={() => toast.ok("Invoice INV-7781 saved")}>Success</Button>
      <Button onClick={() => toast.error("Could not reach the weighbridge. Try again.")}>Error</Button>
      <Button onClick={() => toast.info("3 new orders since you opened the page")}>Info</Button>
      <Button
        onClick={() => {
          if (syncing.current !== null) return;
          syncing.current = toast.show("info", "Syncing with Tally…", Infinity);
        }}
      >
        Start sync
      </Button>
      <Button
        onClick={() => {
          if (syncing.current === null) return;
          toast.dismiss(syncing.current);
          syncing.current = null;
          toast.ok("Tally sync done");
        }}
      >
        Finish sync
      </Button>
    </div>
  );
}
