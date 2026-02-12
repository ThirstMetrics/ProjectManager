"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TaskStatus, TaskPriority } from "@/lib/types";

export function NewTaskModal({ open, onClose, defaultProject }: { open: boolean; onClose: () => void; defaultProject?: string }) {
  const projects = useAppStore((s) => s.projects);
  const addTask = useAppStore((s) => s.addTask);
  const teamMembers = useAppStore((s) => s.teamMembers);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(defaultProject || projects[0]?.id || "");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [approver, setApprover] = useState("");

  const handleSubmit = () => {
    if (!title.trim() || !projectId) return;
    addTask({
      projectId,
      title: title.trim(),
      description,
      status,
      priority,
      assignee: assignee || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      startDate: null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      subtasks: [],
      dependencies: [],
      dependents: [],
      attachments: [],
      approvalRequired,
      approver: approvalRequired && approver ? approver : null,
      approvalStatus: "none",
      approvalComment: null,
      approvalRequestedAt: null,
    });
    setTitle(""); setDescription(""); setStatus("todo"); setPriority("medium"); setAssignee(""); setDueDate(""); setTags(""); setApprovalRequired(false); setApprover("");
    onClose();
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

  return (
    <Modal open={open} onClose={onClose} title="New Task">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Title *</label>
          <input className={inputClass} placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Description</label>
          <textarea className={`${inputClass} min-h-[60px] resize-y`} placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Project *</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputClass}>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className={inputClass}>
              <option value="backlog">Backlog</option><option value="todo">To Do</option>
              <option value="in_progress">In Progress</option><option value="review">Review</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className={inputClass}>
              <option value="low">Low</option><option value="medium">Medium</option>
              <option value="high">High</option><option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Assignee</label>
            <input className={inputClass} placeholder="Name" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Due Date</label>
            <input type="date" className={inputClass} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Tags (comma separated)</label>
            <input className={inputClass} placeholder="design, frontend" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
        </div>
        {/* Approval */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={approvalRequired} onChange={(e) => setApprovalRequired(e.target.checked)} className="rounded" />
            <span className="text-sm text-[var(--color-text-secondary)]">Requires approval</span>
          </label>
          {approvalRequired && (
            <select value={approver} onChange={(e) => setApprover(e.target.value)} className={inputClass + " w-48"}>
              <option value="">Select approver...</option>
              {teamMembers.filter((m) => m.projectId === projectId).map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !projectId}>Create Task</Button>
        </div>
      </div>
    </Modal>
  );
}
