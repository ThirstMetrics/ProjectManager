"use client";

import { Task, TaskStatus } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { statusConfig } from "@/lib/utils";
import { TaskCard } from "./TaskCard";
import { useState } from "react";

const columns: TaskStatus[] = ["backlog", "todo", "in_progress", "review", "done"];

export function KanbanBoard({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (id: string) => void }) {
  const moveTask = useAppStore((s) => s.moveTask);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(status);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) moveTask(taskId, status);
    setDragOverCol(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 220px)" }}>
      {columns.map((status) => {
        const colTasks = tasks.filter((t) => t.status === status);
        const cfg = statusConfig[status];
        return (
          <div
            key={status}
            className="flex-shrink-0 w-72 flex flex-col rounded-xl transition-colors duration-150"
            style={{
              backgroundColor: dragOverCol === status ? cfg.bg : "var(--color-background)",
              border: dragOverCol === status ? `2px dashed ${cfg.color}` : "2px solid transparent",
            }}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 px-3 py-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">{cfg.label}</span>
              <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                {colTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto">
              {colTasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} />
              ))}
              {colTasks.length === 0 && (
                <div className="flex items-center justify-center h-24 text-xs text-[var(--color-text-muted)] border-2 border-dashed border-[var(--color-border)] rounded-lg">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
