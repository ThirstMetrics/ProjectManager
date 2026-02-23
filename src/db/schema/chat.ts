import { pgTable, varchar, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================
// Chat Channels
// ============================================================

export const chatChannels = pgTable("chat_channels", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("project_id", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull().default(""),
  createdBy: varchar("created_by", { length: 64 }).notNull().default(""),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  isDefault: boolean("is_default").notNull().default(false),
});

export const chatChannelsRelations = relations(chatChannels, ({ many }) => ({
  messages: many(chatMessages),
}));

// ============================================================
// Chat Messages
// ============================================================

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  channelId: varchar("channel_id", { length: 64 }).notNull().references(() => chatChannels.id, { onDelete: "cascade" }),
  projectId: varchar("project_id", { length: 64 }).notNull(),
  senderId: varchar("sender_id", { length: 64 }).notNull(),
  senderName: varchar("sender_name", { length: 255 }).notNull(),
  content: text("content").notNull(),
  threadId: varchar("thread_id", { length: 64 }),
  mentions: jsonb("mentions").notNull().$type<string[]>().default([]),
  timestamp: timestamp("timestamp", { mode: "string" }).notNull().defaultNow(),
  edited: boolean("edited").notNull().default(false),
});

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  channel: one(chatChannels, { fields: [chatMessages.channelId], references: [chatChannels.id] }),
}));
