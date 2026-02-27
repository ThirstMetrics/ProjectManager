import { z } from "zod";
import {
  activationPhaseEnum,
  activationStatusEnum,
  venueStatusEnum,
  venueTypeEnum,
  stakeholderTypeEnum,
  stakeholderStatusEnum,
  ndaStatusEnum,
  productStatusEnum,
  personnelClockStatusEnum,
  leadSourceEnum,
  budgetCategoryEnum,
  budgetStatusEnum,
  documentTypeEnum,
  documentSignStatusEnum,
  checklistCategoryEnum,
  issueCategoryEnum,
  issueSeverityEnum,
  issueStatusEnum,
  mediaTypeEnum,
} from "./enums";

// ─── Activations ──────────────────────────────────────────────
export const activationCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).default("New Activation"),
  brand: z.string().max(255).default(""),
  description: z.string().max(5000).default(""),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#f59e0b"),
  icon: z.string().max(64).default("Zap"),
  phase: activationPhaseEnum.default("planning"),
  status: activationStatusEnum.default("draft"),
  eventDate: z.string().optional(),
  eventEndDate: z.string().nullable().default(null),
  setupDate: z.string().nullable().default(null),
  teardownDate: z.string().nullable().default(null),
  venueId: z.string().nullable().default(null),
  budgetTotal: z.number().int().min(0).default(0),
  budgetSpent: z.number().int().min(0).default(0),
  leadGoal: z.number().int().min(0).default(0),
  sampleGoal: z.number().int().min(0).default(0),
  interactionGoal: z.number().int().min(0).default(0),
  tags: z.array(z.string()).default([]),
  createdBy: z.string().max(255).default(""),
});

export const activationUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  brand: z.string().max(255).optional(),
  description: z.string().max(5000).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(64).optional(),
  phase: activationPhaseEnum.optional(),
  status: activationStatusEnum.optional(),
  eventDate: z.string().optional(),
  eventEndDate: z.string().nullable().optional(),
  setupDate: z.string().nullable().optional(),
  teardownDate: z.string().nullable().optional(),
  venueId: z.string().nullable().optional(),
  budgetTotal: z.number().int().min(0).optional(),
  budgetSpent: z.number().int().min(0).optional(),
  leadGoal: z.number().int().min(0).optional(),
  sampleGoal: z.number().int().min(0).optional(),
  interactionGoal: z.number().int().min(0).optional(),
  tags: z.array(z.string()).optional(),
});

// ─── Venues ───────────────────────────────────────────────────
export const venueCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  address: z.string().max(500).default(""),
  city: z.string().max(255).default(""),
  state: z.string().max(100).default(""),
  zip: z.string().max(20).default(""),
  contactName: z.string().max(255).default(""),
  contactEmail: z.string().max(255).default(""),
  contactPhone: z.string().max(50).default(""),
  venueType: venueTypeEnum.default("other"),
  capacity: z.number().int().min(0).default(0),
  status: venueStatusEnum.default("identified"),
  walkthroughDate: z.string().nullable().default(null),
  walkthroughNotes: z.string().max(5000).default(""),
  bookingConfirmedAt: z.string().nullable().default(null),
  bookingCost: z.number().int().min(0).default(0),
  specialRequirements: z.string().max(5000).default(""),
});

export const venueUpdateSchema = z.object({
  id: z.string().min(1, "Venue ID is required"),
  name: z.string().min(1).max(255).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(255).optional(),
  state: z.string().max(100).optional(),
  zip: z.string().max(20).optional(),
  contactName: z.string().max(255).optional(),
  contactEmail: z.string().max(255).optional(),
  contactPhone: z.string().max(50).optional(),
  venueType: venueTypeEnum.optional(),
  capacity: z.number().int().min(0).optional(),
  status: venueStatusEnum.optional(),
  walkthroughDate: z.string().nullable().optional(),
  walkthroughNotes: z.string().max(5000).optional(),
  bookingConfirmedAt: z.string().nullable().optional(),
  bookingCost: z.number().int().min(0).optional(),
  specialRequirements: z.string().max(5000).optional(),
});

// ─── Stakeholders ─────────────────────────────────────────────
export const stakeholderCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().max(255).default(""),
  phone: z.string().max(50).default(""),
  company: z.string().max(255).default(""),
  type: stakeholderTypeEnum.default("other"),
  role: z.string().max(255).default(""),
  avatar: z.string().max(500).default(""),
  ndaStatus: ndaStatusEnum.default("not_required"),
  ndaDocumentId: z.string().nullable().default(null),
  canViewBudget: z.boolean().default(false),
  canViewLeads: z.boolean().default(false),
  canViewAllDocuments: z.boolean().default(false),
  notes: z.string().max(5000).default(""),
  status: stakeholderStatusEnum.default("invited"),
});

export const stakeholderUpdateSchema = z.object({
  id: z.string().min(1, "Stakeholder ID is required"),
  name: z.string().min(1).max(255).optional(),
  email: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  company: z.string().max(255).optional(),
  type: stakeholderTypeEnum.optional(),
  role: z.string().max(255).optional(),
  avatar: z.string().max(500).optional(),
  ndaStatus: ndaStatusEnum.optional(),
  ndaDocumentId: z.string().nullable().optional(),
  canViewBudget: z.boolean().optional(),
  canViewLeads: z.boolean().optional(),
  canViewAllDocuments: z.boolean().optional(),
  notes: z.string().max(5000).optional(),
  status: stakeholderStatusEnum.optional(),
});

// ─── Products ─────────────────────────────────────────────────
export const productCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  sku: z.string().max(100).default(""),
  category: z.string().max(255).default(""),
  quantityRequested: z.number().int().min(0).default(0),
  quantityConfirmed: z.number().int().min(0).default(0),
  quantityShipped: z.number().int().min(0).default(0),
  quantityDelivered: z.number().int().min(0).default(0),
  quantityUsed: z.number().int().min(0).default(0),
  quantityReturned: z.number().int().min(0).default(0),
  quantityDamaged: z.number().int().min(0).default(0),
  unitCost: z.number().int().min(0).default(0),
  status: productStatusEnum.default("requested"),
  shippingTrackingNumber: z.string().max(255).default(""),
  shippingCarrier: z.string().max(255).default(""),
  expectedDeliveryDate: z.string().nullable().default(null),
  deliveredAt: z.string().nullable().default(null),
  reconciledAt: z.string().nullable().default(null),
  reconciledBy: z.string().max(255).default(""),
  notes: z.string().max(5000).default(""),
});

export const productUpdateSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  name: z.string().min(1).max(255).optional(),
  sku: z.string().max(100).optional(),
  category: z.string().max(255).optional(),
  quantityRequested: z.number().int().min(0).optional(),
  quantityConfirmed: z.number().int().min(0).optional(),
  quantityShipped: z.number().int().min(0).optional(),
  quantityDelivered: z.number().int().min(0).optional(),
  quantityUsed: z.number().int().min(0).optional(),
  quantityReturned: z.number().int().min(0).optional(),
  quantityDamaged: z.number().int().min(0).optional(),
  unitCost: z.number().int().min(0).optional(),
  status: productStatusEnum.optional(),
  shippingTrackingNumber: z.string().max(255).optional(),
  shippingCarrier: z.string().max(255).optional(),
  expectedDeliveryDate: z.string().nullable().optional(),
  deliveredAt: z.string().nullable().optional(),
  reconciledAt: z.string().nullable().optional(),
  reconciledBy: z.string().max(255).optional(),
  notes: z.string().max(5000).optional(),
  reconcile: z.boolean().optional(),
});

// ─── Personnel ────────────────────────────────────────────────
export const personnelCreateSchema = z.object({
  stakeholderId: z.string().nullable().default(null),
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().max(255).default(""),
  phone: z.string().max(50).default(""),
  role: z.string().max(255).default(""),
  clockStatus: personnelClockStatusEnum.default("not_started"),
  clockInTime: z.string().nullable().default(null),
  clockOutTime: z.string().nullable().default(null),
  breakStartTime: z.string().nullable().default(null),
  totalHoursWorked: z.number().int().nullable().default(null),
  hourlyRate: z.number().int().min(0).default(0),
  productKnowledgeVerified: z.boolean().default(false),
  productKnowledgeVerifiedAt: z.string().nullable().default(null),
  productKnowledgeScore: z.number().int().nullable().default(null),
  notes: z.string().max(5000).default(""),
});

export const personnelUpdateSchema = z.object({
  id: z.string().min(1, "Personnel ID is required"),
  stakeholderId: z.string().nullable().optional(),
  name: z.string().min(1).max(255).optional(),
  email: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  role: z.string().max(255).optional(),
  clockStatus: personnelClockStatusEnum.optional(),
  clockInTime: z.string().nullable().optional(),
  clockOutTime: z.string().nullable().optional(),
  breakStartTime: z.string().nullable().optional(),
  totalHoursWorked: z.number().int().nullable().optional(),
  hourlyRate: z.number().int().min(0).optional(),
  productKnowledgeVerified: z.boolean().optional(),
  productKnowledgeVerifiedAt: z.string().nullable().optional(),
  productKnowledgeScore: z.number().int().nullable().optional(),
  notes: z.string().max(5000).optional(),
});

// ─── Leads ────────────────────────────────────────────────────
export const leadCreateSchema = z.object({
  capturedBy: z.string().min(1, "Captured by is required").max(255),
  firstName: z.string().max(255).default(""),
  lastName: z.string().max(255).default(""),
  email: z.string().max(255).default(""),
  phone: z.string().max(50).default(""),
  instagramHandle: z.string().max(255).default(""),
  xHandle: z.string().max(255).default(""),
  source: leadSourceEnum.default("walk_in"),
  consentGiven: z.boolean().default(false),
  consentTimestamp: z.string().nullable().default(null),
  consentText: z.string().max(2000).default(""),
  notes: z.string().max(5000).default(""),
  tags: z.array(z.string()).default([]),
});

export const leadUpdateSchema = z.object({
  id: z.string().min(1, "Lead ID is required"),
  capturedBy: z.string().min(1).max(255).optional(),
  firstName: z.string().max(255).optional(),
  lastName: z.string().max(255).optional(),
  email: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  instagramHandle: z.string().max(255).optional(),
  xHandle: z.string().max(255).optional(),
  source: leadSourceEnum.optional(),
  consentGiven: z.boolean().optional(),
  consentTimestamp: z.string().nullable().optional(),
  consentText: z.string().max(2000).optional(),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string()).optional(),
});

// ─── Budget Items ─────────────────────────────────────────────
export const budgetItemCreateSchema = z.object({
  category: budgetCategoryEnum.default("miscellaneous"),
  description: z.string().max(2000).default(""),
  vendor: z.string().max(255).default(""),
  estimatedAmount: z.number().int().min(0).default(0),
  actualAmount: z.number().int().nullable().default(null),
  status: budgetStatusEnum.default("estimated"),
  approvedBy: z.string().nullable().default(null),
  approvedAt: z.string().nullable().default(null),
  receiptUrl: z.string().max(1000).default(""),
  notes: z.string().max(5000).default(""),
});

export const budgetItemUpdateSchema = z.object({
  id: z.string().min(1, "Budget item ID is required"),
  category: budgetCategoryEnum.optional(),
  description: z.string().max(2000).optional(),
  vendor: z.string().max(255).optional(),
  estimatedAmount: z.number().int().min(0).optional(),
  actualAmount: z.number().int().nullable().optional(),
  status: budgetStatusEnum.optional(),
  approvedBy: z.string().nullable().optional(),
  approvedAt: z.string().nullable().optional(),
  receiptUrl: z.string().max(1000).optional(),
  notes: z.string().max(5000).optional(),
  approve: z.boolean().optional(),
  reject: z.boolean().optional(),
});

// ─── Documents ────────────────────────────────────────────────
export const documentCreateSchema = z.object({
  type: documentTypeEnum.default("other"),
  title: z.string().min(1, "Title is required").max(500),
  content: z.string().max(50000).default(""),
  fileName: z.string().max(500).default(""),
  fileUrl: z.string().max(1000).default(""),
  fileSize: z.number().int().min(0).default(0),
  scopedToStakeholderId: z.string().nullable().default(null),
  visibleToStakeholderIds: z.array(z.string()).default([]),
  signStatus: documentSignStatusEnum.default("draft"),
  signedBy: z.string().max(255).default(""),
  signedAt: z.string().nullable().default(null),
  signatureData: z.string().max(50000).default(""),
  signerName: z.string().max(255).default(""),
  signerEmail: z.string().max(255).default(""),
  expiresAt: z.string().nullable().default(null),
});

export const documentUpdateSchema = z.object({
  id: z.string().min(1, "Document ID is required"),
  type: documentTypeEnum.optional(),
  title: z.string().min(1).max(500).optional(),
  content: z.string().max(50000).optional(),
  fileName: z.string().max(500).optional(),
  fileUrl: z.string().max(1000).optional(),
  fileSize: z.number().int().min(0).optional(),
  scopedToStakeholderId: z.string().nullable().optional(),
  visibleToStakeholderIds: z.array(z.string()).optional(),
  signStatus: documentSignStatusEnum.optional(),
  signedBy: z.string().max(255).optional(),
  signedAt: z.string().nullable().optional(),
  signatureData: z.string().max(50000).optional(),
  signerName: z.string().max(255).optional(),
  signerEmail: z.string().max(255).optional(),
  expiresAt: z.string().nullable().optional(),
  sign: z.boolean().optional(),
});

// ─── Checklists ───────────────────────────────────────────────
export const checklistCreateSchema = z.object({
  category: checklistCategoryEnum.default("setup"),
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(2000).default(""),
  required: z.boolean().default(false),
  completed: z.boolean().default(false),
  completedBy: z.string().max(255).default(""),
  completedAt: z.string().nullable().default(null),
  dueDate: z.string().nullable().default(null),
  order: z.number().int().min(0).default(0),
});

export const checklistUpdateSchema = z.object({
  id: z.string().min(1, "Checklist item ID is required"),
  category: checklistCategoryEnum.optional(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional(),
  required: z.boolean().optional(),
  completed: z.boolean().optional(),
  completedBy: z.string().max(255).optional(),
  completedAt: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
  toggle: z.boolean().optional(),
});

// ─── Issues ───────────────────────────────────────────────────
export const issueCreateSchema = z.object({
  reportedBy: z.string().min(1, "Reported by is required").max(255),
  reportedByPersonnelId: z.string().nullable().default(null),
  category: issueCategoryEnum.default("other"),
  severity: issueSeverityEnum.default("medium"),
  status: issueStatusEnum.default("open"),
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).default(""),
  resolution: z.string().max(5000).default(""),
  resolvedBy: z.string().max(255).default(""),
  resolvedAt: z.string().nullable().default(null),
  escalatedTo: z.string().max(255).default(""),
  photos: z.array(z.string()).default([]),
});

export const issueUpdateSchema = z.object({
  id: z.string().min(1, "Issue ID is required"),
  reportedBy: z.string().min(1).max(255).optional(),
  reportedByPersonnelId: z.string().nullable().optional(),
  category: issueCategoryEnum.optional(),
  severity: issueSeverityEnum.optional(),
  status: issueStatusEnum.optional(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional(),
  resolution: z.string().max(5000).optional(),
  resolvedBy: z.string().max(255).optional(),
  resolvedAt: z.string().nullable().optional(),
  escalatedTo: z.string().max(255).optional(),
  photos: z.array(z.string()).optional(),
  escalate: z.boolean().optional(),
  resolve: z.boolean().optional(),
});

// ─── Media ────────────────────────────────────────────────────
export const mediaCreateSchema = z.object({
  type: mediaTypeEnum.default("photo"),
  url: z.string().min(1, "URL is required").max(1000),
  thumbnailUrl: z.string().max(1000).default(""),
  caption: z.string().max(2000).default(""),
  takenBy: z.string().max(255).default(""),
  takenAt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  approved: z.boolean().default(false),
  approvedBy: z.string().max(255).default(""),
  fileSize: z.number().int().min(0).default(0),
});

export const mediaUpdateSchema = z.object({
  id: z.string().min(1, "Media ID is required"),
  type: mediaTypeEnum.optional(),
  url: z.string().min(1).max(1000).optional(),
  thumbnailUrl: z.string().max(1000).optional(),
  caption: z.string().max(2000).optional(),
  takenBy: z.string().max(255).optional(),
  takenAt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  approved: z.boolean().optional(),
  approvedBy: z.string().max(255).optional(),
  fileSize: z.number().int().min(0).optional(),
  approve: z.boolean().optional(),
});

// ─── Run of Show ──────────────────────────────────────────────
export const runOfShowCreateSchema = z.object({
  time: z.string().min(1, "Time is required").max(16),
  endTime: z.string().max(16).default(""),
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(2000).default(""),
  responsiblePersonnelId: z.string().nullable().default(null),
  responsibleName: z.string().max(255).default(""),
  completed: z.boolean().default(false),
  completedAt: z.string().nullable().default(null),
  order: z.number().int().min(0).default(0),
});

export const runOfShowUpdateSchema = z.object({
  id: z.string().min(1, "Run of show item ID is required"),
  time: z.string().min(1).max(16).optional(),
  endTime: z.string().max(16).optional(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional(),
  responsiblePersonnelId: z.string().nullable().optional(),
  responsibleName: z.string().max(255).optional(),
  completed: z.boolean().optional(),
  completedAt: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
  complete: z.boolean().optional(),
});

// ─── Reports ──────────────────────────────────────────────────
export const reportCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  summary: z.string().max(5000).default(""),
  highlights: z.array(z.string()).default([]),
  challenges: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  generatedBy: z.string().max(255).default(""),
});

// ─── Shared delete schema for activation sub-resources ────────
export const activationDeleteSchema = z.object({
  id: z.string().min(1, "ID is required"),
});
