"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TaskStatus, TaskPriority } from "@/lib/types";
import { statusConfig, priorityConfig, formatDate } from "@/lib/utils";
import { Plus, Trash2, Link2, CheckSquare, Square, X, ShieldCheck, ShieldX, Clock, Send } from "lucide-react";

export function TaskDetailModal({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const task = useAppStore((s) => s.tasks.find((t) => t.id === taskId));
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const updateTask = useAppStore((s) => s.updateTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const addSubtask = useAppStore((s) => s.addSubtask);
  const toggleSubtask = useAppStore((s) => s.toggleSubtask);
  const addDependency = useAppStore((s) => s.addDependency);
  const removeDependency = useAppStore((s) => s.removeDependency);
  const requestApproval = useAppStore((s) => s.requestApproval);
  const resolveApproval = useAppStore((s) => s.resolveApproval);
  const teamMembers = useAppStore((s) => s.teamMembers);

  const [newSubtask, setNewSubtask] = useState("");
  const [newTag, setNewTag] = useState("");
  const [depSelect, setDepSelect] = useState("");
  const [approvalComment, setApprovalComment] = useState("");
  const [approverSelect, setApproverSelect] = useState("");

  if (!task) return null;

  const project = projects.find((p) => p.id === task.projectId);
  const blockedByTasks = tasks.filter((t) => task.dependencies.includes(t.id));
  const blocksTasks = tasks.filter((t) => task.dependents.includes(t.id));
  const subtasksDone = task.subtasks.filter((s) => s.completed).length;
  const availableDeps = tasks.filter((t) => t.id !== task.id && !task.dependencies.includes(t.id));

  const handleDelete = () => { if (confirm("Delete this task?")) { deleteTask(task.id); onClose(); } };

  return (
    <Modal open onClose={onClose} title={task.title} wide>
      <div className="space-y-5">
        {/* Title */}
        <input
          className="w-full text-lg font-semibold bg-transparent border-none focus:outline-none text-[var(--color-text-primary)]"
          value={task.title}
          onChange={(e) => updateTask(task.id, { title: e.target.value })}
        />

        {/* Description */}
        <textarea
          className="w-full p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          placeholder="Description..."
          value={task.description}
          onChange={(e) => updateTask(task.id, { description: e.target.value })}
        />

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Status</label>
            <select
              value={task.status}
              onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus, completedAt: e.target.value === "done" ? new Date().toISOString() : null })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm bg-[var(--color-surface)]"
            >
              {(Object.keys(statusConfig) as TaskStatus[]).map((s) => <option key={s} value={s}>{statusConfig[s].label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Priority</label>
            <select
              value={task.priority}
              onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskPriority })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm bg-[var(--color-surface)]"
            >
              {(Object.keys(priorityConfig) as TaskPriority[]).map((p) => <option key={p} value={p}>{priorityConfig[p].label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Assignee</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm bg-[var(--color-surface)]"
              placeholder="Assignee name"
              value={task.assignee || ""}
              onChange={(e) => updateTask(task.id, { assignee: e.target.value || null })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Project</label>
            <p className="text-sm flex items-center gap-2 py-2">
              {project && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />}
              {project?.name || "None"}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Due Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm bg-[var(--color-surface)]"
              value={task.dueDate ? task.dueDate.slice(0, 10) : ""}
              onChange={(e) => updateTask(task.id, { dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Start Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm bg-[var(--color-surface)]"
              value={task.startDate ? task.startDate.slice(0, 10) : ""}
              onChange={(e) => updateTask(task.id, { startDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2 block">Tags</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {task.tags.map((tag) => (
              <Badge key={tag}>
                {tag}
                <button className="ml-1 cursor-pointer" onClick={() => updateTask(task.id, { tags: task.tags.filter((t) => t !== tag) })}><X size={10} /></button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-sm" placeholder="Add tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newTag.trim()) { updateTask(task.id, { tags: [...task.tags, newTag.trim()] }); setNewTag(""); } }} />
          </div>
        </div>

        {/* Subtasks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase">Subtasks ({subtasksDone}/{task.subtasks.length})</label>
          </div>
          {task.subtasks.length > 0 && <ProgressBar value={task.subtasks.length > 0 ? (subtasksDone / task.subtasks.length) * 100 : 0} height={4} />}
          <div className="mt-2 space-y-1">
            {task.subtasks.map((st) => (
              <div key={st.id} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-[var(--color-surface-hover)] transition-colors">
                <button onClick={() => toggleSubtask(task.id, st.id)} className="cursor-pointer">
                  {st.completed ? <CheckSquare size={16} className="text-[var(--color-success)]" /> : <Square size={16} className="text-[var(--color-text-muted)]" />}
                </button>
                <span className={`text-sm flex-1 ${st.completed ? "line-through text-[var(--color-text-muted)]" : "text-[var(--color-text-primary)]"}`}>{st.title}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-sm" placeholder="Add subtask" value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newSubtask.trim()) { addSubtask(task.id, newSubtask.trim()); setNewSubtask(""); } }} />
            <Button size="sm" onClick={() => { if (newSubtask.trim()) { addSubtask(task.id, newSubtask.trim()); setNewSubtask(""); } }}><Plus size={14} /></Button>
          </div>
        </div>

        {/* Dependencies */}
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2 block flex items-center gap-1"><Link2 size={12} /> Dependencies</label>
          {blockedByTasks.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Blocked by:</p>
              {blockedByTasks.map((bt) => (
                <div key={bt.id} className="flex items-center gap-2 py-1 px-2 rounded bg-[var(--color-surface-hover)] mb-1">
                  <span className="text-sm text-[var(--color-text-primary)] flex-1">{bt.title}</span>
                  <Badge style={{ backgroundColor: statusConfig[bt.status].bg, color: statusConfig[bt.status].color }}>{statusConfig[bt.status].label}</Badge>
                  <button onClick={() => removeDependency(task.id, bt.id)} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] cursor-pointer"><X size={14} /></button>
                </div>
              ))}
            </div>
          )}
          {blocksTasks.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Blocks:</p>
              {blocksTasks.map((bt) => (
                <div key={bt.id} className="flex items-center gap-2 py-1 px-2 rounded bg-[var(--color-surface-hover)] mb-1">
                  <span className="text-sm text-[var(--color-text-primary)] flex-1">{bt.title}</span>
                  <Badge style={{ backgroundColor: statusConfig[bt.status].bg, color: statusConfig[bt.status].color }}>{statusConfig[bt.status].label}</Badge>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <select value={depSelect} onChange={(e) => setDepSelect(e.target.value)} className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-sm bg-[var(--color-surface)]">
              <option value="">Add dependency...</option>
              {availableDeps.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
            <Button size="sm" variant="outline" onClick={() => { if (depSelect) { addDependency(task.id, depSelect); setDepSelect(""); } }}>Add</Button>
          </div>
        </div>

        {/* Approval Section */}
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2 block flex items-center gap-1"><ShieldCheck size={12} /> Approval</label>

          {/* Toggle approval required */}
          <div className="flex items-center gap-3 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={task.approvalRequired}
                onChange={(e) => updateTask(task.id, { approvalRequired: e.target.checked, approver: e.target.checked ? task.approver : null, approvalStatus: e.target.checked ? task.approvalStatus : "none" })}
                className="rounded"
              />
              <span className="text-sm text-[var(--color-text-secondary)]">Requires approval</span>
            </label>
          </div>

          {task.approvalRequired && (
            <div className="space-y-3 p-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)]">
              {/* Approver selector */}
              {task.approvalStatus === "none" && (
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] block mb-1">Approver</label>
                  <div className="flex gap-2">
                    <select
                      value={task.approver || approverSelect}
                      onChange={(e) => { setApproverSelect(e.target.value); updateTask(task.id, { approver: e.target.value || null }); }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-sm bg-[var(--color-surface)]"
                    >
                      <option value="">Select approver...</option>
                      {teamMembers.filter((m) => m.projectId === task.projectId).map((m) => (
                        <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      disabled={!task.approver}
                      onClick={() => { if (task.approver) requestApproval(task.id, task.approver); }}
                    >
                      <Send size={12} /> Submit
                    </Button>
                  </div>
                </div>
              )}

              {/* Pending state */}
              {task.approvalStatus === "pending" && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={14} className="text-[#f59e0b]" />
                    <span className="text-sm font-semibold text-[#f59e0b]">Awaiting approval from {task.approver}</span>
                  </div>
                  <div className="space-y-2">
                    <textarea
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm min-h-[50px] resize-y focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      placeholder="Comment (optional)..."
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { resolveApproval(task.id, "approved", approvalComment); setApprovalComment(""); }}>
                        <ShieldCheck size={12} /> Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => { resolveApproval(task.id, "rejected", approvalComment); setApprovalComment(""); }}>
                        <ShieldX size={12} /> Reject
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Approved state */}
              {task.approvalStatus === "approved" && (
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#22c55e]" />
                  <span className="text-sm font-semibold text-[#22c55e]">Approved by {task.approver}</span>
                  {task.approvalComment && <span className="text-xs text-[var(--color-text-muted)] ml-2">— {task.approvalComment}</span>}
                </div>
              )}

              {/* Rejected state */}
              {task.approvalStatus === "rejected" && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldX size={16} className="text-[#ef4444]" />
                    <span className="text-sm font-semibold text-[#ef4444]">Rejected by {task.approver}</span>
                  </div>
                  {task.approvalComment && <p className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] p-2 rounded mb-2">"{task.approvalComment}"</p>}
                  <Button size="sm" variant="outline" onClick={() => { requestApproval(task.id, task.approver!); }}>
                    <Send size={12} /> Resubmit for Approval
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timestamps & Delete */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
          <div className="text-xs text-[var(--color-text-muted)] space-y-0.5">
            <p>Created: {formatDate(task.createdAt)}</p>
            <p>Updated: {formatDate(task.updatedAt)}</p>
          </div>
          <Button variant="danger" size="sm" onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>
    </Modal>
  );
}
