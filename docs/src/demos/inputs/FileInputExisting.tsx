// demo: FileInput in an edit form, with files already saved
import { useState } from "react";
import { FileInput, FormRow, type ViewerFile } from "@mds/ui";

// your saved files' URLs; small inline images here
const svg = (text: string, bg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" font-family="sans-serif" font-size="36" fill="#fff" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`,
  )}`;
const SAVED: Array<ViewerFile> = [
  { src: svg("Challan 7781", "#0f766e"), name: "challan-7781.svg", kind: "image", caption: "Uploaded by Amit, Oct 12" },
  { src: svg("Weighbridge slip", "#4338ca"), name: "weighbridge.svg", kind: "image" },
];

export default function FileInputExisting() {
  const [files, setFiles] = useState<Array<File>>([]);
  return (
    <FormRow label="Proof of delivery">
      <FileInput accept="image/*,application/pdf" multiple maxSizeMb={10} existing={SAVED} files={files} onChange={setFiles} />
    </FormRow>
  );
}
