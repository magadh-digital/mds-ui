// demo: Pop showing a partner's contacts under a link
import { Button, LinkButton, Pop } from "@mds/ui";
import { Phone } from "lucide-react";

export default function PopBasic() {
  return (
    <Pop trigger={<LinkButton>Shree Balaji Traders</LinkButton>} label="Contacts" placement="bottom-start" width="260px">
      <div className="mds-vstack" style={{ gap: 6 }}>
        <strong>Ramesh Gupta</strong>
        <span className="mds-muted">Purchase head · Gaya</span>
        <span className="mds-num">+91 98350 41122</span>
        <Button size="sm" icon={<Phone />}>Call</Button>
      </div>
    </Pop>
  );
}
