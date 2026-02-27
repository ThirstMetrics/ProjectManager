import { z } from "zod";
import { calendarEventTypeEnum } from "./enums";

export const calendarEventCreateSchema = z.object({
  projectId: z.string().nullable().default(null),
  taskId: z.string().nullable().default(null),
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).default(""),
  start: z.string().min(1, "Start time is required"),
  end: z.string().min(1, "End time is required"),
  allDay: z.boolean().default(false),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
  type: calendarEventTypeEnum.default("event"),
});

export const calendarEventUpdateSchema = z.object({
  id: z.string().min(1, "Event ID is required"),
  projectId: z.string().nullable().optional(),
  taskId: z.string().nullable().optional(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  allDay: z.boolean().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  type: calendarEventTypeEnum.optional(),
});

export const calendarEventDeleteSchema = z.object({
  id: z.string().min(1, "Event ID is required"),
});
