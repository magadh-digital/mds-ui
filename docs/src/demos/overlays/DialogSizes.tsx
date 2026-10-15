// demo: the four Dialog sizes
import { useState } from "react";
import { Button, Dialog, type DialogSize } from "@mds/ui";

const SIZES: Array<{ size: DialogSize; width: string }> = [
  { size: "sm", width: "420 px" },
  { size: "md", width: "900 px" },
  { size: "lg", width: "1100 px" },
  { size: "xl", width: "1280 px" },
];

export default function DialogSizes() {
  const [size, setSize] = useState<DialogSize | null>(null);
  return (
    <div className="mds-hstack" style={{ gap: 8 }}>
      {SIZES.map((s) => (
        <Button key={s.size} onClick={() => setSize(s.size)}>{s.size}</Button>
      ))}
      <Dialog open={size !== null} size={size ?? "md"} onClose={() => setSize(null)} title={`Size ${size}`}>
        <p style={{ margin: 0 }}>
          This frame is {SIZES.find((s) => s.size === size)?.width} wide, never wider than the window. Press Esc, the ×, or
          click the backdrop to close it.
        </p>
      </Dialog>
    </div>
  );
}
