"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { ActivationMediaItem } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { relativeDate } from "@/lib/utils";
import { Plus, Image, Video, Check, Trash2, Eye, X } from "lucide-react";

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

export function MediaGallery({ activationId, media }: { activationId: string; media: ActivationMediaItem[] }) {
  const { addMediaItem, approveMediaItem, deleteMediaItem } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [viewItem, setViewItem] = useState<ActivationMediaItem | null>(null);
  const [filter, setFilter] = useState<"all" | "photo" | "video" | "pending">("all");

  // Add form state
  const [mediaType, setMediaType] = useState<"photo" | "video">("photo");
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [takenBy, setTakenBy] = useState("");
  const [tags, setTags] = useState("");

  const filteredMedia = useMemo(() => {
    if (filter === "pending") return media.filter((m) => !m.approved);
    if (filter === "photo") return media.filter((m) => m.type === "photo");
    if (filter === "video") return media.filter((m) => m.type === "video");
    return media;
  }, [media, filter]);

  const approvedCount = media.filter((m) => m.approved).length;
  const pendingCount = media.filter((m) => !m.approved).length;

  const handleAdd = () => {
    if (!url.trim()) return;
    addMediaItem({
      activationId,
      type: mediaType,
      url: url.trim(),
      thumbnailUrl: url.trim(),
      caption: caption.trim(),
      takenBy: takenBy.trim(),
      takenAt: new Date().toISOString(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      approved: false,
      approvedBy: null,
      fileSize: 0,
    });
    setUrl(""); setCaption(""); setTakenBy(""); setTags(""); setMediaType("photo");
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)]">Media Gallery</h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            {media.length} items — {approvedCount} approved, {pendingCount} pending
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={14} className="mr-1" /> Add Media
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex gap-1 bg-[var(--color-background)] rounded-lg p-1 w-fit">
        {([
          { key: "all" as const, label: `All (${media.length})` },
          { key: "photo" as const, label: `Photos (${media.filter((m) => m.type === "photo").length})` },
          { key: "video" as const, label: `Videos (${media.filter((m) => m.type === "video").length})` },
          { key: "pending" as const, label: `Pending (${pendingCount})` },
        ]).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filter === f.key
                ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <Image size={40} className="mx-auto mb-3 opacity-30" />
          <p>{filter === "pending" ? "No pending media items" : "No media uploaded yet"}</p>
          <p className="text-xs mt-1">Upload photos and videos from the activation event.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Thumbnail area */}
              <div
                className="aspect-square bg-[var(--color-background)] flex items-center justify-center cursor-pointer"
                onClick={() => setViewItem(item)}
              >
                {item.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || item.type === "photo" ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-background)]">
                    <Image size={32} className="text-[var(--color-text-muted)] opacity-40" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-[var(--color-background)]">
                    <Video size={32} className="text-[var(--color-text-muted)] opacity-40" />
                  </div>
                )}

                {/* Type indicator */}
                <div className="absolute top-2 left-2">
                  <span className="bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    {item.type === "photo" ? "IMG" : "VID"}
                  </span>
                </div>

                {/* Approval status */}
                <div className="absolute top-2 right-2">
                  {item.approved ? (
                    <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                      <Check size={10} /> Approved
                    </span>
                  ) : (
                    <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                      Pending
                    </span>
                  )}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Caption & meta */}
              <div className="p-2.5">
                <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">
                  {item.caption || "Untitled"}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {item.takenBy && `by ${item.takenBy} — `}{relativeDate(item.takenAt)}
                </p>
                {item.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-background)] text-[var(--color-text-muted)]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View/Detail Modal */}
      {viewItem && (
        <Modal open={true} title={viewItem.caption || "Media Detail"} onClose={() => setViewItem(null)} wide>
          <div className="space-y-4">
            {/* Preview area */}
            <div className="aspect-video bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg flex items-center justify-center">
              {viewItem.type === "photo" ? (
                <div className="flex flex-col items-center gap-2">
                  <Image size={48} className="text-[var(--color-text-muted)] opacity-40" />
                  <p className="text-xs text-[var(--color-text-muted)]">Image preview (real file storage not yet connected)</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Video size={48} className="text-[var(--color-text-muted)] opacity-40" />
                  <p className="text-xs text-[var(--color-text-muted)]">Video preview (real file storage not yet connected)</p>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">Type</p>
                <p className="text-[var(--color-text-primary)] capitalize">{viewItem.type}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">Taken By</p>
                <p className="text-[var(--color-text-primary)]">{viewItem.takenBy || "Unknown"}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">Date</p>
                <p className="text-[var(--color-text-primary)]">{new Date(viewItem.takenAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">Status</p>
                <Badge size="sm" variant={viewItem.approved ? "success" : "warning"}>
                  {viewItem.approved ? `Approved by ${viewItem.approvedBy}` : "Pending Review"}
                </Badge>
              </div>
            </div>

            {/* Tags */}
            {viewItem.tags.length > 0 && (
              <div>
                <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold mb-1">Tags</p>
                <div className="flex gap-1.5 flex-wrap">
                  {viewItem.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-[var(--color-background)] text-[var(--color-text-primary)]">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* URL */}
            <div>
              <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold mb-1">URL</p>
              <p className="text-xs text-[var(--color-primary)] break-all">{viewItem.url}</p>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)]">
              <button
                onClick={() => { deleteMediaItem(viewItem.id); setViewItem(null); }}
                className="text-xs text-red-500 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Trash2 size={13} /> Delete
              </button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setViewItem(null)}>Close</Button>
                {!viewItem.approved && (
                  <Button variant="primary" size="sm" onClick={() => { approveMediaItem(viewItem.id, "you"); setViewItem({ ...viewItem, approved: true, approvedBy: "you" }); }}>
                    <Check size={14} className="mr-1" /> Approve
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Media Modal */}
      {showAdd && (
        <Modal open={true} title="Add Media" onClose={() => setShowAdd(false)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Type</label>
                <select className={inputClass} value={mediaType} onChange={(e) => setMediaType(e.target.value as "photo" | "video")}>
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Taken By</label>
                <input className={inputClass} value={takenBy} onChange={(e) => setTakenBy(e.target.value)} placeholder="Maria Santos" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">URL</label>
              <input className={inputClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://storage.example.com/photo-001.jpg" />
              <p className="text-xs text-[var(--color-text-muted)] mt-1">File upload will be available after storage integration.</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Caption</label>
              <input className={inputClass} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Brand ambassador engaging guests at station 1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Tags (comma-separated)</label>
              <input className={inputClass} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="setup, branding, champagne" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleAdd} disabled={!url.trim()}>Add Media</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
