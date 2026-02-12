"use client";

import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useAppStore } from "@/lib/store";
import { useMemo, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { FileViewer } from "@/components/ui/FileViewer";
import {
  CheckSquare, Users, FolderOpen, Calendar, MessageSquare,
  ArrowLeft, Plus, Upload, FileText, Image, FileSpreadsheet, Film, File, Trash2, ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { formatDate, formatFileSize, relativeDate, cn, getInitials, statusConfig, priorityConfig } from "@/lib/utils";
import { MilestoneList } from "@/components/project/MilestoneList";
import { TeamManagement } from "@/components/project/TeamManagement";
import { ChatPanel } from "@/components/project/ChatPanel";
import type { FileItem } from "@/lib/types";

type ProjectTab = "overview" | "tasks" | "team" | "chat" | "files";

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type.includes("spreadsheet") || type.includes("excel")) return FileSpreadsheet;
  if (type.startsWith("video/")) return Film;
  if (type.includes("pdf") || type.includes("word") || type.includes("document")) return FileText;
  return File;
}

function getIconColor(type: string) {
  if (type.startsWith("image/")) return "#22c55e";
  if (type.includes("spreadsheet")) return "#22c55e";
  if (type.startsWith("video/")) return "#8b5cf6";
  if (type.includes("pdf")) return "#ef4444";
  if (type.includes("word")) return "#3b82f6";
  return "#94a3b8";
}

export default function ProjectDashboardPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState<ProjectTab>("overview");
  const [viewingFile, setViewingFile] = useState<FileItem | null>(null);

  const project = useAppStore((s) => s.projects.find((p) => p.id === projectId));
  const allTasks = useAppStore((s) => s.tasks);
  const allMilestones = useAppStore((s) => s.milestones);
  const allTeamMembers = useAppStore((s) => s.teamMembers);
  const allChannels = useAppStore((s) => s.chatChannels);
  const allFiles = useAppStore((s) => s.files);
  const allEvents = useAppStore((s) => s.events);
  const addFile = useAppStore((s) => s.addFile);
  const deleteFile = useAppStore((s) => s.deleteFile);

  const tasks = useMemo(() => allTasks.filter((t) => t.projectId === projectId), [allTasks, projectId]);
  const milestones = useMemo(() => allMilestones.filter((m) => m.projectId === projectId), [allMilestones, projectId]);
  const teamMembers = useMemo(() => allTeamMembers.filter((m) => m.projectId === projectId), [allTeamMembers, projectId]);
  const channels = useMemo(() => allChannels.filter((c) => c.projectId === projectId), [allChannels, projectId]);
  const files = useMemo(() => allFiles.filter((f) => f.projectId === projectId), [allFiles, projectId]);
  const events = useMemo(() => allEvents.filter((e) => e.projectId === projectId), [allEvents, projectId]);

  if (!project) {
    return (
      <AppShell title="Project Not Found">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-[var(--color-text-muted)]">Project not found.</p>
          <Link href="/projects"><Button variant="outline">Back to Projects</Button></Link>
        </div>
      </AppShell>
    );
  }

  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const pct = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  const tiles = [
    { key: "tasks" as const, label: "Tasks", icon: CheckSquare, stat: `${doneTasks}/${tasks.length}`, subtext: "completed", color: "#6366f1" },
    { key: "team" as const, label: "Team", icon: Users, stat: `${teamMembers.length}`, subtext: "members", color: "#10b981" },
    { key: "files" as const, label: "Files", icon: FolderOpen, stat: `${files.length}`, subtext: "files", color: "#f59e0b" },
    { key: "chat" as const, label: "Chat", icon: MessageSquare, stat: `${channels.length}`, subtext: "channels", color: "#ec4899" },
  ];

  const tabs: { key: ProjectTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "tasks", label: "Tasks" },
    { key: "team", label: "Team" },
    { key: "chat", label: "Chat" },
    { key: "files", label: "Files" },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    Array.from(fileList).forEach((file) => {
      addFile({ projectId, name: file.name, size: file.size, type: file.type, url: "#", folder: "/", uploadedBy: "You", tags: [] });
    });
  };

  return (
    <AppShell title={project.name}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Project Header */}
        <div className="flex items-start gap-4">
          <Link href="/projects" className="mt-1">
            <Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: project.color + "20" }}>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-[var(--color-text-primary)] truncate">{project.name}</h1>
                <p className="text-sm text-[var(--color-text-muted)] truncate">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <Badge variant={project.status === "active" ? "success" : "default"}>{project.status}</Badge>
              <span className="text-xs text-[var(--color-text-muted)]">
                {formatDate(project.startDate)} {project.endDate ? `— ${formatDate(project.endDate)}` : ""}
              </span>
              <div className="flex items-center gap-2">
                <ProgressBar value={pct} color={project.color} />
                <span className="text-xs font-semibold whitespace-nowrap" style={{ color: project.color }}>{pct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[var(--color-border)]">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap",
                  activeTab === tab.key
                    ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                    : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===================== OVERVIEW TAB ===================== */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Feature Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tiles.map((tile) => (
                <Card key={tile.key} hover onClick={() => setActiveTab(tile.key)}>
                  <CardBody className="text-center py-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: tile.color + "15" }}>
                      <tile.icon size={24} style={{ color: tile.color }} />
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-text-primary)]">{tile.stat}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{tile.subtext}</p>
                    <p className="text-sm font-medium text-[var(--color-text-secondary)] mt-2">{tile.label}</p>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Pending Approvals */}
            <PendingApprovals tasks={tasks} />

            {/* Milestones */}
            <MilestoneList projectId={projectId} />

            {/* Recent Activity Quick View */}
            <RecentActivity projectId={projectId} />
          </div>
        )}

        {/* ===================== TASKS TAB ===================== */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">All Tasks</h2>
              <Link href={`/tasks?project=${projectId}`}>
                <Button variant="outline" size="sm">Open Kanban View</Button>
              </Link>
            </div>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)]">Task</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)]">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)]">Priority</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)]">Assignee</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)]">Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => {
                      const sc = statusConfig[task.status];
                      const pc = priorityConfig[task.priority];
                      return (
                        <tr key={task.id} className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-medium text-[var(--color-text-primary)]">{task.title}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge style={{ backgroundColor: sc.bg, color: sc.color }}>{sc.label}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge style={{ backgroundColor: pc.bg, color: pc.color }}>{pc.label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-[var(--color-text-secondary)]">{task.assignee || "—"}</td>
                          <td className="px-4 py-3 text-[var(--color-text-muted)] whitespace-nowrap">{task.dueDate ? formatDate(task.dueDate) : "—"}</td>
                        </tr>
                      );
                    })}
                    {tasks.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-[var(--color-text-muted)]">No tasks yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ===================== TEAM TAB ===================== */}
        {activeTab === "team" && <TeamManagement projectId={projectId} />}

        {/* ===================== CHAT TAB ===================== */}
        {activeTab === "chat" && <ChatPanel projectId={projectId} />}

        {/* ===================== FILES TAB ===================== */}
        {activeTab === "files" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Project Files</h2>
              <div className="flex gap-2">
                <input type="file" multiple onChange={handleFileUpload} className="hidden" id="project-file-upload" />
                <Button size="sm" onClick={() => document.getElementById("project-file-upload")?.click()}>
                  <Upload size={14} /> Upload
                </Button>
              </div>
            </div>
            {files.length === 0 ? (
              <Card>
                <CardBody className="text-center py-12">
                  <FolderOpen size={40} className="mx-auto text-[var(--color-text-muted)] mb-3" />
                  <p className="text-sm text-[var(--color-text-muted)]">No files uploaded yet.</p>
                  <label htmlFor="project-file-upload" className="mt-3 inline-block">
                    <Button variant="outline" size="sm" onClick={() => document.getElementById("project-file-upload")?.click()}>
                      <Upload size={14} /> Upload Files
                    </Button>
                  </label>
                </CardBody>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {files.map((file) => {
                  const Icon = getFileIcon(file.type);
                  const iconColor = getIconColor(file.type);
                  return (
                    <Card key={file.id} hover onClick={() => setViewingFile(file)}>
                      <CardBody>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: iconColor + "18" }}>
                            <Icon size={24} style={{ color: iconColor }} />
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); if (confirm("Delete this file?")) deleteFile(file.id); }}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate mb-1">{file.name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-[var(--color-text-muted)]">{formatFileSize(file.size)}</span>
                          <span className="text-[10px] text-[var(--color-text-muted)]">{relativeDate(file.uploadedAt)}</span>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* File Viewer slide-in */}
      <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />
    </AppShell>
  );
}

/* ---------- Sub-component: Pending Approvals ---------- */
function PendingApprovals({ tasks }: { tasks: ReturnType<typeof useAppStore.getState>["tasks"] }) {
  const resolveApproval = useAppStore((s) => s.resolveApproval);
  const pending = tasks.filter((t) => t.approvalStatus === "pending");
  if (pending.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck size={18} className="text-[#f59e0b]" />
        <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Pending Approvals</h3>
        <Badge variant="warning">{pending.length}</Badge>
      </div>
      <Card>
        <CardBody className="p-0">
          <div className="divide-y divide-[var(--color-border)]">
            {pending.map((task) => (
              <div key={task.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[var(--color-surface-hover)] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{task.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Awaiting <span className="font-semibold">{task.approver}</span></p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" onClick={() => resolveApproval(task.id, "approved", "")}>Approve</Button>
                  <Button size="sm" variant="danger" onClick={() => resolveApproval(task.id, "rejected", "")}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

/* ---------- Sub-component: Recent Activity ---------- */
function RecentActivity({ projectId }: { projectId: string }) {
  const allActivity = useAppStore((s) => s.activityLog);
  const activity = useMemo(
    () => allActivity.filter((a) => a.projectId === projectId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5),
    [allActivity, projectId]
  );

  if (activity.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Recent Activity</h3>
      <Card>
        <CardBody className="p-0">
          <div className="divide-y divide-[var(--color-border)]">
            {activity.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-7 h-7 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-[var(--color-primary)]">{getInitials(entry.memberName)}</span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] flex-1">
                  <span className="font-semibold text-[var(--color-text-primary)]">{entry.memberName}</span>{" "}
                  {entry.action}{" "}
                  <span className="font-medium text-[var(--color-text-primary)]">{entry.target}</span>
                </p>
                <span className="text-xs text-[var(--color-text-muted)] shrink-0">{relativeDate(entry.timestamp)}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
