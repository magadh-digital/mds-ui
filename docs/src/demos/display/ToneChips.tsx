// demo: ToneChip in every tone, dimmed, and as a button
import { useState } from "react";
import { ToneChip, type ChipTone } from "@mds/ui";

const TONES: Array<ChipTone> = ["ok", "warn", "error", "accent", "purple", "neutral", "muted"];
const STORES = ["Gaya", "Patna", "Nawada"];

export default function ToneChips() {
  const [store, setStore] = useState("Gaya");
  return (
    <div className="mds-vstack" style={{ gap: 12 }}>
      <div className="mds-hstack" style={{ flexWrap: "wrap" }}>
        {TONES.map((t) => (
          <ToneChip key={t} tone={t}>{t}</ToneChip>
        ))}
      </div>
      <div className="mds-hstack">
        <ToneChip tone="purple">GST registered</ToneChip>
        <ToneChip tone="accent" dim title="Not used this month">Porter</ToneChip>
        <ToneChip tone="accent">Rivigo</ToneChip>
      </div>
      <div className="mds-hstack">
        {STORES.map((s) => (
          <ToneChip key={s} tone={s === store ? "accent" : "muted"} onClick={() => setStore(s)}>
            {s}
          </ToneChip>
        ))}
        <span className="mds-muted">Store: {store}</span>
      </div>
    </div>
  );
}
