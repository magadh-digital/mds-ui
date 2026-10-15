import { useEffect, useId, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { FileThumb, useFileViewer, type ViewerFile } from "../display/fileviewer.js";
import { joinIds, useFieldControl } from "./field.js";

/**
 * The kit's one file input: click or drop, the type / size / count checks every upload form
 * used to copy, and previews that open in the file viewer. Pages keep their own request (FormData field names stay).
 *
 *   <FileInput accept="image/*" multiple maxFiles={10} maxSizeMb={5} files={files} onChange={setFiles} />
 */

export function FileInput({
  files,
  onChange,
  accept,
  multiple = false,
  maxFiles,
  maxSizeMb,
  existing,
  hint,
  disabled,
  label,
  id,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  /** e.g. "image/*", "image/*,application/pdf", ".xlsx" */
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMb?: number;
  /** files already saved (an edit form): shown first, opened in the viewer */
  existing?: ViewerFile[];
  hint?: string;
  disabled?: boolean;
  /** the accessible name, when no visible label (a FormRow) names the input */
  label?: string;
  id?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const viewer = useFileViewer();
  const promptId = useId();
  const hintId = useId();
  const { id: zoneId, field } = useFieldControl(id);
  // object URLs for the picked files' previews: made and revoked in one effect, so a StrictMode re-run or a new list
  // never revokes a URL still on screen
  const [previews, setPreviews] = useState<Array<ViewerFile & { file: File }>>([]);
  useEffect(() => {
    const list = files.map((f) => ({ src: URL.createObjectURL(f), name: f.name, kind: kindOfFile(f), file: f }));
    setPreviews(list);
    return () => list.forEach((p) => URL.revokeObjectURL(p.src));
  }, [files]);

  const add = (list: FileList | File[] | null) => {
    if (!list) return;
    const errs: string[] = [];
    // start from the files there are: a refused file changes nothing, an accepted one adds (or, single, replaces)
    let next = [...files];
    let changed = false;
    for (const f of Array.from(list)) {
      if (accept && !matchesAccept(f, accept)) {
        errs.push(`${f.name}: not an accepted file type`);
        continue;
      }
      if (maxSizeMb && f.size > maxSizeMb * 1024 * 1024) {
        errs.push(`${f.name}: larger than ${maxSizeMb} MB`);
        continue;
      }
      next = multiple ? [...next, f] : [f];
      changed = true;
    }
    if (maxFiles && next.length > maxFiles) {
      errs.push(`At most ${maxFiles} files`);
      next = next.slice(0, maxFiles);
      changed = true;
    }
    setErrors(errs);
    if (changed) onChange(next);
  };

  const all: ViewerFile[] = [...(existing ?? []), ...previews];
  const prompt = multiple
    ? "Drop files here or click to choose"
    : files.length
      ? "Drop or click to replace"
      : "Drop a file here or click to choose";
  return (
    <div className="mds-fileinput">
      <button
        type="button"
        className={`mds-fileinput-zone${over ? " over" : ""}`}
        disabled={disabled}
        id={zoneId}
        aria-label={label}
        aria-labelledby={!label && field ? `${field.labelId} ${promptId}` : undefined}
        aria-describedby={joinIds(field?.describedBy, hint || accept || maxSizeMb ? hintId : undefined)}
        onClick={() => ref.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          add(e.dataTransfer.files);
        }}
      >
        <Upload aria-hidden />
        <span id={promptId}>{prompt}</span>
        {(hint || accept || maxSizeMb) && (
          <span className="mds-muted mds-fileinput-hint" id={hintId}>
            {hint ??
              [accept && describeAccept(accept), maxSizeMb && `up to ${maxSizeMb} MB`, maxFiles && multiple && `max ${maxFiles}`]
                .filter(Boolean)
                .join(" · ")}
          </span>
        )}
      </button>
      <input
        ref={ref}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />
      {all.length > 0 && (
        <div className="mds-fileinput-list">
          {all.map((f, i) => {
            const own = "file" in f ? (f as { file: File }).file : null;
            return (
              <div key={`${f.src}-${i}`} className="mds-fileinput-item">
                <FileThumb file={f} size="sm" onOpen={() => viewer.open(all, i)} />
                <span className="mds-fileinput-name" title={f.name}>
                  {f.name}
                </span>
                {own && (
                  <button
                    type="button"
                    className="mds-iconbtn"
                    aria-label={`Remove ${f.name}`}
                    onClick={() => onChange(files.filter((x) => x !== own))}
                  >
                    <X aria-hidden />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {errors.map((e) => (
        <div key={e} className="mds-error" role="alert">
          {e}
        </div>
      ))}
      {viewer.element}
    </div>
  );
}

const kindOfFile = (f: File): ViewerFile["kind"] =>
  f.type.startsWith("image/") ? "image" : f.type === "application/pdf" ? "pdf" : "file";

function matchesAccept(f: File, accept: string) {
  return accept
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean)
    .some((a) =>
      a.startsWith(".")
        ? f.name.toLowerCase().endsWith(a)
        : a.endsWith("/*")
          ? f.type.toLowerCase().startsWith(a.slice(0, -1))
          : f.type.toLowerCase() === a,
    );
}
function describeAccept(accept: string) {
  const parts = accept.split(",").map((a) => a.trim());
  const words = parts.map((a) =>
    a === "image/*" ? "images" : a === "application/pdf" ? "PDF" : a.startsWith(".") ? a.slice(1).toUpperCase() : a,
  );
  return words.join(", ");
}
