// demo: Tip on buttons, one per placement
import { Button, Tip } from "@mds/ui";
import { Download, Printer, RefreshCw, Share2 } from "lucide-react";

export default function TipBasic() {
  return (
    <div className="mds-hstack" style={{ gap: 8 }}>
      <Tip label="Download the invoice as a PDF" placement="top">
        <Button icon={<Download />}>Download</Button>
      </Tip>
      <Tip label="Print with the dispatch note">
        <Button icon={<Printer />}>Print</Button>
      </Tip>
      <Tip label="Send the link to the partner" placement="right">
        <Button icon={<Share2 />}>Share</Button>
      </Tip>
      <Tip label="Last synced 4 minutes ago" placement="left">
        <Button icon={<RefreshCw />}>Sync</Button>
      </Tip>
    </div>
  );
}
