import { z } from "zod";
import {
  projectStatusEnum,
  projectTypeEnum,
  taskStatusEnum,
  taskPriorityEnum,
  approvalStatusEnum,
  projectRoleEnum,
  teamMemberStatusEnum,
} from "./enums";

// ─── Projects ─────────────────────────────────────────────────
export const projectCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(2000).default(""),
  type: projectTypeEnum.default("general"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").default("#6366f1"),
  icon: z.string().max(64).default("Folder"),
  status: projectStatusEnum.default("active"),
  startDate: z.string().optional(),
  endDate: z.string().nullable().default(null),
  createdBy: z.string().max(255).default("system"),
});

export const projectUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  type: projectTypeEnum.optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional(),
  icon: z.string().max(64).optional(),
  status: projectStatusEnum.optional(),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
});

// ─── Tasks ────────────────────────────────────────────────────
const subtaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  completed: z.boolean().default(false),
});

export const taskCreateSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).default(""),
  status: taskStatusEnum.default("backlog"),
  priority: taskPriorityEnum.default("medium"),
  assignee: z.string().nullable().default(null),
  dueDate: z.string().nullable().default(null),
  startDate: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
  subtasks: z.array(subtaskSchema).default([]),
  attachments: z.array(z.any()).default([]),
  approvalRequired: z.boolean().default(false),
  approver: z.string().nullable().default(null),
  approvalStatus: approvalStatusEnum.default("none"),
  approvalComment: z.string().nullable().default(null),
  approvalRequestedAt: z.string().nullable().default(null),
  completedAt: z.string().nullable().default(null),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  assignee: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  subtasks: z.array(subtaskSchema).optional(),
  attachments: z.array(z.any()).optional(),
  approvalRequired: z.boolean().optional(),
  approver: z.string().nullable().optional(),
  approvalStatus: approvalStatusEnum.optional(),
  approvalComment: z.string().nullable().optional(),
  approvalRequestedAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  order: z.number().int().optional(),
  projectId: z.string().optional(),
});

// ─── Subtasks (standalone) ────────────────────────────────────
export const subtaskCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
});

export const subtaskUpdateSchema = z.object({
  id: z.string().min(1, "Subtask ID is required"),
  title: z.string().min(1).max(500).optional(),
  completed: z.boolean().optional(),
});

// ─── Dependencies ─────────────────────────────────────────────
export const dependencySchema = z.object({
  dependsOnId: z.string().min(1, "Depends-on task ID is required"),
});

// ─── Approval ─────────────────────────────────────────────────
export const approvalRequestSchema = z.object({
  approver: z.string().min(1, "Approver is required"),
});

export const approvalDecisionSchema = z.object({
  status: z.enum(["approved", "rejected"], {
    message: "Status must be 'approved' or 'rejected'",
  }),
  comment: z.string().max(2000).optional(),
});

// ─── Milestones ───────────────────────────────────────────────
export const milestoneCreateSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  title: z.string().min(1, "Title is required").max(500),
  dueDate: z.string().min(1, "Due date is required"),
  completed: z.boolean().default(false),
});

export const milestoneUpdateSchema = z.object({
  id: z.string().min(1, "Milestone ID is required"),
  title: z.string().min(1).max(500).optional(),
  dueDate: z.string().optional(),
  completed: z.boolean().optional(),
  toggle: z.boolean().optional(),
});

// ─── Team Members ─────────────────────────────────────────────
export const teamMemberCreateSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email address"),
  role: projectRoleEnum.default("viewer"),
  avatar: z.string().max(500).default(""),
  invitedBy: z.string().max(255).default(""),
  joinedAt: z.string().nullable().default(null),
  lastLoginAt: z.string().nullable().default(null),
  status: teamMemberStatusEnum.default("invited"),
});

export const teamMemberUpdateSchema = z.object({
  id: z.string().min(1, "Team member ID is required"),
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  role: projectRoleEnum.optional(),
  avatar: z.string().max(500).optional(),
  status: teamMemberStatusEnum.optional(),
});

// ─── Activity ─────────────────────────────────────────────────
export const activityCreateSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  memberId: z.string().default(""),
  memberName: z.string().default(""),
  action: z.string().min(1, "Action is required").max(500),
  target: z.string().max(500).default(""),
  timestamp: z.string().optional(),
});

// ─── Shared ───────────────────────────────────────────────────
export const deleteByIdSchema = z.object({
  id: z.string().min(1, "ID is required"),
});
