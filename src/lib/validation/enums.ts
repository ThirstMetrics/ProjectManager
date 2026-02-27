import { z } from "zod";

// ─── Core Enums ───────────────────────────────────────────────
export const taskStatusEnum = z.enum(["backlog", "todo", "in_progress", "review", "done"]);
export const taskPriorityEnum = z.enum(["low", "medium", "high", "urgent"]);
export const projectStatusEnum = z.enum(["active", "on_hold", "completed", "archived"]);
export const projectTypeEnum = z.enum(["software", "beverage", "marketing", "event", "general"]);
export const approvalStatusEnum = z.enum(["none", "pending", "approved", "rejected"]);
export const globalRoleEnum = z.enum(["owner", "admin", "member", "viewer"]);
export const projectRoleEnum = z.enum(["owner", "manager", "contributor", "viewer"]);
export const teamMemberStatusEnum = z.enum(["invited", "active", "inactive"]);

// ─── Activation Enums ─────────────────────────────────────────
export const activationPhaseEnum = z.enum(["planning", "pre_event", "live", "post_event", "closed"]);
export const activationStatusEnum = z.enum(["draft", "confirmed", "in_progress", "completed", "cancelled"]);
export const venueStatusEnum = z.enum(["identified", "contacted", "walkthrough_scheduled", "walkthrough_complete", "booked", "confirmed", "cancelled"]);
export const venueTypeEnum = z.enum(["bar", "restaurant", "club", "outdoor", "retail", "event_space", "other"]);
export const stakeholderTypeEnum = z.enum(["client", "vendor", "agency", "internal", "sponsor", "media", "other"]);
export const stakeholderStatusEnum = z.enum(["invited", "confirmed", "declined", "attended"]);
export const ndaStatusEnum = z.enum(["not_required", "pending", "sent", "signed", "expired"]);
export const productStatusEnum = z.enum(["requested", "confirmed", "shipped", "delivered", "reconciled"]);
export const personnelClockStatusEnum = z.enum(["not_started", "clocked_in", "on_break", "clocked_out"]);
export const leadSourceEnum = z.enum(["walk_in", "referral", "social_media", "event", "website", "other"]);
export const budgetCategoryEnum = z.enum(["venue", "staffing", "product", "marketing", "transportation", "equipment", "permits", "insurance", "miscellaneous"]);
export const budgetStatusEnum = z.enum(["estimated", "quoted", "approved", "rejected", "paid", "invoiced"]);
export const documentTypeEnum = z.enum(["contract", "permit", "insurance", "invoice", "receipt", "brief", "report", "photo_release", "nda", "other"]);
export const documentSignStatusEnum = z.enum(["draft", "sent", "viewed", "signed", "expired", "declined"]);
export const checklistCategoryEnum = z.enum(["setup", "teardown", "safety", "compliance", "marketing", "logistics", "other"]);
export const issueCategoryEnum = z.enum(["safety", "equipment", "staffing", "product", "venue", "weather", "compliance", "other"]);
export const issueSeverityEnum = z.enum(["low", "medium", "high", "critical"]);
export const issueStatusEnum = z.enum(["open", "in_progress", "escalated", "resolved", "closed"]);
export const mediaTypeEnum = z.enum(["photo", "video"]);
export const calendarEventTypeEnum = z.enum(["event", "meeting", "deadline", "milestone", "reminder"]);
export const notificationTypeEnum = z.enum(["info", "success", "warning", "error"]);
