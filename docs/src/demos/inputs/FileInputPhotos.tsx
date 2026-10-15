// demo: FileInput for several photos
import { useState } from "react";
import { FileInput, FormRow } from "@mds/ui";

export default function FileInputPhotos() {
  const [photos, setPhotos] = useState<Array<File>>([]);
  return (
    <FormRow label="Delivery photos" hint="The truck, the unloaded stock and the signed challan">
      <FileInput accept="image/*" multiple maxFiles={3} maxSizeMb={5} files={photos} onChange={setPhotos} />
    </FormRow>
  );
}
