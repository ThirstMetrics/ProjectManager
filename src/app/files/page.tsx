"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useAppStore } from "@/lib/store";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { FileViewer } from "@/components/ui/FileViewer";
import { Plus, LayoutGrid, List, FileText, Image, FileSpreadsheet, Film, File, Upload, Trash2, Download, Search } from "lucide-react";
import { formatFileSize, relativeDate, cn } from "@/lib/utils";
import type { FileItem } from "@/lib/types";

const seedFiles = [
  { name: "brand-guidelines.pdf", size: 2400000, type: "application/pdf", folder: "/design", projectId: "proj-1", uploadedBy: "Alice", tags: ["design", "brand"] },
  { name: "hero-mockup.png", size: 850000, type: "image/png", folder: "/design", projectId: "proj-1", uploadedBy: "Alice", tags: ["mockup"] },
  { name: "sprint-plan.xlsx", size: 120000, type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", folder: "/planning", projectId: "proj-1", uploadedBy: "Bob", tags: ["planning"] },
  { name: "venue-contract.pdf", size: 1800000, type: "application/pdf", folder: "/logistics", projectId: "proj-2", uploadedBy: "Carol", tags: ["venue", "contract"] },
  { name: "tasting-menu.docx", size: 95000, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", folder: "/logistics", projectId: "proj-2", uploadedBy: "Carol", tags: ["menu"] },
  { name: "influencer-list.xlsx", size: 75000, type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", folder: "/marketing", projectId: "proj-2", uploadedBy: "Dave", tags: ["influencer"] },
  { name: "promo-video.mp4", size: 15000000, type: "video/mp4", folder: "/media", projectId: "proj-3", uploadedBy: "Eve", tags: ["video", "promo"] },
  { name: "email-copy-v2.docx", size: 42000, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", folder: "/copy", projectId: "proj-3", uploadedBy: "Eve", tags: ["email", "copy"] },
  { name: "pos-display-render.png", size: 2200000, type: "image/png", folder: "/design", projectId: "proj-2", uploadedBy: "Dave", tags: ["design", "pos"] },
  { name: "api-docs.pdf", size: 450000, type: "application/pdf", folder: "/docs", projectId: "proj-1", uploadedBy: "Bob", tags: ["documentation"] },
];

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

export default function FilesPage() {
  const files = useAppStore((s) => s.files);
  const addFile = useAppStore((s) => s.addFile);
  const deleteFile = useAppStore((s) => s.deleteFile);
  const projects = useAppStore((s) => s.projects);

  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadProject, setUploadProject] = useState("");
  const [uploadFolder] = useState("/");
  const [uploadedBy, setUploadedBy] = useState("");
  const [viewingFile, setViewingFile] = useState<FileItem | null>(null);

  // Seed files on first load
  useEffect(() => {
    if (files.length === 0) {
      seedFiles.forEach((f) => addFile({ ...f, url: "#" }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    return files.filter((f) => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterProject && f.projectId !== filterProject) return false;
      return true;
    });
  }, [files, search, filterProject]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    Array.from(fileList).forEach((file) => {
      addFile({
        projectId: uploadProject || projects[0]?.id || "",
        name: file.name,
        size: file.size,
        type: file.type,
        url: "#",
        folder: uploadFolder,
        uploadedBy: uploadedBy || "You",
        tags: [],
      });
    });
    setShowUpload(false);
  };

  const selectClass = "px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

  return (
    <AppShell title="Files">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text" placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className={selectClass}>
            <option value="">All Projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="flex-1" />
          <div className="flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-0.5">
            <button onClick={() => setView("grid")} className={`p-2 rounded-md transition-colors cursor-pointer ${view === "grid" ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-muted)]"}`}><LayoutGrid size={16} /></button>
            <button onClick={() => setView("list")} className={`p-2 rounded-md transition-colors cursor-pointer ${view === "list" ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-muted)]"}`}><List size={16} /></button>
          </div>
          <Button onClick={() => setShowUpload(true)}><Upload size={16} /> Upload</Button>
        </div>

        {/* File grid */}
        {view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map((file) => {
              const Icon = getFileIcon(file.type);
              const iconColor = getIconColor(file.type);
              const project = projects.find((p) => p.id === file.projectId);
              return (
                <Card key={file.id} hover onClick={() => setViewingFile(file)}>
                  <CardBody>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: iconColor + "18" }}>
                        <Icon size={24} style={{ color: iconColor }} />
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete this file?")) deleteFile(file.id); }} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate mb-1">{file.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{formatFileSize(file.size)}</p>
                    <div className="flex items-center justify-between mt-3">
                      {project && <Badge style={{ backgroundColor: project.color + "20", color: project.color }}>{project.name}</Badge>}
                      <span className="text-[10px] text-[var(--color-text-muted)]">{relativeDate(file.uploadedAt)}</span>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
            {filtered.length === 0 && <p className="col-span-4 text-center py-12 text-[var(--color-text-muted)]">No files found</p>}
          </div>
        ) : (
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-hover)]">
                  <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)]">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)]">Project</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)]">Size</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)]">Uploaded</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((file) => {
                  const Icon = getFileIcon(file.type);
                  const iconColor = getIconColor(file.type);
                  const project = projects.find((p) => p.id === file.projectId);
                  return (
                    <tr key={file.id} className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer" onClick={() => setViewingFile(file)}>
                      <td className="px-4 py-3 flex items-center gap-3">
                        <Icon size={18} style={{ color: iconColor }} />
                        <span className="font-medium text-[var(--color-text-primary)]">{file.name}</span>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{project?.name || "-"}</td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">{formatFileSize(file.size)}</td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">{relativeDate(file.uploadedAt)}</td>
                      <td className="px-4 py-3">
                        <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete?")) deleteFile(file.id); }} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] cursor-pointer"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Files">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-8 text-center hover:border-[var(--color-primary)] transition-colors">
            <Upload size={40} className="mx-auto text-[var(--color-text-muted)] mb-3" />
            <p className="text-sm text-[var(--color-text-secondary)] mb-2">Drag files here or click to browse</p>
            <input type="file" multiple onChange={handleUpload} className="hidden" id="file-upload" />
            <label htmlFor="file-upload">
              <Button variant="outline" size="sm" onClick={() => document.getElementById("file-upload")?.click()}>Browse Files</Button>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Project</label>
              <select value={uploadProject} onChange={(e) => setUploadProject(e.target.value)} className={selectClass + " w-full"}>
                <option value="">Select project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Uploaded By</label>
              <input className={selectClass + " w-full"} placeholder="Your name" value={uploadedBy} onChange={(e) => setUploadedBy(e.target.value)} />
            </div>
          </div>
        </div>
      </Modal>

      {/* File Viewer slide-in */}
      <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />
    </AppShell>
  );
}
