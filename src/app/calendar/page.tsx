"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useAppStore } from "@/lib/store";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { MonthView } from "@/components/calendar/MonthView";
import { NewEventModal } from "@/components/calendar/NewEventModal";
import { EventDetailModal } from "@/components/calendar/EventDetailModal";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";

export default function CalendarPage() {
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);
  const teamMembers = useAppStore((s) => s.teamMembers);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filterProject, setFilterProject] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");

  const assignees = useMemo(() => {
    const names = new Set<string>();
    tasks.forEach((t) => { if (t.assignee) names.add(t.assignee); });
    teamMembers.forEach((m) => names.add(m.name));
    return Array.from(names).sort();
  }, [tasks, teamMembers]);

  const selectStyles = "px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

  return (
    <AppShell title="Calendar">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer">
              <ChevronLeft size={20} className="text-[var(--color-text-secondary)]" />
            </button>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] min-w-[200px] text-center">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer">
              <ChevronRight size={20} className="text-[var(--color-text-secondary)]" />
            </button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
          </div>
          <div className="flex-1" />
          <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className={selectStyles}>
            <option value="">All Projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)} className={selectStyles}>
            <option value="">All Members</option>
            {assignees.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <Button onClick={() => setShowNewEvent(true)}><Plus size={16} /> New Event</Button>
        </div>

        {/* Month view */}
        <MonthView currentDate={currentDate} onEventClick={setSelectedEventId} filterProject={filterProject} filterAssignee={filterAssignee} />
      </div>

      <NewEventModal open={showNewEvent} onClose={() => setShowNewEvent(false)} />
      {selectedEventId && <EventDetailModal eventId={selectedEventId} onClose={() => setSelectedEventId(null)} />}
    </AppShell>
  );
}
