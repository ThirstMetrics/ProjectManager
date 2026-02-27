import { z } from "zod";

export const channelCreateSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).default(""),
  createdBy: z.string().max(255).default(""),
  isDefault: z.boolean().default(false),
});

export const channelDeleteSchema = z.object({
  id: z.string().min(1, "Channel ID is required"),
});

export const messageCreateSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
  projectId: z.string().min(1, "Project ID is required"),
  senderId: z.string().min(1, "Sender ID is required"),
  senderName: z.string().min(1, "Sender name is required").max(255),
  content: z.string().min(1, "Content is required").max(10000),
  threadId: z.string().nullable().default(null),
  mentions: z.array(z.string()).default([]),
  timestamp: z.string().optional(),
});

export const messageUpdateSchema = z.object({
  id: z.string().min(1, "Message ID is required"),
  content: z.string().min(1, "Content is required").max(10000),
});

export const messageDeleteSchema = z.object({
  id: z.string().min(1, "Message ID is required"),
});
