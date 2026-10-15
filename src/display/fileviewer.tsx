import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Download, ExternalLink, FileText, RotateCw, X, ZoomIn, ZoomOut } from "lucide-react";

/**
 * The kit's one way to open an image or a file.
 *
 *   const viewer = useFileViewer();
 *   <FileThumb file={f} onOpen={() => viewer.open(files, i)} />
 *   {viewer.element}
 *
 * - Full-screen viewer over the page: images fit the screen (zoom, rotate), PDFs render inline, anything else gets a
 *   card with Open / Download.
 * - More than one file: ← / → (or the side arrows, or the strip of thumbnails) move between them; "2 / 5" in the head.
 * - Esc closes; + / − zoom; 0 resets; R rotates. The backdrop carries `.inv-backdrop`, so tables and panels under it
 *   leave their keyboard shortcuts alone while it is open (dialog.tsx `dialogOpen`).
 * - Files are plain URLs, so it works for every service; `kind` is guessed from the name / URL when not given, and a
 *   URL with no extension (the static service's `/files/preview/<id>`) is tried as an image first, then shown inline.
 */

export type ViewerFile = {
  /** the URL to show / open */
  src: string;
  /** shown in the head and on the download; defaults to the URL's last part */
  name?: string;
  /** guessed from the name / URL when absent */
  kind?: "image" | "pdf" | "file";
  /** a line under the head (who uploaded it, when, what it proves) */
  caption?: ReactNode;
  /** a smaller URL for thumbnails; defaults to `src` */
  thumb?: string;
};

const IMG = /\.(png|jpe?g|gif|webp|avif|bmp|svg|heic)(\?|#|$)/i;
const PDF = /\.pdf(\?|#|$)/i;
const DOC = /\.(xlsx?|csv|docx?|pptx?|zip|txt|json)(\?|#|$)/i;

export function kindOf(f: ViewerFile): "image" | "pdf" | "file" | "unknown" {
  if (f.kind) return f.kind;
  const s = `${f.name ?? ""} ${f.src}`;
  if (IMG.test(s)) return "image";
  if (PDF.test(s)) return "pdf";
  if (DOC.test(s)) return "file";
  return "unknown";
}
const nameOf = (f: ViewerFile) =>
  f.name ?? decodeURIComponent(f.src.split(/[?#]/)[0]!.split("/").pop() || "file");

/** Opens files in the viewer: `open(files, index)`; render `element` once. */
export function useFileViewer() {
  const [state, setState] = useState<{ files: ViewerFile[]; index: number } | null>(null);
  const open = useCallback((files: ViewerFile | ViewerFile[], index = 0) => {
    const list = (Array.isArray(files) ? files : [files]).filter((f) => !!f?.src);
    if (list.length) setState({ files: list, index: Math.min(Math.max(index, 0), list.length - 1) });
  }, []);
  const close = useCallback(() => setState(null), []);
  return {
    open,
    close,
    isOpen: !!state,
    element: state ? (
      <FileViewer
        files={state.files}
        index={state.index}
        onIndex={(i) => setState((s) => (s ? { ...s, index: i } : s))}
        onClose={close}
      />
    ) : null,
  };
}

export function FileViewer({
  files,
  index,
  onIndex,
  onClose,
}: {
  files: ViewerFile[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const file = files[index]!;
  const many = files.length > 1;
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  // a URL with no extension: try it as an image, fall back to showing it inline
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const kind = kindOf(file);
  const asImage = kind === "image" || (kind === "unknown" && !failed[file.src]);

  const go = useCallback(
    (d: number) => {
      if (!many) return;
      onIndex((index + d + files.length) % files.length);
    },
    [index, many, files.length, onIndex],
  );
  useEffect(() => {
    setZoom(1);
    setRotate(0);
  }, [index]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === "Escape") onClose();
      else if (k === "ArrowRight") go(1);
      else if (k === "ArrowLeft") go(-1);
      else if (k === "+" || k === "=") setZoom((z) => Math.min(z + 0.25, 4));
      else if (k === "-" || k === "_") setZoom((z) => Math.max(z - 0.25, 0.5));
      else if (k === "0") setZoom(1);
      else if (k === "r" || k === "R") setRotate((r) => (r + 90) % 360);
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [go, onClose]);
  // keep the page from scrolling under the viewer
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const name = nameOf(file);
  return createPortal(
    <div
      className="inv-backdrop fv"
      role="dialog"
      aria-modal="true"
      aria-label={`${name}${many ? ` (${index + 1} of ${files.length})` : ""}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="fv-head">
        <div className="fv-title">
          <span className="fv-name" title={name}>
            {name}
          </span>
          {many && (
            <span className="fv-count ui-num">
              {index + 1} / {files.length}
            </span>
          )}
          {file.caption && <span className="fv-caption">{file.caption}</span>}
        </div>
        <div className="fv-tools">
          {asImage && (
            <>
              <button className="fv-btn" onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))} aria-label="Zoom out" title="Zoom out (−)">
                <ZoomOut />
              </button>
              <button className="fv-btn fv-zoom ui-num" onClick={() => setZoom(1)} title="Actual fit (0)">
                {Math.round(zoom * 100)}%
              </button>
              <button className="fv-btn" onClick={() => setZoom((z) => Math.min(z + 0.25, 4))} aria-label="Zoom in" title="Zoom in (+)">
                <ZoomIn />
              </button>
              <button className="fv-btn" onClick={() => setRotate((r) => (r + 90) % 360)} aria-label="Rotate" title="Rotate (R)">
                <RotateCw />
              </button>
            </>
          )}
          <a className="fv-btn" href={file.src} target="_blank" rel="noreferrer" aria-label="Open in a new tab" title="Open in a new tab">
            <ExternalLink />
          </a>
          <a className="fv-btn" href={file.src} download={name} aria-label="Download" title="Download">
            <Download />
          </a>
          <button className="fv-btn" onClick={onClose} aria-label="Close" title="Close (Esc)">
            <X />
          </button>
        </div>
      </div>

      <div className="fv-stage" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        {many && (
          <button className="fv-nav prev" onClick={() => go(-1)} aria-label="Previous (←)" title="Previous (←)">
            <ChevronLeft />
          </button>
        )}
        {asImage ? (
          <img
            key={file.src}
            className="fv-img"
            src={file.src}
            alt={name}
            style={{ transform: `scale(${zoom}) rotate(${rotate}deg)` }}
            onError={() => setFailed((m) => ({ ...m, [file.src]: true }))}
            onDoubleClick={() => setZoom((z) => (z === 1 ? 2 : 1))}
          />
        ) : kind === "pdf" || kind === "unknown" ? (
          <iframe key={file.src} className="fv-frame" src={file.src} title={name} />
        ) : (
          <div className="fv-card">
            <FileText />
            <span className="fv-name">{name}</span>
            <span className="ui-muted">This file type cannot be shown here.</span>
            <div className="hstack" style={{ gap: 8 }}>
              <a className="ui-btn" href={file.src} target="_blank" rel="noreferrer">
                <ExternalLink /> Open
              </a>
              <a className="ui-btn primary" href={file.src} download={name}>
                <Download /> Download
              </a>
            </div>
          </div>
        )}
        {many && (
          <button className="fv-nav next" onClick={() => go(1)} aria-label="Next (→)" title="Next (→)">
            <ChevronRight />
          </button>
        )}
      </div>

      {many && (
        <div className="fv-strip" role="tablist" aria-label="Files">
          {files.map((f, i) => (
            <button
              key={`${f.src}-${i}`}
              role="tab"
              aria-selected={i === index}
              className={`fv-thumb${i === index ? " on" : ""}`}
              onClick={() => onIndex(i)}
              title={nameOf(f)}
            >
              <ThumbImage file={f} />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}

function ThumbImage({ file }: { file: ViewerFile }) {
  const [broken, setBroken] = useState(false);
  const kind = kindOf(file);
  if (broken || kind === "pdf" || kind === "file")
    return (
      <span className="fv-thumb-icon">
        <FileText />
        <span>{kind === "pdf" ? "PDF" : kind === "file" ? "File" : ""}</span>
      </span>
    );
  return <img src={file.thumb ?? file.src} alt="" loading="lazy" onError={() => setBroken(true)} />;
}

/**
 * A thumbnail that opens the viewer: the one way pages show "a photo / file you can open" (odometer photos, visit
 * photos, bills, KYC pages). Shows "No photo" / "Unavailable" itself.
 */
export function FileThumb({
  file,
  onOpen,
  size = "md",
  emptyLabel = "No file",
}: {
  file: ViewerFile | null | undefined;
  onOpen?: () => void;
  size?: "sm" | "md" | "lg";
  emptyLabel?: string;
}) {
  const [broken, setBroken] = useState(false);
  const kind = file ? kindOf(file) : "unknown";
  const label = useMemo(() => (file ? nameOf(file) : emptyLabel), [file, emptyLabel]);
  if (!file?.src)
    return (
      <span className={`fv-tile ${size} empty`}>
        <span className="ui-muted">{emptyLabel}</span>
      </span>
    );
  return (
    <button
      type="button"
      className={`fv-tile ${size}`}
      onClick={(e) => {
        e.stopPropagation();
        onOpen?.();
      }}
      title={`Open ${label}`}
      aria-label={`Open ${label}`}
    >
      {kind === "pdf" || kind === "file" || broken ? (
        <span className="fv-thumb-icon">
          <FileText />
          <span>{broken ? "Unavailable" : kind === "pdf" ? "PDF" : "File"}</span>
        </span>
      ) : (
        <img src={file.thumb ?? file.src} alt={label} loading="lazy" onError={() => setBroken(true)} />
      )}
    </button>
  );
}
