"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useAppStore } from "@/lib/store";
import { Card, CardBody } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { FolderKanban, CheckSquare, AlertTriangle, TrendingUp, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { dueDateLabel, isOverdue, isDueSoon, priorityConfig, statusConfig } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);

  const activeTasks = tasks.filter((t) => t.status !== "done");
  const overdueTasks = tasks.filter((t) => t.status !== "done" && isOverdue(t.dueDate));
  const completedTasks = tasks.filter((t) => t.status === "done");
  const upcomingDeadlines = tasks
    .filter((t) => t.status !== "done" && t.dueDate && (isDueSoon(t.dueDate) || isOverdue(t.dueDate)))
    .sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1))
    .slice(0, 5);
  const recentTasks = [...tasks].sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1)).slice(0, 5);

  const stats = [
    { label: "Total Projects", value: projects.length, icon: FolderKanban, color: "var(--color-primary)" },
    { label: "Active Tasks", value: activeTasks.length, icon: CheckSquare, color: "var(--color-secondary)" },
    { label: "Overdue", value: overdueTasks.length, icon: AlertTriangle, color: "var(--color-danger)" },
    { label: "Completed", value: completedTasks.length, icon: TrendingUp, color: "var(--color-success)" },
  ];

  return (
    <AppShell title="Dashboard">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Welcome back</h2>
          <p className="text-[var(--color-text-muted)] mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} hover>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--color-text-muted)]">{s.label}</p>
                    <p className="text-3xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + "18" }}>
                    <s.icon size={24} style={{ color: s.color }} />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent tasks */}
          <div className="lg:col-span-2">
            <Card>
              <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                <h3 className="font-semibold text-[var(--color-text-primary)]">Recent Tasks</h3>
                <Link href="/tasks" className="text-sm font-medium flex items-center gap-1 no-underline" style={{ color: "var(--color-primary)" }}>
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {recentTasks.map((t) => {
                  const project = projects.find((p) => p.id === t.projectId);
                  return (
                    <div key={t.id} className="px-4 py-3 flex items-start gap-3 hover:bg-[var(--color-surface-hover)] transition-colors">
                      <div className="w-1 h-10 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: project?.color || "var(--color-text-muted)" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{t.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-[var(--color-text-muted)] truncate max-w-[120px]">{project?.name}</span>
                          <Badge size="sm" variant={t.priority === "urgent" ? "danger" : t.priority === "high" ? "warning" : "default"}>
                            {priorityConfig[t.priority].label}
                          </Badge>
                          <Badge size="sm" style={{ backgroundColor: statusConfig[t.status].bg, color: statusConfig[t.status].color }}>
                            {statusConfig[t.status].label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Upcoming deadlines */}
          <Card>
            <div className="px-5 py-4 border-b border-[var(--color-border)]">
              <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                <Clock size={18} className="text-[var(--color-warning)]" /> Upcoming Deadlines
              </h3>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {upcomingDeadlines.length === 0 && <p className="px-5 py-8 text-center text-sm text-[var(--color-text-muted)]">No upcoming deadlines</p>}
              {upcomingDeadlines.map((t) => (
                <div key={t.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{t.title}</p>
                  <p className={`text-xs mt-0.5 font-semibold ${isOverdue(t.dueDate) ? "text-[var(--color-danger)]" : "text-[var(--color-warning)]"}`}>
                    {dueDateLabel(t.dueDate)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Pending Approvals */}
        {tasks.filter((t) => t.approvalStatus === "pending").length > 0 && (
          <Card>
            <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#f59e0b]" /> Pending Approvals
              </h3>
              <Badge variant="warning">{tasks.filter((t) => t.approvalStatus === "pending").length}</Badge>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {tasks.filter((t) => t.approvalStatus === "pending").map((t) => {
                const project = projects.find((p) => p.id === t.projectId);
                return (
                  <div key={t.id} className="px-4 py-3 flex items-start gap-3 hover:bg-[var(--color-surface-hover)] transition-colors">
                    <div className="w-1 h-10 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: project?.color || "#f59e0b" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{t.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-[var(--color-text-muted)]">
                          Awaiting <span className="font-semibold">{t.approver}</span>
                        </span>
                        <Badge size="sm" variant="warning">Pending</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Project progress */}
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">Project Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.filter((p) => p.status === "active").map((project) => {
              const projectTasks = tasks.filter((t) => t.projectId === project.id);
              const done = projectTasks.filter((t) => t.status === "done").length;
              const pct = projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0;
              return (
                <Card key={project.id} hover>
                  <CardBody>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                      <h4 className="font-semibold text-[var(--color-text-primary)] truncate">{project.name}</h4>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-2">
                      <span>{done} of {projectTasks.length} tasks</span>
                      <span className="font-semibold" style={{ color: project.color }}>{pct}%</span>
                    </div>
                    <ProgressBar value={pct} color={project.color} />
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
