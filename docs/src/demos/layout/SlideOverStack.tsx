// demo: a linked record opens a second slide-over on top; Esc or ‹ goes back to the first
import { useState } from "react";
import { Button, KeyValue, LinkButton, PanelSection, SlideOver, money } from "@mds/ui";

const ORDER = { id: "SO-2481", partner: "Shree Traders", amount: 25_540 };
const PARTNER = { name: "Shree Traders", city: "Patna", gstin: "10ABCDE1234F1Z5", credit: 400_000, due: 214_460 };

export default function LinkedPanels() {
  const [order, setOrder] = useState(false);
  const [partner, setPartner] = useState(false);

  return (
    <div style={{ position: "relative", height: 380, overflow: "hidden", border: "1px solid var(--mds-c-border)", borderRadius: 6 }}>
      <div style={{ padding: 16 }}>
        <Button onClick={() => setOrder(true)}>Open {ORDER.id}</Button>
      </div>

      <SlideOver open={order} title={ORDER.id} onClose={() => setOrder(false)}>
        <PanelSection title="Details">
          <KeyValue
            items={[
              { k: "Partner", v: <LinkButton onClick={() => setPartner(true)}>{ORDER.partner}</LinkButton> },
              { k: "Amount", v: money(ORDER.amount) },
            ]}
          />
        </PanelSection>
      </SlideOver>

      {/* opened from inside the first one: it goes on top, and its head offers "Back to SO-2481" */}
      <SlideOver open={partner} title={PARTNER.name} meta={PARTNER.city} onClose={() => setPartner(false)}>
        <PanelSection title="Account">
          <KeyValue
            items={[
              { k: "GSTIN", v: PARTNER.gstin, copy: PARTNER.gstin },
              { k: "Credit limit", v: money(PARTNER.credit) },
              { k: "Due", v: money(PARTNER.due) },
            ]}
          />
        </PanelSection>
      </SlideOver>
    </div>
  );
}
