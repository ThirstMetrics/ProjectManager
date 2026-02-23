import { pgTable, varchar, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================
// Projects
// ============================================================

export const projects = pgTable("projects", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull().default(""),
  type: varchar("type", { length: 32 }).notNull().default("general"),
  color: varchar("color", { length: 16 }).notNull().default("#6366f1"),
  icon: varchar("icon", { length: 64 }).notNull().default("Folder"),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  startDate: timestamp("start_date", { mode: "string" }).notNull(),
  endDate: timestamp("end_date", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks),
  milestones: many(milestones),
  teamMembers: many(teamMembers),
  activityLog: many(activityLog),
}));

// ============================================================
// Tasks
// ============================================================

export const tasks = pgTable("tasks", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("project_id", { length: 64 }).notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull().default(""),
  status: varchar("status", { length: 32 }).notNull().default("backlog"),
  priority: varchar("priority", { length: 16 }).notNull().default("medium"),
  assignee: varchar("assignee", { length: 255 }),
  dueDate: timestamp("due_date", { mode: "string" }),
  startDate: timestamp("start_date", { mode: "string" }),
  tags: jsonb("tags").notNull().$type<string[]>().default([]),
  subtasks: jsonb("subtasks").notNull().$type<{ id: string; title: string; completed: boolean }[]>().default([]),
  attachments: jsonb("attachments").notNull().$type<string[]>().default([]),
  approvalRequired: boolean("approval_required").notNull().default(false),
  approver: varchar("approver", { length: 255 }),
  approvalStatus: varchar("approval_status", { length: 16 }).notNull().default("none"),
  approvalComment: text("approval_comment"),
  approvalRequestedAt: timestamp("approval_requested_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { mode: "string" }),
  order: integer("order").notNull().default(0),
});

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  dependenciesFrom: many(taskDependencies, { relationName: "taskDependenciesFrom" }),
  dependenciesTo: many(taskDependencies, { relationName: "taskDependenciesTo" }),
}));

// ============================================================
// Task Dependencies (pivot)
// ============================================================

export const taskDependencies = pgTable("task_dependencies", {
  taskId: varchar("task_id", { length: 64 }).notNull().references(() => tasks.id, { onDelete: "cascade" }),
  dependsOnId: varchar("depends_on_id", { length: 64 }).notNull().references(() => tasks.id, { onDelete: "cascade" }),
});

export const taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
  task: one(tasks, { fields: [taskDependencies.taskId], references: [tasks.id], relationName: "taskDependenciesFrom" }),
  dependsOn: one(tasks, { fields: [taskDependencies.dependsOnId], references: [tasks.id], relationName: "taskDependenciesTo" }),
}));

// ============================================================
// Milestones
// ============================================================

export const milestones = pgTable("milestones", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("project_id", { length: 64 }).notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  dueDate: timestamp("due_date", { mode: "string" }).notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const milestonesRelations = relations(milestones, ({ one }) => ({
  project: one(projects, { fields: [milestones.projectId], references: [projects.id] }),
}));

// ============================================================
// Team Members
// ============================================================

export const teamMembers = pgTable("team_members", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("project_id", { length: 64 }).notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 32 }).notNull().default("viewer"),
  avatar: varchar("avatar", { length: 500 }),
  invitedBy: varchar("invited_by", { length: 64 }),
  joinedAt: timestamp("joined_at", { mode: "string" }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { mode: "string" }).notNull().defaultNow(),
  status: varchar("status", { length: 32 }).notNull().default("invited"),
});

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  project: one(projects, { fields: [teamMembers.projectId], references: [projects.id] }),
}));

// ============================================================
// Activity Log
// ============================================================

export const activityLog = pgTable("activity_log", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("project_id", { length: 64 }).notNull().references(() => projects.id, { onDelete: "cascade" }),
  memberId: varchar("member_id", { length: 64 }).notNull(),
  memberName: varchar("member_name", { length: 255 }).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  target: varchar("target", { length: 500 }).notNull(),
  timestamp: timestamp("timestamp", { mode: "string" }).notNull().defaultNow(),
});

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  project: one(projects, { fields: [activityLog.projectId], references: [projects.id] }),
}));
