// Reads every component in ../src with react-docgen-typescript and writes src/props.json: per component, its doc
// comment and its props (type, required, default, doc). The props tables on the site come from here, so they never
// drift from the code.
import { withCustomConfig } from "react-docgen-typescript";
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const SRC = join(import.meta.dir, "../../src");
const walk = (d: string): Array<string> =>
  readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = walk(SRC).filter((f) => f.endsWith(".tsx"));
const parser = withCustomConfig(join(SRC, "../tsconfig.json"), {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  // only the kit's own props, not every HTML attribute a component forwards
  propFilter: (p) => !p.parent || !/node_modules/.test(p.parent.fileName),
});
type Prop = { name: string; type: string; required: boolean; default?: string; description: string };
const out: Record<string, { file: string; description: string; props: Array<Prop> }> = {};
for (const doc of parser.parse(files)) {
  if (!/^[A-Z]/.test(doc.displayName)) continue;
  out[doc.displayName] = {
    file: relative(SRC, doc.filePath),
    description: doc.description,
    props: Object.values(doc.props)
      .map((p) => ({
        name: p.name,
        type: p.type.raw && p.type.raw.length < 160 ? p.type.raw : p.type.name,
        required: p.required,
        default: p.defaultValue?.value != null ? String(p.defaultValue.value) : undefined,
        description: p.description,
      }))
      .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name)),
  };
}
writeFileSync(join(import.meta.dir, "../src/props.json"), JSON.stringify(out, null, 1));
console.log(`props.json: ${Object.keys(out).length} components`);
