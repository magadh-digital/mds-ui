import { type KeyboardEvent as ReactKeyboardEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DIALOG_SELECTOR, isTextEntry, listOpen } from "../overlay/dialog.js";
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
 * - Esc closes; + / − zoom; 0 resets; R rotates. The keys work while the focus is in the viewer (it moves in on open,
 *   Tab stays inside, and it returns on close), never while typing in a field, and not when a layer above has taken
 *   them. The backdrop carries `.inv-backdrop`, so tables and panels under it leave their keyboard shortcuts alone
 *   while it is open (dialog.tsx `dialogOpen`).
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

/** @internal */
export function kindOf(f: ViewerFile): "image" | "pdf" | "file" | "unknown" {
  if (f.kind) return f.kind;
  const s = `${f.name ?? ""} ${f.src}`;
  if (IMG.test(s)) return "image";
  if (PDF.test(s)) return "pdf";
  if (DOC.test(s)) return "file";
  return "unknown";
}
const nameOf = (f: ViewerFile) => {
  if (f.name) return f.name;
  const last = f.src.split(/[?#]/)[0]!.split("/").pop() || "file";
  try {
    return decodeURIComponent(last);
  } catch {
    return last; // a bare "%" in the URL
  }
};
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

/** Opens files in the viewer: `open(files, index)`; render `element` once. */
export function useFileViewer() {
  const [state, setState] = useState<{ files: ViewerFile[]; index: number } | null>(null);
  const open = useCallback((files: ViewerFile | ViewerFile[], index = 0) => {
    const list = (Array.isArray(files) ? files : [files]).filter((f) => !!f?.src);
    if (list.length) setState({ files: list, index: Math.min(Math.max(index, 0), list.length - 1) });
  }, []);
  const close = useCallback(() => setState(null), []);
  const onIndex = useCallback((i: number) => setState((s) => (s ? { ...s, index: i } : s)), []);
  return {
    open,
    close,
    isOpen: !!state,
    element: state ? (
      <FileViewer
        files={state.files}
        index={state.index}
        onIndex={onIndex}
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
  const root = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  // focus moves into the viewer on open and back where it was on close
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    root.current?.focus({ preventScroll: true });
    return () => {
      if (before && before.isConnected) before.focus({ preventScroll: true });
    };
  }, []);
  // the viewer's keys, in the bubble phase: not while typing, not for a target outside the viewer, not when a layer
  // above (a dialog, a list) or a field has already handled the key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = root.current;
      if (!el) return;
      const layers = document.querySelectorAll(DIALOG_SELECTOR);
      if (layers[layers.length - 1] !== el) return;
      const t = e.target instanceof Element ? e.target : null;
      if (t && t !== document.body && !el.contains(t)) return;
      if (isTextEntry(t)) return;
      const k = e.key;
      if (k === "Escape") {
        if (listOpen()) return;
        closeRef.current();
      } else if (k === "ArrowRight") go(1);
      else if (k === "ArrowLeft") go(-1);
      else if (k === "+" || k === "=") setZoom((z) => Math.min(z + 0.25, 4));
      else if (k === "-" || k === "_") setZoom((z) => Math.max(z - 0.25, 0.5));
      else if (k === "0") setZoom(1);
      else if (k === "r" || k === "R") setRotate((r) => (r + 90) % 360);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);
  // Tab stays inside the viewer
  const onTab = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !root.current) return;
    const els = Array.from(root.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (x) => x.offsetParent !== null || x === document.activeElement,
    );
    if (!els.length) {
      e.preventDefault();
      return;
    }
    const first = els[0]!;
    const last = els[els.length - 1]!;
    const a = document.activeElement;
    if (e.shiftKey && (a === first || a === root.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (a === last || !root.current.contains(a))) {
      e.preventDefault();
      first.focus();
    }
  };
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
      ref={root}
      className="inv-backdrop fv"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={onTab}
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
              <button type="button" className="fv-btn" onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))} aria-label="Zoom out" title="Zoom out (−)">
                <ZoomOut />
              </button>
              <button type="button" className="fv-btn fv-zoom ui-num" onClick={() => setZoom(1)} title="Actual fit (0)" aria-label={`Zoom ${Math.round(zoom * 100)}%, reset`}>
                {Math.round(zoom * 100)}%
              </button>
              <button type="button" className="fv-btn" onClick={() => setZoom((z) => Math.min(z + 0.25, 4))} aria-label="Zoom in" title="Zoom in (+)">
                <ZoomIn />
              </button>
              <button type="button" className="fv-btn" onClick={() => setRotate((r) => (r + 90) % 360)} aria-label="Rotate" title="Rotate (R)">
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
          <button type="button" className="fv-btn" onClick={onClose} aria-label="Close" title="Close (Esc)">
            <X />
          </button>
        </div>
      </div>

      <div className="fv-stage" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        {many && (
          <button type="button" className="fv-nav prev" onClick={() => go(-1)} aria-label="Previous (←)" title="Previous (←)">
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
          <button type="button" className="fv-nav next" onClick={() => go(1)} aria-label="Next (→)" title="Next (→)">
            <ChevronRight />
          </button>
        )}
      </div>

      {many && (
        <div className="fv-strip" role="group" aria-label="Files">
          {files.map((f, i) => (
            <button type="button"
              key={`${f.src}-${i}`}
              aria-current={i === index ? "true" : undefined}
              aria-label={`${nameOf(f)} (${i + 1} of ${files.length})`}
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
