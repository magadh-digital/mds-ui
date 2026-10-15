import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { FileThumb, useFileViewer, type ViewerFile } from "../display/fileviewer";

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
  ariaLabel = "Choose files",
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
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const viewer = useFileViewer();
  // object URLs for the picked files' previews, revoked when they go
  const previews = useMemo(
    () => files.map((f) => ({ src: URL.createObjectURL(f), name: f.name, kind: kindOfFile(f) }) as ViewerFile),
    [files],
  );
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.src)), [previews]);

  const add = (list: FileList | File[] | null) => {
    if (!list) return;
    const errs: string[] = [];
    let next = multiple ? [...files] : [];
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
    }
    if (maxFiles && next.length > maxFiles) {
      errs.push(`At most ${maxFiles} files`);
      next = next.slice(0, maxFiles);
    }
    setErrors(errs);
    onChange(next);
  };

  const all: ViewerFile[] = [...(existing ?? []), ...previews];
  const label = multiple
    ? "Drop files here or click to choose"
    : files.length
      ? "Drop or click to replace"
      : "Drop a file here or click to choose";
  return (
    <div className="ui-fileinput">
      <button
        type="button"
        className={`ui-fileinput-zone${over ? " over" : ""}`}
        disabled={disabled}
        aria-label={ariaLabel}
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
        <span>{label}</span>
        {(hint || accept || maxSizeMb) && (
          <span className="ui-muted ui-fileinput-hint">
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
        <div className="ui-fileinput-list">
          {all.map((f, i) => {
            const picked = i >= (existing?.length ?? 0);
            return (
              <div key={`${f.src}-${i}`} className="ui-fileinput-item">
                <FileThumb file={f} size="sm" onOpen={() => viewer.open(all, i)} />
                <span className="ui-fileinput-name" title={f.name}>
                  {f.name}
                </span>
                {picked && (
                  <button
                    type="button"
                    className="ui-iconbtn"
                    aria-label={`Remove ${f.name}`}
                    onClick={() => onChange(files.filter((_, k) => k !== i - (existing?.length ?? 0)))}
                  >
                    <X />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {errors.map((e) => (
        <div key={e} className="ui-error">
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
