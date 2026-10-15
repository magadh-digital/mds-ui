// demo: the same numbers, money and week in three locales
import { useEffect, useState } from "react";
import { MiniTable, Seg, configureLocale, date, kitLocale, money, num, storageKey, useKitLocale, type KitLocale } from "@mds/ui";

const LOCALES: Record<string, Partial<KitLocale>> = {
  india: { locale: "en-IN", currency: "INR", weekStartsOn: 0, fyStartMonth: 3 },
  us: { locale: "en-US", currency: "USD", weekStartsOn: 0, fyStartMonth: 0 },
  germany: { locale: "de-DE", currency: "EUR", weekStartsOn: 1, fyStartMonth: 0 },
};

export default function LocaleSwitch() {
  // this demo puts the site's own locale back when it leaves the page
  const [before] = useState(() => ({ ...kitLocale() }));
  useEffect(() => () => configureLocale(before), [before]);

  const [which, setWhich] = useState<keyof typeof LOCALES>("india");
  const pick = (v: keyof typeof LOCALES) => {
    setWhich(v);
    configureLocale(LOCALES[v]!); // the kit's components on the page render again in the new locale
  };
  useEffect(() => configureLocale(LOCALES.india!), []);

  // renders again when the locale changes, like the kit's own components
  const l = useKitLocale();
  const rows: Array<[string, string]> = [
    ["kitLocale()", `${l.locale} · ${l.currency} · week from ${l.weekStartsOn} · year from month ${l.fyStartMonth}`],
    ["num(1234567.5, 1)", num(1234567.5, 1)],
    ["money(123456)", money(123456)],
    ["money(1234.5)", money(1234.5)],
    ['date("2026-10-15").startOf("week")', date("2026-10-15").startOf("week").format("dddd DD MMM")],
    ['storageKey("theme")', storageKey("theme")],
  ];

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Seg
        label="Locale"
        value={which}
        onChange={pick}
        options={[
          { value: "india", label: "India" },
          { value: "us", label: "United States" },
          { value: "germany", label: "Germany" },
        ]}
      />
      <MiniTable
        label="In this locale"
        rows={rows}
        rowKey={(r) => r[0]}
        cols={[
          { key: "call", header: "Call", cell: (r) => <code>{r[0]}</code> },
          { key: "result", header: "Result", cell: (r) => r[1] },
        ]}
      />
    </div>
  );
}
