"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useAppStore } from "@/lib/store";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { NewProjectModal } from "@/components/tasks/NewProjectModal";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import themeConfig from "@/theme/theme.config";

export default function ProjectsPage() {
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);
  const [showNew, setShowNew] = useState(false);

  return (
    <AppShell title="Projects">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-[var(--color-text-muted)]">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
          <Button onClick={() => setShowNew(true)}><Plus size={16} /> New Project</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const pt = tasks.filter((t) => t.projectId === project.id);
            const done = pt.filter((t) => t.status === "done").length;
            const pct = pt.length > 0 ? Math.round((done / pt.length) * 100) : 0;
            const typeInfo = themeConfig.projectTypes.find((t) => t.value === project.type);
            return (
              <Link key={project.id} href={`/projects/${project.id}`} className="no-underline">
                <Card hover className="h-full">
                  <CardBody>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: project.color + "20" }}>
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
                      </div>
                      <Badge variant={project.status === "active" ? "success" : "default"}>{project.status}</Badge>
                    </div>
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">{project.name}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mb-3 line-clamp-2">{project.description}</p>
                    {typeInfo && <Badge style={{ backgroundColor: typeInfo.color + "20", color: typeInfo.color }}>{typeInfo.label}</Badge>}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-1.5">
                        <span>{done}/{pt.length} tasks</span>
                        <span className="font-semibold" style={{ color: project.color }}>{pct}%</span>
                      </div>
                      <ProgressBar value={pct} color={project.color} />
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-3">
                      {formatDate(project.startDate)} {project.endDate ? `- ${formatDate(project.endDate)}` : ""}
                    </p>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
      <NewProjectModal open={showNew} onClose={() => setShowNew(false)} />
    </AppShell>
  );
}
