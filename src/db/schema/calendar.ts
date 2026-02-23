import { pgTable, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";

// ============================================================
// Calendar Events
// ============================================================

export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("project_id", { length: 64 }),
  taskId: varchar("task_id", { length: 64 }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull().default(""),
  start: timestamp("start", { mode: "string" }).notNull(),
  end: timestamp("end", { mode: "string" }).notNull(),
  allDay: boolean("all_day").notNull().default(false),
  color: varchar("color", { length: 16 }).notNull().default("#6366f1"),
  type: varchar("type", { length: 32 }).notNull().default("event"),
});
