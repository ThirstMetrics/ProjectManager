"use client";

import { Task } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { priorityConfig, dueDateLabel, isOverdue, getInitials } from "@/lib/utils";
import { Link2, Calendar } from "lucide-react";

export function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const projects = useAppStore((s) => s.projects);
  const project = projects.find((p) => p.id === task.projectId);
  const subtasksDone = task.subtasks.filter((s) => s.completed).length;
  const subtasksPct = task.subtasks.length > 0 ? (subtasksDone / task.subtasks.length) * 100 : 0;
  const pc = priorityConfig[task.priority];
  const overdue = isOverdue(task.dueDate) && task.status !== "done";

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.setData("text/plain", task.id); e.dataTransfer.effectAllowed = "move"; }}
      onClick={onClick}
      className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 relative overflow-hidden"
    >
      {/* Project color stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg" style={{ backgroundColor: project?.color || "var(--color-text-muted)" }} />

      <div className="pl-2">
        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-border-light)] text-[var(--color-text-muted)]">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <p className="text-sm font-medium text-[var(--color-text-primary)] leading-snug mb-2">{task.title}</p>

        {/* Subtasks progress */}
        {task.subtasks.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] mb-1">
              <span>Subtasks</span>
              <span>{subtasksDone}/{task.subtasks.length}</span>
            </div>
            <ProgressBar value={subtasksPct} height={4} color={project?.color || "var(--color-primary)"} />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge style={{ backgroundColor: pc.bg, color: pc.color }}>{pc.label}</Badge>

          {task.dueDate && (
            <span className={`text-[11px] flex items-center gap-1 font-medium ${overdue ? "text-[var(--color-danger)]" : "text-[var(--color-text-muted)]"}`}>
              <Calendar size={10} /> {dueDateLabel(task.dueDate)}
            </span>
          )}

          {task.dependencies.length > 0 && (
            <span className="text-[11px] flex items-center gap-0.5 text-[var(--color-warning)]">
              <Link2 size={10} /> {task.dependencies.length}
            </span>
          )}

          <div className="flex-1" />

          {task.assignee && (
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: project?.color || "var(--color-primary)" }}>
              {getInitials(task.assignee)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
