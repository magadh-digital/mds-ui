// demo: switch the reader's theme, density, panel width and detail view (this whole site follows), then open a record
import { useState } from "react";
import {
  Button,
  DENSITIES,
  DETAIL_VIEWS,
  FormRow,
  KeyValue,
  PANEL_WIDTHS,
  PanelSection,
  Seg,
  SlideOver,
  THEMES,
  useAppearance,
} from "@mds/ui";

export default function AppearanceSettings() {
  const a = useAppearance();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gap: 8, maxWidth: 640 }}>
        <FormRow label="Theme" hint={`showing ${a.resolvedTheme}`}>
          <Seg label="Theme" value={a.theme} onChange={a.setTheme} options={THEMES} />
        </FormRow>
        <FormRow label="Density">
          <Seg label="Density" value={a.density} onChange={a.setDensity} options={DENSITIES} />
        </FormRow>
        <FormRow label="Detail panel">
          <Seg label="Detail panel width" value={a.panelWidth} onChange={a.setPanelWidth} options={PANEL_WIDTHS} />
        </FormRow>
        <FormRow label="Detail view" hint={a.detailView === "full" ? `leaving full page goes back to the ${a.windowedView === "popup" ? "popup" : "side panel"}` : undefined}>
          <Seg label="Detail view" value={a.detailView} onChange={a.setDetailView} options={DETAIL_VIEWS} />
        </FormRow>
      </div>

      <div style={{ position: "relative", height: 300, overflow: "hidden", border: "1px solid var(--mds-c-border)", borderRadius: 6 }}>
        <div style={{ padding: 16 }}>
          <Button onClick={() => setOpen(true)}>Open SO-2481</Button>
        </div>
        <SlideOver open={open} title="SO-2481" meta="Dispatched" onClose={() => setOpen(false)}>
          <PanelSection title="Details">
            <KeyValue
              items={[
                { k: "Partner", v: "Shree Traders" },
                { k: "Panel width", v: a.panelWidth },
                { k: "Detail view", v: a.detailView },
              ]}
            />
          </PanelSection>
        </SlideOver>
      </div>
    </div>
  );
}
