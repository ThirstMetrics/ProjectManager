import { pgTable, varchar, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

// ============================================================
// Notifications
// ============================================================

export const notifications = pgTable("notifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 16 }).notNull().default("info"),
  channel: jsonb("channel").notNull().$type<string[]>().default(["screen"]),
  read: boolean("read").notNull().default(false),
  actionUrl: varchar("action_url", { length: 500 }),
  projectId: varchar("project_id", { length: 64 }),
  taskId: varchar("task_id", { length: 64 }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

// ============================================================
// Notification Preferences (single row per user — for now global)
// ============================================================

export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id", { length: 64 }).primaryKey().default("default"),
  screen: boolean("screen").notNull().default(true),
  email: boolean("email").notNull().default(true),
  sms: boolean("sms").notNull().default(false),
  emailAddress: varchar("email_address", { length: 255 }).notNull().default(""),
  phoneNumber: varchar("phone_number", { length: 32 }).notNull().default(""),
  taskAssigned: jsonb("task_assigned").notNull().$type<string[]>().default(["screen", "email"]),
  taskCompleted: jsonb("task_completed").notNull().$type<string[]>().default(["screen"]),
  taskOverdue: jsonb("task_overdue").notNull().$type<string[]>().default(["screen", "email", "sms"]),
  eventReminder: jsonb("event_reminder").notNull().$type<string[]>().default(["screen", "email"]),
  fileUploaded: jsonb("file_uploaded").notNull().$type<string[]>().default(["screen"]),
  projectUpdate: jsonb("project_update").notNull().$type<string[]>().default(["screen"]),
});
