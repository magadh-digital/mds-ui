// demo: statusTone and statusLabel on their own
import { MiniTable, statusLabel, statusTone, ToneChip } from "@mds/ui";

const RAW = ["DELIVERED", "on_hold", "CANCELLED", "not-required", "MO_APPROVED", "QUALITY_CHECK", ""];

export default function StatusWords() {
  return (
    <MiniTable
      label="Status words"
      rows={RAW}
      rowKey={(s) => s || "(empty)"}
      cols={[
        { key: "raw", header: "Raw Value", cell: (s) => <code>{JSON.stringify(s)}</code> },
        { key: "label", header: "statusLabel", cell: (s) => statusLabel(s, ["MO"]) },
        { key: "tone", header: "statusTone", cell: (s) => statusTone(s) },
        { key: "chip", header: "Chip", cell: (s) => <ToneChip tone={statusTone(s)}>{statusLabel(s, ["MO"])}</ToneChip> },
      ]}
    />
  );
}
