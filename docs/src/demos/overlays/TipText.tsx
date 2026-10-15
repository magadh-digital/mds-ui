// demo: Tip on a figure and on a short code
import { money, Tip } from "@mds/ui";

export default function TipText() {
  return (
    <p style={{ margin: 0 }}>
      Outstanding for{" "}
      <Tip label="Shree Balaji Traders, Gaya">
        <span tabIndex={0} style={{ borderBottom: "1px dotted currentColor" }}>SBT-014</span>
      </Tip>{" "}
      is{" "}
      <Tip label={<>Invoices: {money(312400)}<br />Credit notes: −{money(18250)}</>}>
        <strong tabIndex={0} className="mds-num">{money(294150)}</strong>
      </Tip>
      .
    </p>
  );
}
