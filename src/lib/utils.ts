import { format, formatDistanceToNow, isToday, isTomorrow, isPast, parseISO } from "date-fns";
import { TaskPriority, TaskStatus } from "./types";

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(iso: string) {
  return format(parseISO(iso), "MMM d, yyyy");
}

export function formatDateTime(iso: string) {
  return format(parseISO(iso), "MMM d, yyyy h:mm a");
}

export function relativeDate(iso: string) {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true });
}

export function dueDateLabel(iso: string | null) {
  if (!iso) return "";
  const d = parseISO(iso);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isPast(d)) return "Overdue";
  return format(d, "MMM d");
}

export function isDueSoon(iso: string | null): boolean {
  if (!iso) return false;
  const d = parseISO(iso);
  const diff = d.getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // within 3 days
}

export function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  return isPast(parseISO(iso));
}

export const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "#22c55e", bg: "#dcfce7" },
  medium: { label: "Medium", color: "#3b82f6", bg: "#dbeafe" },
  high: { label: "High", color: "#f59e0b", bg: "#fef3c7" },
  urgent: { label: "Urgent", color: "#ef4444", bg: "#fee2e2" },
};

export const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  backlog: { label: "Backlog", color: "#94a3b8", bg: "#f1f5f9" },
  todo: { label: "To Do", color: "#6366f1", bg: "#e0e7ff" },
  in_progress: { label: "In Progress", color: "#0ea5e9", bg: "#e0f2fe" },
  review: { label: "Review", color: "#f59e0b", bg: "#fef3c7" },
  done: { label: "Done", color: "#22c55e", bg: "#dcfce7" },
};

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
