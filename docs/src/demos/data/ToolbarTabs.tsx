// demo: sister pages as tabs in place of the title, headline figures inline, refresh driven by `refreshing`
import { useState } from "react";
import { Seg, Toolbar, ToolbarStats } from "@mds/ui";

export default function DispatchToolbar() {
  const [view, setView] = useState<"dispatch" | "returns">("dispatch");
  const [fetching, setFetching] = useState(false);
  const [q, setQ] = useState("");
  const refresh = () => {
    setFetching(true);
    setTimeout(() => setFetching(false), 1200); // the query's isFetching, in a real page
  };

  return (
    <Toolbar
      title="Dispatch"
      tabs={
        <Seg
          label="Page"
          value={view}
          onChange={setView}
          options={[
            { value: "dispatch", label: "Dispatch" },
            { value: "returns", label: "Returns" },
          ]}
        />
      }
      search={{ value: q, onChange: setQ, placeholder: view === "dispatch" ? "Search trucks" : "Search returns" }}
      onRefresh={refresh}
      refreshing={fetching}
    >
      <ToolbarStats
        items={
          view === "dispatch"
            ? [
                { label: "loaded", value: 18, sub: "/ 24", tone: "ok" },
                { label: "waiting", value: 6, tone: "warn" },
              ]
            : [{ label: "open returns", value: 3 }]
        }
      />
    </Toolbar>
  );
}
