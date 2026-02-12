"use client";

import { useEffect, useState } from "react";
import { X, Maximize2, Minimize2, Download, FileText, FileSpreadsheet, File, Image, Film } from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { formatFileSize, relativeDate, cn } from "@/lib/utils";
import type { FileItem } from "@/lib/types";

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type.includes("spreadsheet") || type.includes("excel")) return FileSpreadsheet;
  if (type.startsWith("video/")) return Film;
  if (type.includes("pdf") || type.includes("word") || type.includes("document")) return FileText;
  return File;
}

function getIconColor(type: string) {
  if (type.startsWith("image/")) return "#22c55e";
  if (type.includes("spreadsheet")) return "#22c55e";
  if (type.startsWith("video/")) return "#8b5cf6";
  if (type.includes("pdf")) return "#ef4444";
  if (type.includes("word")) return "#3b82f6";
  return "#94a3b8";
}

function isPreviewable(type: string): boolean {
  return type.startsWith("image/") || type.includes("pdf") || type.startsWith("video/");
}

function getPreviewType(type: string): "image" | "pdf" | "video" | "unsupported" {
  if (type.startsWith("image/")) return "image";
  if (type.includes("pdf")) return "pdf";
  if (type.startsWith("video/")) return "video";
  return "unsupported";
}

interface FileViewerProps {
  file: FileItem | null;
  onClose: () => void;
}

export function FileViewer({ file, onClose }: FileViewerProps) {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (file) {
      document.body.style.overflow = "hidden";
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          if (fullscreen) setFullscreen(false);
          else onClose();
        }
      };
      window.addEventListener("keydown", handler);
      return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handler); };
    } else {
      document.body.style.overflow = "";
    }
  }, [file, fullscreen, onClose]);

  if (!file) return null;

  const previewType = getPreviewType(file.type);
  const Icon = getFileIcon(file.type);
  const iconColor = getIconColor(file.type);

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-fade-in">
        <div className="flex items-center justify-between px-6 py-3 bg-black/80">
          <p className="text-white text-sm font-medium truncate">{file.name}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setFullscreen(false)} className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer">
              <Minimize2 size={18} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <FilePreviewContent type={previewType} file={file} fullscreen />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Slide-in panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col bg-[var(--color-surface)] shadow-2xl border-l border-[var(--color-border)]"
        style={{ width: "min(560px, 90vw)", animation: "slideInRight 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconColor + "18" }}>
              <Icon size={16} style={{ color: iconColor }} />
            </div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{file.name}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isPreviewable(file.type) && (
              <button onClick={() => setFullscreen(true)} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors cursor-pointer" title="Fullscreen">
                <Maximize2 size={16} />
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-[var(--color-background)] flex items-center justify-center p-6">
          <FilePreviewContent type={previewType} file={file} />
        </div>

        {/* File Info */}
        <div className="shrink-0 border-t border-[var(--color-border)] px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[var(--color-text-muted)] block">Size</span>
              <span className="text-[var(--color-text-primary)] font-medium">{formatFileSize(file.size)}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)] block">Type</span>
              <span className="text-[var(--color-text-primary)] font-medium">{file.type.split("/").pop()?.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)] block">Uploaded by</span>
              <span className="text-[var(--color-text-primary)] font-medium">{file.uploadedBy}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)] block">Uploaded</span>
              <span className="text-[var(--color-text-primary)] font-medium">{relativeDate(file.uploadedAt)}</span>
            </div>
          </div>
          {file.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {file.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
            </div>
          )}
          <Button variant="outline" className="w-full" size="sm">
            <Download size={14} /> Download File
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

function FilePreviewContent({ type, file, fullscreen }: { type: "image" | "pdf" | "video" | "unsupported"; file: FileItem; fullscreen?: boolean }) {
  const Icon = getFileIcon(file.type);
  const iconColor = getIconColor(file.type);

  switch (type) {
    case "image":
      return (
        <div className={cn("flex flex-col items-center gap-4", fullscreen ? "max-h-full" : "w-full")}>
          {/* Demo placeholder - in production this would use file.url */}
          <div className={cn("rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center", fullscreen ? "max-w-[90vw] max-h-[85vh]" : "w-full aspect-[4/3]")}>
            <div className="text-center p-8">
              <Image size={48} style={{ color: iconColor }} className="mx-auto mb-3" />
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{file.name}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Image preview</p>
            </div>
          </div>
        </div>
      );
    case "pdf":
      return (
        <div className={cn("flex flex-col items-center gap-4", fullscreen ? "w-full h-full" : "w-full")}>
          <div className={cn("rounded-xl overflow-hidden border border-[var(--color-border)] bg-white flex items-center justify-center", fullscreen ? "w-full h-full" : "w-full aspect-[3/4]")}>
            <div className="text-center p-8">
              <FileText size={48} className="mx-auto mb-3 text-[#ef4444]" />
              <p className="text-sm font-medium text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-500 mt-1">PDF document preview</p>
              <p className="text-xs text-gray-400 mt-3">{formatFileSize(file.size)}</p>
            </div>
          </div>
        </div>
      );
    case "video":
      return (
        <div className={cn("flex flex-col items-center gap-4", fullscreen ? "w-full h-full" : "w-full")}>
          <div className={cn("rounded-xl overflow-hidden border border-[var(--color-border)] bg-black flex items-center justify-center relative", fullscreen ? "w-full h-full" : "w-full aspect-video")}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[18px] border-l-white ml-1" />
              </div>
              <p className="text-sm font-medium text-white">{file.name}</p>
              <p className="text-xs text-white/60 mt-1">Video preview</p>
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="text-center p-8 w-full">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: iconColor + "15" }}>
            <Icon size={36} style={{ color: iconColor }} />
          </div>
          <p className="text-base font-semibold text-[var(--color-text-primary)] mb-1">{file.name}</p>
          <p className="text-sm text-[var(--color-text-muted)] mb-1">{formatFileSize(file.size)}</p>
          <p className="text-xs text-[var(--color-text-muted)] mb-6">
            This file type cannot be previewed in-platform.
            <br />Download to open in an external application.
          </p>
          <Button variant="primary" size="sm">
            <Download size={14} /> Download to Open
          </Button>
        </div>
      );
  }
}
