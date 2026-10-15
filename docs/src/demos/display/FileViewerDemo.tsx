// demo: FileThumb + useFileViewer: several files as one list (← → move, + − zoom, R rotate), a PDF inline
import { FileThumb, useFileViewer, type ViewerFile } from "@mds/ui";

// a real app passes its own URLs; these are made in the browser so the demo needs no network
const photo = (label: string, bg: string) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420"><rect width="640" height="420" fill="${bg}"/><text x="320" y="225" font-family="sans-serif" font-size="44" fill="#fff" text-anchor="middle">${label}</text></svg>`,
  );

const FILES: Array<ViewerFile> = [
  { src: photo("Odometer 48,210 km", "#0f766e"), name: "odometer-start.svg", caption: "Uploaded by Sunil Yadav · 07:42" },
  { src: photo("Odometer 48,396 km", "#1d4ed8"), name: "odometer-end.svg", caption: "Uploaded by Sunil Yadav · 18:10" },
  { src: photo("Weighbridge slip", "#b45309"), name: "weighbridge-slip.svg" },
  { src: tinyPdf("Invoice INV-7781"), name: "INV-7781.pdf", kind: "pdf", caption: "Shree Balaji Traders" },
  { src: "data:text/csv,item,qty%0ATMT 12 mm,40", name: "stock.csv", kind: "file" },
];

export default function FileViewerDemo() {
  const viewer = useFileViewer();
  return (
    <div className="mds-hstack" style={{ gap: 8, flexWrap: "wrap" }}>
      {FILES.map((f, i) => (
        <FileThumb key={f.name} file={f} onOpen={() => viewer.open(FILES, i)} />
      ))}
      <FileThumb file={null} emptyLabel="No photo" />
      {viewer.element}
    </div>
  );
}

// a one-page PDF as a blob URL
function tinyPdf(text: string) {
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 420 297] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${`BT /F1 24 Tf 40 150 Td (${text}) Tj ET`.length} >>\nstream\nBT /F1 24 Tf 40 150 Td (${text}) Tj ET\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = objs.map((o, i) => {
    const at = pdf.length;
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
    return at;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
}
