"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { ActivationRunOfShow } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Plus, CheckCircle, Clock, Trash2 } from "lucide-react";

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

export function TimelineView({ activationId, runOfShow }: { activationId: string; runOfShow: ActivationRunOfShow[] }) {
  const { addRunOfShowItem, completeRunOfShowItem, deleteRunOfShowItem } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);

  // Add form state
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [responsibleName, setResponsibleName] = useState("");

  const sortedItems = useMemo(() => [...runOfShow].sort((a, b) => a.order - b.order), [runOfShow]);
  const completedCount = sortedItems.filter((r) => r.completed).length;
  const pct = sortedItems.length > 0 ? Math.round((completedCount / sortedItems.length) * 100) : 0;

  const handleAdd = () => {
    if (!title.trim() || !time) return;
    addRunOfShowItem({
      activationId,
      time,
      endTime: endTime || null,
      title: title.trim(),
      description: description.trim(),
      responsiblePersonnelId: null,
      responsibleName: responsibleName.trim(),
      completed: false,
      completedAt: null,
      order: sortedItems.length,
    });
    setTime(""); setEndTime(""); setTitle(""); setDescription(""); setResponsibleName("");
    setShowAdd(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-sm text-[var(--color-text-primary)]">Run of Show</h4>
          <p className="text-xs text-[var(--color-text-muted)]">{completedCount}/{sortedItems.length} completed</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={14} className="mr-1" /> Add Item
        </Button>
      </div>

      {sortedItems.length > 0 && (
        <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
          <Clock size={14} />
          <div className="flex-1"><ProgressBar value={pct} /></div>
          <span className="text-xs">{pct}%</span>
        </div>
      )}

      {sortedItems.length === 0 ? (
        <div className="text-center py-8 text-[var(--color-text-muted)]">
          <Clock size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No run-of-show items yet</p>
          <p className="text-xs mt-1">Add timeline items to plan the event day schedule.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {sortedItems.map((item, idx) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors group">
              {/* Timeline dot + connector */}
              <div className="flex flex-col items-center mt-1">
                <button
                  onClick={() => { if (!item.completed) completeRunOfShowItem(item.id); }}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                    item.completed ? "bg-green-500 border-green-500 text-white" : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                  }`}
                >
                  {item.completed && <CheckCircle size={12} />}
                </button>
                {idx < sortedItems.length - 1 && <div className="w-0.5 h-6 bg-[var(--color-border)] mt-1" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
                    {item.time}{item.endTime ? ` – ${item.endTime}` : ""}
                  </span>
                  <span className={`font-medium text-sm ${item.completed ? "line-through text-[var(--color-text-muted)]" : "text-[var(--color-text-primary)]"}`}>
                    {item.title}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.description}</p>
                )}
                {item.responsibleName && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Responsible: {item.responsibleName}</p>
                )}
              </div>

              {/* Delete button (visible on hover) */}
              {!item.completed && (
                <button
                  onClick={() => deleteRunOfShowItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Timeline Item Modal */}
      {showAdd && (
        <Modal open={true} title="Add Run of Show Item" onClose={() => setShowAdd(false)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Start Time *</label>
                <input className={inputClass} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">End Time</label>
                <input className={inputClass} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Title *</label>
              <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Venue doors open" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Description</label>
              <textarea className={inputClass + " h-16 resize-none"} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Staff positions, music starts, welcome signage..." />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Responsible Person</label>
              <input className={inputClass} value={responsibleName} onChange={(e) => setResponsibleName(e.target.value)} placeholder="Maria Santos" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleAdd} disabled={!title.trim() || !time}>Add Item</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
