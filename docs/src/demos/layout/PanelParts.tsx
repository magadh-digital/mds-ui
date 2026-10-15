// demo: the parts of a panel body on their own: tiles, a status line, two blocks side by side, a fold that edits in place
import { useState } from "react";
import { Button, FoldSection, FormRow, Input, KeyValue, PanelBlock, PanelColumns, PanelSection, StatTiles, StatusLine, money, toast } from "@mds/ui";

export default function InvoiceBody() {
  const [editing, setEditing] = useState(false);
  const [terms, setTerms] = useState("30");
  const [draft, setDraft] = useState(terms);

  return (
    <div style={{ maxWidth: 680, border: "1px solid var(--mds-c-border)", borderRadius: 6, padding: "4px 0" }}>
      <StatTiles
        items={[
          { label: "Billed", value: money(118_400) },
          { label: "Received", value: money(80_000), sub: "2 payments" },
          { label: "Due", value: money(38_400), tone: "warn", sub: "in 6 days" },
        ]}
      />
      <StatusLine>Part paid. The rest is due on 21 Oct 2026.</StatusLine>
      <PanelSection title="Addresses">
        <PanelColumns>
          <PanelBlock label="Billing">
            <div>Shree Traders</div>
            <div className="mds-muted">Boring Road, Patna 800001</div>
          </PanelBlock>
          <PanelBlock label="Shipping" action={<Button size="sm">Change</Button>}>
            <div>Site 4, Bihta</div>
            <div className="mds-muted">Patna 801103</div>
          </PanelBlock>
        </PanelColumns>
      </PanelSection>
      <FoldSection
        title="Payment terms"
        onEdit={() => {
          setDraft(terms);
          setEditing(true);
        }}
        editing={editing}
        editor={
          <div style={{ display: "grid", gap: 8 }}>
            <FormRow label="Days to pay" required>
              <Input value={draft} onChange={(e) => setDraft(e.target.value)} inputMode="numeric" />
            </FormRow>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Button onClick={() => setEditing(false)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => {
                  setTerms(draft);
                  setEditing(false);
                  toast.ok("Payment terms saved");
                }}
              >
                Save
              </Button>
            </div>
          </div>
        }
      >
        <KeyValue items={[{ k: "Days to pay", v: `${terms} days` }, { k: "Late fee", v: "1.5% a month" }]} />
      </FoldSection>
      <FoldSection title="Payments" count={2} defaultOpen={false}>
        <KeyValue
          items={[
            { k: "UTR 4821", v: money(50_000), sub: "3 Oct" },
            { k: "UTR 5110", v: money(30_000), sub: "10 Oct" },
          ]}
        />
      </FoldSection>
    </div>
  );
}
