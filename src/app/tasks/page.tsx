"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useAppStore } from "@/lib/store";
import { useState, useMemo, Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskListView } from "@/components/tasks/TaskListView";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { Plus, LayoutGrid, List } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { TaskStatus, TaskPriority } from "@/lib/types";

export default function TasksPage() {
  return (
    <Suspense fallback={<AppShell title="Tasks"><div className="flex items-center justify-center h-64 text-[var(--color-text-muted)]">Loading...</div></AppShell>}>
      <TasksPageInner />
    </Suspense>
  );
}

function TasksPageInner() {
  const searchParams = useSearchParams();
  const projectFilter = searchParams.get("project") || "";
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const teamMembers = useAppStore((s) => s.teamMembers);

  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [showNewTask, setShowNewTask] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "">("");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "">("");
  const [filterProject, setFilterProject] = useState(projectFilter);
  const [filterAssignee, setFilterAssignee] = useState("");
  const [search, setSearch] = useState("");

  // Only show members relevant to the current project filter, and only those with tasks
  const assignees = useMemo(() => {
    const projectTasks = filterProject ? tasks.filter((t) => t.projectId === filterProject) : tasks;
    const names = new Set<string>();
    projectTasks.forEach((t) => { if (t.assignee) names.add(t.assignee); });
    return Array.from(names).sort();
  }, [tasks, filterProject]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      if (filterProject && t.projectId !== filterProject) return false;
      if (filterAssignee && t.assignee !== filterAssignee) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tasks, filterStatus, filterPriority, filterProject, filterAssignee, search]);

  const selectStyles = "px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

  return (
    <AppShell title="Tasks">
      <div className="max-w-full mx-auto space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 w-64 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          <select value={filterProject} onChange={(e) => { setFilterProject(e.target.value); setFilterAssignee(""); }} className={selectStyles}>
            <option value="">All Projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TaskStatus | "")} className={selectStyles}>
            <option value="">All Statuses</option>
            <option value="backlog">Backlog</option><option value="todo">To Do</option>
            <option value="in_progress">In Progress</option><option value="review">Review</option><option value="done">Done</option>
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as TaskPriority | "")} className={selectStyles}>
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option><option value="high">High</option>
            <option value="medium">Medium</option><option value="low">Low</option>
          </select>
          <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)} className={selectStyles}>
            <option value="">All Members</option>
            {assignees.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <div className="flex-1" />
          <div className="flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-0.5">
            <button onClick={() => setView("kanban")} className={`p-2 rounded-md transition-colors cursor-pointer ${view === "kanban" ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"}`}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setView("list")} className={`p-2 rounded-md transition-colors cursor-pointer ${view === "list" ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"}`}>
              <List size={16} />
            </button>
          </div>
          <Button onClick={() => setShowNewTask(true)}><Plus size={16} /> New Task</Button>
        </div>

        {/* Board / List */}
        {view === "kanban" ? (
          <KanbanBoard tasks={filteredTasks} onTaskClick={setSelectedTaskId} />
        ) : (
          <TaskListView tasks={filteredTasks} onTaskClick={setSelectedTaskId} />
        )}
      </div>

      <NewTaskModal open={showNewTask} onClose={() => setShowNewTask(false)} defaultProject={filterProject} />
      {selectedTaskId && <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />}
    </AppShell>
  );
}
