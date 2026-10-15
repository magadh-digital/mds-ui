// demo: FileThumb sizes and its own empty / unavailable states
import { FileThumb, useFileViewer, type ViewerFile } from "@mds/ui";

const bill: ViewerFile = {
  src:
    "data:image/svg+xml," +
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="#f1f5f9"/><rect x="30" y="40" width="240" height="18" fill="#94a3b8"/><rect x="30" y="80" width="180" height="12" fill="#cbd5e1"/><rect x="30" y="104" width="200" height="12" fill="#cbd5e1"/></svg>'),
  name: "fuel-bill.svg",
};

export default function FileThumbSizes() {
  const viewer = useFileViewer();
  return (
    <div className="mds-hstack" style={{ gap: 12, alignItems: "flex-end" }}>
      <FileThumb size="sm" file={bill} onOpen={() => viewer.open(bill)} />
      <FileThumb size="md" file={bill} onOpen={() => viewer.open(bill)} />
      <FileThumb size="lg" file={bill} onOpen={() => viewer.open(bill)} />
      <FileThumb size="md" file={{ src: "data:image/png;base64,AAAA", name: "expired-link.jpg" }} />
      <FileThumb size="md" file={undefined} emptyLabel="No photo" />
      {viewer.element}
    </div>
  );
}
