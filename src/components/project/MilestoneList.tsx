"use client";

import { useAppStore } from "@/lib/store";
import { useMemo, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Flag, Plus, Check, Clock, AlertTriangle, Trash2 } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";
import { cn } from "@/lib/utils";

function daysRemaining(dueDate: string): number {
  return differenceInDays(parseISO(dueDate), new Date());
}

function urgencyColor(days: number): string {
  if (days < 0) return "#ef4444";
  if (days <= 2) return "#ef4444";
  if (days <= 5) return "#f59e0b";
  return "#22c55e";
}

function urgencyLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days left`;
}

export function MilestoneList({ projectId }: { projectId: string }) {
  const allMilestones = useAppStore((s) => s.milestones);
  const addMilestone = useAppStore((s) => s.addMilestone);
  const toggleMilestone = useAppStore((s) => s.toggleMilestone);
  const deleteMilestone = useAppStore((s) => s.deleteMilestone);

  const milestones = useMemo(
    () => allMilestones.filter((m) => m.projectId === projectId).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [allMilestones, projectId]
  );

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");

  const handleAdd = () => {
    if (!newTitle.trim() || !newDate) return;
    addMilestone({ projectId, title: newTitle.trim(), dueDate: new Date(newDate).toISOString(), completed: false });
    setNewTitle("");
    setNewDate("");
    setAdding(false);
  };

  const inputClass = "px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)]";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flag size={18} className="text-[var(--color-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Milestones</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setAdding(!adding)}>
          <Plus size={14} /> Add
        </Button>
      </div>

      {adding && (
        <Card className="mb-4">
          <CardBody>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Title</label>
                <input className={cn(inputClass, "w-full")} placeholder="Milestone title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Due Date</label>
                <input type="date" className={inputClass} value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              </div>
              <Button size="sm" onClick={handleAdd}>Add</Button>
              <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {milestones.length === 0 ? (
        <Card>
          <CardBody className="text-center py-8">
            <Flag size={32} className="mx-auto text-[var(--color-text-muted)] mb-2" />
            <p className="text-sm text-[var(--color-text-muted)]">No milestones yet. Add one to track key dates.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {milestones.map((ms) => {
            const days = daysRemaining(ms.dueDate);
            const color = ms.completed ? "#22c55e" : urgencyColor(days);
            return (
              <Card key={ms.id} className={cn(ms.completed && "opacity-60")}>
                <CardBody>
                  <div className="flex items-start justify-between mb-3">
                    <button
                      onClick={() => toggleMilestone(ms.id)}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors",
                        ms.completed ? "border-[#22c55e] bg-[#22c55e]" : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                      )}
                    >
                      {ms.completed && <Check size={12} className="text-white" />}
                    </button>
                    <button
                      onClick={() => deleteMilestone(ms.id)}
                      className="p-1 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <h3 className={cn("text-sm font-semibold text-[var(--color-text-primary)] mb-2", ms.completed && "line-through")}>{ms.title}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">{format(parseISO(ms.dueDate), "MMM d, yyyy")}</p>
                  {!ms.completed && (
                    <div className="flex items-center gap-1.5">
                      {days <= 2 && days >= 0 ? <AlertTriangle size={12} style={{ color }} /> : <Clock size={12} style={{ color }} />}
                      <span className="text-xs font-bold" style={{ color }}>{urgencyLabel(days)}</span>
                    </div>
                  )}
                  {ms.completed && (
                    <span className="text-xs font-semibold text-[#22c55e]">Completed</span>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
