// demo: ToggleGroup picking several
import { useState } from "react";
import { ToggleGroup, type ToggleOption } from "@mds/ui";

type Product = "tmt" | "wire" | "cement" | "pipe";
const PRODUCTS: Array<ToggleOption<Product>> = [
  { value: "tmt", label: "TMT bars" },
  { value: "wire", label: "Binding wire" },
  { value: "cement", label: "Cement" },
  { value: "pipe", label: "Pipes" },
];

export default function ToggleMultiple() {
  const [products, setProducts] = useState<Array<Product>>(["tmt"]);
  const names = PRODUCTS.filter((p) => products.includes(p.value)).map((p) => p.label);
  return (
    <div className="mds-vstack" style={{ gap: 8, alignItems: "flex-start" }}>
      <ToggleGroup multiple label="Products" value={products} onChange={setProducts} options={PRODUCTS} />
      <span className="mds-muted">{names.length ? `Showing ${names.join(", ")}` : "Showing all products"}</span>
    </div>
  );
}
