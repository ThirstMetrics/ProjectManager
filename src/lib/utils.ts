import { format, formatDistanceToNow, isToday, isTomorrow, isPast, parseISO } from "date-fns";
import {
  TaskPriority, TaskStatus, ActivationPhase, ActivationStatus, VenueStatus,
  BudgetCategory, BudgetItemStatus, ProductInventoryStatus, PersonnelClockStatus,
  DocumentSignStatus, IssueSeverity, IssueStatus, StakeholderNDAStatus,
  ActivationDocument,
} from "./types";

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

// ============================================================
// Activation Utilities
// ============================================================

export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function canViewDocument(
  doc: ActivationDocument,
  currentStakeholderId: string | null,
  isAdmin: boolean,
): boolean {
  if (isAdmin) return true;
  if (!currentStakeholderId) return false;
  if (doc.scopedToStakeholderId === currentStakeholderId) return true;
  if (doc.visibleToStakeholderIds.includes(currentStakeholderId)) return true;
  return false;
}

export const activationPhaseConfig: Record<ActivationPhase, { label: string; color: string; bg: string }> = {
  planning: { label: "Planning", color: "#6366f1", bg: "#e0e7ff" },
  pre_event: { label: "Pre-Event", color: "#0ea5e9", bg: "#e0f2fe" },
  live: { label: "Live", color: "#22c55e", bg: "#dcfce7" },
  post_event: { label: "Post-Event", color: "#f59e0b", bg: "#fef3c7" },
  closed: { label: "Closed", color: "#94a3b8", bg: "#f1f5f9" },
};

export const activationStatusConfig: Record<ActivationStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "#94a3b8", bg: "#f1f5f9" },
  confirmed: { label: "Confirmed", color: "#6366f1", bg: "#e0e7ff" },
  in_progress: { label: "In Progress", color: "#0ea5e9", bg: "#e0f2fe" },
  completed: { label: "Completed", color: "#22c55e", bg: "#dcfce7" },
  cancelled: { label: "Cancelled", color: "#ef4444", bg: "#fee2e2" },
};

export const venueStatusConfig: Record<VenueStatus, { label: string; color: string; bg: string }> = {
  identified: { label: "Identified", color: "#94a3b8", bg: "#f1f5f9" },
  contacted: { label: "Contacted", color: "#6366f1", bg: "#e0e7ff" },
  walkthrough_scheduled: { label: "Walkthrough Scheduled", color: "#0ea5e9", bg: "#e0f2fe" },
  walkthrough_done: { label: "Walkthrough Done", color: "#f59e0b", bg: "#fef3c7" },
  booked: { label: "Booked", color: "#22c55e", bg: "#dcfce7" },
  cancelled: { label: "Cancelled", color: "#ef4444", bg: "#fee2e2" },
};

export const budgetCategoryConfig: Record<BudgetCategory, { label: string; color: string }> = {
  venue: { label: "Venue", color: "#6366f1" },
  staffing: { label: "Staffing", color: "#0ea5e9" },
  product: { label: "Product", color: "#22c55e" },
  materials: { label: "Materials", color: "#f59e0b" },
  shipping: { label: "Shipping", color: "#ec4899" },
  permits: { label: "Permits", color: "#8b5cf6" },
  marketing: { label: "Marketing", color: "#14b8a6" },
  photography: { label: "Photography", color: "#f97316" },
  decor: { label: "Decor", color: "#a855f7" },
  catering: { label: "Catering", color: "#ef4444" },
  miscellaneous: { label: "Misc.", color: "#94a3b8" },
};

export const budgetItemStatusConfig: Record<BudgetItemStatus, { label: string; color: string; bg: string }> = {
  estimated: { label: "Estimated", color: "#94a3b8", bg: "#f1f5f9" },
  pending_approval: { label: "Pending Approval", color: "#f59e0b", bg: "#fef3c7" },
  approved: { label: "Approved", color: "#22c55e", bg: "#dcfce7" },
  paid: { label: "Paid", color: "#6366f1", bg: "#e0e7ff" },
  rejected: { label: "Rejected", color: "#ef4444", bg: "#fee2e2" },
};

export const productStatusConfig: Record<ProductInventoryStatus, { label: string; color: string; bg: string }> = {
  requested: { label: "Requested", color: "#94a3b8", bg: "#f1f5f9" },
  confirmed: { label: "Confirmed", color: "#6366f1", bg: "#e0e7ff" },
  shipped: { label: "Shipped", color: "#0ea5e9", bg: "#e0f2fe" },
  delivered: { label: "Delivered", color: "#f59e0b", bg: "#fef3c7" },
  in_use: { label: "In Use", color: "#22c55e", bg: "#dcfce7" },
  reconciled: { label: "Reconciled", color: "#8b5cf6", bg: "#ede9fe" },
};

export const personnelClockConfig: Record<PersonnelClockStatus, { label: string; color: string; bg: string }> = {
  not_started: { label: "Not Started", color: "#94a3b8", bg: "#f1f5f9" },
  clocked_in: { label: "Clocked In", color: "#22c55e", bg: "#dcfce7" },
  on_break: { label: "On Break", color: "#f59e0b", bg: "#fef3c7" },
  clocked_out: { label: "Clocked Out", color: "#6366f1", bg: "#e0e7ff" },
};

export const documentSignConfig: Record<DocumentSignStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "#94a3b8", bg: "#f1f5f9" },
  pending_signature: { label: "Pending Signature", color: "#f59e0b", bg: "#fef3c7" },
  signed: { label: "Signed", color: "#22c55e", bg: "#dcfce7" },
  expired: { label: "Expired", color: "#ef4444", bg: "#fee2e2" },
  voided: { label: "Voided", color: "#94a3b8", bg: "#f1f5f9" },
};

export const issueSeverityConfig: Record<IssueSeverity, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "#22c55e", bg: "#dcfce7" },
  medium: { label: "Medium", color: "#f59e0b", bg: "#fef3c7" },
  high: { label: "High", color: "#f97316", bg: "#ffedd5" },
  critical: { label: "Critical", color: "#ef4444", bg: "#fee2e2" },
};

export const issueStatusConfig: Record<IssueStatus, { label: string; color: string; bg: string }> = {
  open: { label: "Open", color: "#ef4444", bg: "#fee2e2" },
  in_progress: { label: "In Progress", color: "#0ea5e9", bg: "#e0f2fe" },
  escalated: { label: "Escalated", color: "#f59e0b", bg: "#fef3c7" },
  resolved: { label: "Resolved", color: "#22c55e", bg: "#dcfce7" },
  closed: { label: "Closed", color: "#94a3b8", bg: "#f1f5f9" },
};

export const ndaStatusConfig: Record<StakeholderNDAStatus, { label: string; color: string; bg: string }> = {
  not_required: { label: "Not Required", color: "#94a3b8", bg: "#f1f5f9" },
  pending: { label: "Pending", color: "#f59e0b", bg: "#fef3c7" },
  sent: { label: "Sent", color: "#0ea5e9", bg: "#e0f2fe" },
  signed: { label: "Signed", color: "#22c55e", bg: "#dcfce7" },
  expired: { label: "Expired", color: "#ef4444", bg: "#fee2e2" },
  declined: { label: "Declined", color: "#ef4444", bg: "#fee2e2" },
};
