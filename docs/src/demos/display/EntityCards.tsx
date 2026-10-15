// demo: EntityCard overview cards in the .mds-cards grid
import { EntityCard, toast, type Tone } from "@mds/ui";
import { Camera, Gauge, Scale, Thermometer, Truck } from "lucide-react";

const hours = (pattern: string): Array<Tone> =>
  Array.from(pattern).map((c) => (c === "o" ? "ok" : c === "w" ? "warn" : c === "e" ? "error" : "neutral"));

export default function EntityCards() {
  return (
    <div className="mds-cards" style={{ padding: 0 }}>
      <EntityCard
        name="Gaya weighbridge"
        icon={Scale}
        tone="ok"
        subLabel="Weighing · last slip 2 min ago"
        segments={hours("-------ooooowoooooooooo--")}
        timeLabels={["00:00", "12:00", "24:00"]}
        provider={{ initial: "E", label: "Essae" }}
        icons={[
          { icon: Truck, label: "Trucks today", value: 38 },
          { icon: Camera, label: "Cameras", value: 2 },
          { icon: Gauge, label: "Tonnes", value: "1,204" },
        ]}
        onClick={() => toast.info("Opening Gaya weighbridge")}
      />
      <EntityCard
        name="Patna cold store"
        icon={Thermometer}
        tone="warn"
        subLabel="Temperature high since 14:00"
        segments={hours("ooooooooooooooweeewwoooo")}
        timeLabels={["00:00", "12:00", "24:00"]}
        icons={[{ icon: Thermometer, label: "Now", value: "9 °C" }]}
      />
      <EntityCard
        name="Nawada weighbridge"
        icon={Scale}
        tone="neutral"
        subLabel="No signal since yesterday"
        segments={hours("------------------------")}
        timeLabels={["00:00", "12:00", "24:00"]}
        provider={{ initial: "E", label: "Essae" }}
        icons={[]}
        offline
      />
    </div>
  );
}
