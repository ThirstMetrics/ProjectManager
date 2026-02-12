"use client";

import { useAppStore } from "@/lib/store";
import { useMemo } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameMonth, isSameDay, isToday, format, parseISO,
} from "date-fns";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MonthViewProps {
  currentDate: Date;
  onEventClick: (id: string) => void;
  filterProject?: string;
  filterAssignee?: string;
}

export function MonthView({ currentDate, onEventClick, filterProject, filterAssignee }: MonthViewProps) {
  const events = useAppStore((s) => s.events);
  const tasks = useAppStore((s) => s.tasks);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (filterProject && e.projectId !== filterProject) return false;
      return true;
    });
  }, [events, filterProject]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterProject && t.projectId !== filterProject) return false;
      if (filterAssignee && t.assignee !== filterAssignee) return false;
      return true;
    });
  }, [tasks, filterProject, filterAssignee]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((e) => {
      const eventDate = parseISO(e.start);
      return isSameDay(eventDate, day);
    });
  };

  const getTaskDeadlinesForDay = (day: Date) => {
    return filteredTasks.filter((t) => {
      if (!t.dueDate || t.status === "done") return false;
      return isSameDay(parseISO(t.dueDate), day);
    });
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-[var(--color-border)]">
        {DAY_NAMES.map((d) => (
          <div key={d} className="px-3 py-2.5 text-xs font-semibold text-[var(--color-text-muted)] text-center uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          const dayEvents = getEventsForDay(day);
          const dayDeadlines = getTaskDeadlinesForDay(day);
          const allItems = [
            ...dayEvents.map((e) => ({ kind: "event" as const, id: e.id, title: e.title, color: e.color })),
            ...dayDeadlines.map((t) => ({ kind: "task" as const, id: t.id, title: t.title, color: "var(--color-danger)" })),
          ];

          return (
            <div
              key={i}
              className="min-h-[100px] border-b border-r border-[var(--color-border-light)] p-1.5 transition-colors hover:bg-[var(--color-surface-hover)]"
              style={{ opacity: inMonth ? 1 : 0.4 }}
            >
              <div className="flex justify-end mb-1">
                <span
                  className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${today ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-secondary)]"}`}
                >
                  {format(day, "d")}
                </span>
              </div>
              <div className="space-y-0.5">
                {allItems.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => item.kind === "event" ? onEventClick(item.id) : undefined}
                    className="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate block cursor-pointer transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: item.color + "20",
                      color: item.color,
                    }}
                  >
                    {item.kind === "task" ? "📌 " : ""}{item.title}
                  </button>
                ))}
                {allItems.length > 3 && (
                  <p className="text-[10px] text-[var(--color-text-muted)] px-1.5">+{allItems.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
