import { z } from "zod";

export const fileCreateSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  name: z.string().min(1, "Name is required").max(500),
  size: z.number().int().min(0).default(0),
  type: z.string().max(100).default(""),
  url: z.string().max(1000).default(""),
  folder: z.string().max(500).default(""),
  uploadedBy: z.string().max(255).default(""),
  uploadedAt: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const fileDeleteSchema = z.object({
  id: z.string().min(1, "File ID is required"),
});
