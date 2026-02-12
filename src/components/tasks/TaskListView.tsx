"use client";

import { Task } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/Badge";
import { priorityConfig, statusConfig, dueDateLabel, isOverdue } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

export function TaskListView({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (id: string) => void }) {
  const projects = useAppStore((s) => s.projects);
  const moveTask = useAppStore((s) => s.moveTask);

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-hover)]">
            <th className="w-10 px-4 py-3" />
            <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)]">Task</th>
            <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)]">Project</th>
            <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)]">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)]">Priority</th>
            <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)]">Assignee</th>
            <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)]">Due</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => {
            const project = projects.find((p) => p.id === t.projectId);
            const sc = statusConfig[t.status];
            const pc = priorityConfig[t.priority];
            const overdue = isOverdue(t.dueDate) && t.status !== "done";
            return (
              <tr
                key={t.id}
                className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors"
                onClick={() => onTaskClick(t.id)}
              >
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveTask(t.id, t.status === "done" ? "todo" : "done"); }}
                    className="cursor-pointer"
                  >
                    {t.status === "done" ? (
                      <CheckCircle2 size={18} className="text-[var(--color-success)]" />
                    ) : (
                      <Circle size={18} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 rounded-full shrink-0" style={{ backgroundColor: project?.color || "var(--color-text-muted)" }} />
                    <span className={`font-medium ${t.status === "done" ? "line-through text-[var(--color-text-muted)]" : "text-[var(--color-text-primary)]"}`}>
                      {t.title}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{project?.name || "-"}</td>
                <td className="px-4 py-3">
                  <Badge style={{ backgroundColor: sc.bg, color: sc.color }}>{sc.label}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge style={{ backgroundColor: pc.bg, color: pc.color }}>{pc.label}</Badge>
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{t.assignee || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${overdue ? "text-[var(--color-danger)]" : "text-[var(--color-text-muted)]"}`}>
                    {dueDateLabel(t.dueDate) || "-"}
                  </span>
                </td>
              </tr>
            );
          })}
          {tasks.length === 0 && (
            <tr><td colSpan={7} className="text-center py-12 text-[var(--color-text-muted)]">No tasks found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
