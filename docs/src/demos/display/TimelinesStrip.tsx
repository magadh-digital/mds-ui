// demo: Timelines (one health bar per site) and IconStrip (top tiles)
import { IconStrip, Timelines, toast, type Tone } from "@mds/ui";
import { Truck } from "lucide-react";

const bar = (pattern: string): Array<Tone> =>
  Array.from(pattern).map((c) => (c === "o" ? "ok" : c === "w" ? "warn" : c === "e" ? "error" : "neutral"));

export default function TimelinesStrip() {
  return (
    <div className="mds-vstack" style={{ gap: 24 }}>
      <Timelines
        labels={["00:00", "12:00", "24:00"]}
        rows={[
          { key: "gaya", label: "Gaya yard", segments: bar("------oooooooooooooo----"), right: "38 trucks", onOpen: () => toast.info("Gaya yard") },
          { key: "patna", label: "Patna depot", segments: bar("------oooowweeoooooo----"), right: "21 trucks", onOpen: () => toast.info("Patna depot") },
          { key: "nawada", label: "Nawada yard", segments: bar("------------------------"), right: "—" },
        ]}
      />
      <IconStrip
        title="Top transporters this week"
        icon={Truck}
        items={[
          { key: "rk", label: "RK Roadlines", value: 42, onClick: () => toast.info("RK Roadlines") },
          { key: "mg", label: "Magadh Carriers", value: 35 },
          { key: "sb", label: "Sone Bhadra Transport", value: 19 },
          { key: "jt", label: "Jai Tara Logistics", value: 11 },
        ]}
      />
    </div>
  );
}
