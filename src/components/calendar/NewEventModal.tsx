"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const eventColors = ["#6366f1", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6"];
const eventTypes = [
  { value: "event", label: "Event" },
  { value: "meeting", label: "Meeting" },
  { value: "milestone", label: "Milestone" },
  { value: "deadline", label: "Deadline" },
] as const;

export function NewEventModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const projects = useAppStore((s) => s.projects);
  const addEvent = useAppStore((s) => s.addEvent);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [type, setType] = useState<"event" | "meeting" | "milestone" | "deadline">("event");
  const [projectId, setProjectId] = useState("");
  const [color, setColor] = useState(eventColors[0]);

  const handleSubmit = () => {
    if (!title.trim() || !start) return;
    addEvent({
      projectId: projectId || null,
      taskId: null,
      title: title.trim(),
      description,
      start: new Date(start).toISOString(),
      end: end ? new Date(end).toISOString() : new Date(start).toISOString(),
      allDay,
      color,
      type,
    });
    setTitle(""); setDescription(""); setStart(""); setEnd(""); setAllDay(false); setType("event"); setProjectId(""); setColor(eventColors[0]);
    onClose();
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

  return (
    <Modal open={open} onClose={onClose} title="New Event">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Title *</label>
          <input className={inputClass} placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Description</label>
          <textarea className={`${inputClass} min-h-[60px] resize-y`} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Start *</label>
            <input type={allDay ? "date" : "datetime-local"} className={inputClass} value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">End</label>
            <input type={allDay ? "date" : "datetime-local"} className={inputClass} value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] cursor-pointer">
          <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="rounded" /> All day
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className={inputClass}>
              {eventTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Project</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputClass}>
              <option value="">None</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Color</label>
          <div className="flex gap-2">
            {eventColors.map((c) => (
              <button key={c} onClick={() => setColor(c)} className="w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110" style={{ backgroundColor: c, outline: color === c ? `3px solid ${c}` : "2px solid transparent", outlineOffset: "2px" }} />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !start}>Create Event</Button>
        </div>
      </div>
    </Modal>
  );
}
