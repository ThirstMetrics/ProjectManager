import { pgTable, varchar, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

// ============================================================
// File Items
// ============================================================

export const fileItems = pgTable("file_items", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("project_id", { length: 64 }).notNull(),
  name: varchar("name", { length: 500 }).notNull(),
  size: integer("size").notNull().default(0),
  type: varchar("type", { length: 128 }).notNull().default(""),
  url: text("url").notNull().default(""),
  folder: varchar("folder", { length: 255 }).notNull().default(""),
  uploadedBy: varchar("uploaded_by", { length: 255 }).notNull(),
  uploadedAt: timestamp("uploaded_at", { mode: "string" }).notNull().defaultNow(),
  tags: jsonb("tags").notNull().$type<string[]>().default([]),
});
