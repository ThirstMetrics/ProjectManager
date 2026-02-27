import { z } from "zod";
import { notificationTypeEnum } from "./enums";

export const notificationCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  message: z.string().max(2000).default(""),
  type: notificationTypeEnum.default("info"),
  channel: z.array(z.string()).default(["screen"]),
  actionUrl: z.string().max(1000).default(""),
  projectId: z.string().nullable().default(null),
  taskId: z.string().nullable().default(null),
});

export const notificationUpdateSchema = z.object({
  // Single notification toggle
  id: z.string().optional(),
  read: z.boolean().optional(),
  // Batch mark-all-read
  markAllRead: z.boolean().optional(),
  // Preferences update
  preferences: z.boolean().optional(),
  screen: z.boolean().optional(),
  email: z.boolean().optional(),
  sms: z.boolean().optional(),
  emailAddress: z.string().max(255).optional(),
  phoneNumber: z.string().max(50).optional(),
  taskAssigned: z.array(z.string()).optional(),
  taskCompleted: z.array(z.string()).optional(),
  taskOverdue: z.array(z.string()).optional(),
  eventReminder: z.array(z.string()).optional(),
  fileUploaded: z.array(z.string()).optional(),
  projectUpdate: z.array(z.string()).optional(),
});
