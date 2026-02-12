"use client";

import { useAppStore } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import { Trash2, Calendar, MapPin } from "lucide-react";

export function EventDetailModal({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const event = useAppStore((s) => s.events.find((e) => e.id === eventId));
  const projects = useAppStore((s) => s.projects);
  const updateEvent = useAppStore((s) => s.updateEvent);
  const deleteEvent = useAppStore((s) => s.deleteEvent);

  if (!event) return null;

  const project = projects.find((p) => p.id === event.projectId);

  const handleDelete = () => {
    if (confirm("Delete this event?")) { deleteEvent(event.id); onClose(); }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

  return (
    <Modal open onClose={onClose} title="Event Details">
      <div className="space-y-4">
        <input
          className="w-full text-lg font-semibold bg-transparent border-none focus:outline-none text-[var(--color-text-primary)]"
          value={event.title}
          onChange={(e) => updateEvent(event.id, { title: e.target.value })}
        />

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.color }} />
          <Badge>{event.type}</Badge>
          {project && <Badge style={{ backgroundColor: project.color + "20", color: project.color }}>{project.name}</Badge>}
        </div>

        <textarea
          className={`${inputClass} min-h-[60px] resize-y`}
          placeholder="Description..."
          value={event.description}
          onChange={(e) => updateEvent(event.id, { description: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Start</label>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <Calendar size={14} /> {formatDateTime(event.start)}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">End</label>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <Calendar size={14} /> {formatDateTime(event.end)}
            </div>
          </div>
        </div>

        {event.allDay && <Badge variant="info">All Day</Badge>}

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <Button variant="danger" size="sm" onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
