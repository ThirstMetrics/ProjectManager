import { pgTable, varchar, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================
// Activations
// ============================================================

export const activations = pgTable("activations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 500 }).notNull(),
  brand: varchar("brand", { length: 255 }).notNull(),
  description: text("description").notNull().default(""),
  color: varchar("color", { length: 16 }).notNull().default("#f59e0b"),
  icon: varchar("icon", { length: 64 }).notNull().default("Zap"),
  phase: varchar("phase", { length: 32 }).notNull().default("planning"),
  status: varchar("status", { length: 32 }).notNull().default("draft"),
  eventDate: timestamp("event_date", { mode: "string" }).notNull(),
  eventEndDate: timestamp("event_end_date", { mode: "string" }),
  setupDate: timestamp("setup_date", { mode: "string" }),
  teardownDate: timestamp("teardown_date", { mode: "string" }),
  venueId: varchar("venue_id", { length: 64 }),
  budgetTotal: integer("budget_total").notNull().default(0),
  budgetSpent: integer("budget_spent").notNull().default(0),
  leadGoal: integer("lead_goal").notNull().default(0),
  sampleGoal: integer("sample_goal").notNull().default(0),
  interactionGoal: integer("interaction_goal").notNull().default(0),
  tags: jsonb("tags").notNull().$type<string[]>().default([]),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  createdBy: varchar("created_by", { length: 255 }).notNull().default(""),
});

export const activationsRelations = relations(activations, ({ many }) => ({
  venues: many(activationVenues),
  stakeholders: many(activationStakeholders),
  products: many(activationProducts),
  personnel: many(activationPersonnel),
  leads: many(activationLeads),
  budgetItems: many(activationBudgetItems),
  documents: many(activationDocuments),
  checklists: many(activationChecklists),
  issues: many(activationIssues),
  media: many(activationMedia),
  runOfShow: many(activationRunOfShow),
  reports: many(activationReports),
}));

// ============================================================
// Activation Venues
// ============================================================

export const activationVenues = pgTable("activation_venues", {
  id: varchar("id", { length: 64 }).primaryKey(),
  activationId: varchar("activation_id", { length: 64 }).notNull().references(() => activations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 500 }).notNull(),
  address: varchar("address", { length: 500 }).notNull().default(""),
  city: varchar("city", { length: 255 }).notNull().default(""),
  state: varchar("state", { length: 64 }).notNull().default(""),
  zip: varchar("zip", { length: 16 }).notNull().default(""),
  contactName: varchar("contact_name", { length: 255 }).notNull().default(""),
  contactEmail: varchar("contact_email", { length: 255 }).notNull().default(""),
  contactPhone: varchar("contact_phone", { length: 32 }).notNull().default(""),
  venueType: varchar("venue_type", { length: 64 }).notNull().default(""),
  capacity: integer("capacity").notNull().default(0),
  status: varchar("status", { length: 32 }).notNull().default("identified"),
  walkthroughDate: timestamp("walkthrough_date", { mode: "string" }),
  walkthroughNotes: text("walkthrough_notes").notNull().default(""),
  bookingConfirmedAt: timestamp("booking_confirmed_at", { mode: "string" }),
  bookingCost: integer("booking_cost").notNull().default(0),
  specialRequirements: text("special_requirements").notNull().default(""),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export const activationVenuesRelations = relations(activationVenues, ({ one }) => ({
  activation: one(activations, { fields: [activationVenues.activationId], references: [activations.id] }),
}));

// ============================================================
// Activation Stakeholders
// ============================================================

export const activationStakeholders = pgTable("activation_stakeholders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  activationId: varchar("activation_id", { length: 64 }).notNull().references(() => activations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().default(""),
  phone: varchar("phone", { length: 32 }).notNull().default(""),
  company: varchar("company", { length: 255 }).notNull().default(""),
  type: varchar("type", { length: 32 }).notNull().default("other"),
  role: varchar("role", { length: 255 }).notNull().default(""),
  avatar: varchar("avatar", { length: 500 }),
  ndaStatus: varchar("nda_status", { length: 32 }).notNull().default("not_required"),
  ndaDocumentId: varchar("nda_document_id", { length: 64 }),
  canViewBudget: boolean("can_view_budget").notNull().default(false),
  canViewLeads: boolean("can_view_leads").notNull().default(false),
  canViewAllDocuments: boolean("can_view_all_documents").notNull().default(false),
  notes: text("notes").notNull().default(""),
  invitedAt: timestamp("invited_at", { mode: "string" }).notNull().defaultNow(),
  status: varchar("status", { length: 32 }).notNull().default("invited"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const activationStakeholdersRelations = relations(activationStakeholders, ({ one }) => ({
  activation: one(activations, { fields: [activationStakeholders.activationId], references: [activations.id] }),
}));

// ============================================================
// Activation Products
// ============================================================

export const activationProducts = pgTable("activation_products", {
  id: varchar("id", { length: 64 }).primaryKey(),
  activationId: varchar("activation_id", { length: 64 }).notNull().references(() => activations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 500 }).notNull(),
  sku: varchar("sku", { length: 128 }).notNull().default(""),
  category: varchar("category", { length: 64 }).notNull().default(""),
  quantityRequested: integer("quantity_requested").notNull().default(0),
  quantityConfirmed: integer("quantity_confirmed").notNull().default(0),
  quantityShipped: integer("quantity_shipped").notNull().default(0),
  quantityDelivered: integer("quantity_delivered").notNull().default(0),
  quantityUsed: integer("quantity_used").notNull().default(0),
  quantityReturned: integer("quantity_returned").notNull().default(0),
  quantityDamaged: integer("quantity_damaged").notNull().default(0),
  unitCost: integer("unit_cost").notNull().default(0),
  status: varchar("status", { length: 32 }).notNull().default("requested"),
  shippingTrackingNumber: varchar("shipping_tracking_number", { length: 255 }).notNull().default(""),
  shippingCarrier: varchar("shipping_carrier", { length: 128 }).notNull().default(""),
  expectedDeliveryDate: timestamp("expected_delivery_date", { mode: "string" }),
  deliveredAt: timestamp("delivered_at", { mode: "string" }),
  reconciledAt: timestamp("reconciled_at", { mode: "string" }),
  reconciledBy: varchar("reconciled_by", { length: 255 }),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export const activationProductsRelations = relations(activationProducts, ({ one }) => ({
  activation: one(activations, { fields: [activationProducts.activationId], references: [activations.id] }),
}));

// ============================================================
// Activation Personnel
// ============================================================

export const activationPersonnel = pgTable("activation_personnel", {
  id: varchar("id", { length: 64 }).primaryKey(),
  activationId: varchar("activation_id", { length: 64 }).notNull().references(() => activations.id, { onDelete: "cascade" }),
  stakeholderId: varchar("stakeholder_id", { length: 64 }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().default(""),
  phone: varchar("phone", { length: 32 }).notNull().default(""),
  role: varchar("role", { length: 255 }).notNull().default(""),
  clockStatus: varchar("clock_status", { length: 32 }).notNull().default("not_started"),
  clockInTime: timestamp("clock_in_time", { mode: "string" }),
  clockOutTime: timestamp("clock_out_time", { mode: "string" }),
  breakStartTime: timestamp("break_start_time", { mode: "string" }),
  totalHoursWorked: integer("total_hours_worked"),
  hourlyRate: integer("hourly_rate").notNull().default(0),
  productKnowledgeVerified: boolean("product_knowledge_verified").notNull().default(false),
  productKnowledgeVerifiedAt: timestamp("product_knowledge_verified_at", { mode: "string" }),
  productKnowledgeScore: integer("product_knowledge_score"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const activationPersonnelRelations = relations(activationPersonnel, ({ one }) => ({
  activation: one(activations, { fields: [activationPersonnel.activationId], references: [activations.id] }),
}));

// ============================================================
// Activation Leads
// ============================================================

export const activationLeads = pgTable("activation_leads", {
  id: varchar("id", { length: 64 }).primaryKey(),
  activationId: varchar("activation_id", { length: 64 }).notNull().references(() => activations.id, { onDelete: "cascade" }),
  capturedBy: varchar("captured_by", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull().default(""),
  lastName: varchar("last_name", { length: 255 }).notNull().default(""),
  email: varchar("email", { length: 255 }).notNull().default(""),
  phone: varchar("phone", { length: 32 }).notNull().default(""),
  instagramHandle: varchar("instagram_handle", { length: 255 }).notNull().default(""),
  xHandle: varchar("x_handle", { length: 255 }).notNull().default(""),
  source: varchar("source", { length: 32 }).notNull().default("walk_in"),
  consentGiven: boolean("consent_given").notNull().default(false),
  consentTimestamp: timestamp("consent_timestamp", { mode: "string" }),
  consentText: text("consent_text").notNull().default(""),
  notes: text("notes").notNull().default(""),
  tags: jsonb("tags").notNull().$type<string[]>().default([]),
  capturedAt: timestamp("captured_at", { mode: "string" }).notNull().defaultNow(),
});

export const activationLeadsRelations = relations(activationLeads, ({ one }) => ({
  activation: one(activations, { fields: [activationLeads.activationId], references: [activations.id] }),
}));

// ============================================================
// Activation Budget Items
// ============================================================

export const activationBudgetItems = pgTable("activation_budget_items", {
  id: varchar("id", { length: 64 }).primaryKey(),
  activationId: varchar("activation_id", { length: 64 }).notNull().references(() => activations.id, { onDelete: "cascade" }),
  category: varchar("category", { length: 32 }).notNull().default("miscellaneous"),
  description: text("description").notNull().default(""),
  vendor: varchar("vendor", { length: 255 }).notNull().default(""),
  estimatedAmount: integer("estimated_amount").notNull().default(0),
  actualAmount: integer("actual_amount"),
  status: varchar("status", { length: 32 }).notNull().default("estimated"),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvedAt: timestamp("approved_at", { mode: "string" }),
  receiptUrl: text("receipt_url").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export const activationBudgetItemsRelations = relations(activationBudgetItems, ({ one }) => ({
  activation: one(activations, { fields: [activationBudgetItems.activationId], references: [activations.id] }),
}));

// ============================================================
// Activation Documents
// ============================================================

export const activationDocuments = pgTable("activation_documents", {
  id: varchar("id", { length: 64 }).primaryKey(),
  activationId: varchar("activation_id", { length: 64 }).notNull().references(() => activations.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 32 }).notNull().default("other"),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull().default(""),
  fileName: varchar("file_name", { length: 500 }).notNull().default(""),
  fileUrl: text("file_url").notNull().default(""),
  fileSize: integer("file_size").notNull().default(0),
  scopedToStakeholderId: varchar("scoped_to_stakeholder_id", { length: 64 }),
  visibleToStakeholderIds: jsonb("visible_to_stakeholder_ids").notNull().$type<string[]>().default([]),
  signStatus: varchar("sign_status", { length: 32 }).notNull().default("draft"),
  signedBy: varchar("signed_by", { length: 255 }),
  signedAt: timestamp("signed_at", { mode: "string" }),
  signatureData: text("signature_data"),
  signerName: varchar("signer_name", { length: 255 }),
  signerEmail: varchar("signer_email", { length: 255 }),
  expiresAt: timestamp("expires_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export const activationDocumentsRelations = relations(activationDocuments, ({ one }) => ({
  activation: one(activations, { fields: [activationDocuments.activationId], references: [activations.id] }),
}));

// ============================================================
// Activation Checklists
// ============================================================

export const activationChecklists = pgTable("activation_checklists", {
  id: varchar("id", { length: 64 }).primaryKey(),
  activationId: varchar("activation_id", { length: 64 }).notNull().references(() => activations.id, { onDelete: "cascade" }),
  category: varchar("category", { length: 32 }).notNull().default("setup"),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull().default(""),
  required: boolean("required").notNull().default(false),
  completed: boolean("completed").notNull().default(false),
  completedBy: varchar("completed_by", { length: 255 }),
  completedAt: timestamp("completed_at", { mode: "string" }),
  dueDate: timestamp("due_date", { mode: "string" }),
  order: integer("order").notNull().default(0),
});

export const activationChecklistsRelations = relations(activationChecklists, ({ one }) => ({
  activation: one(activations, { fields: [activationChecklists.activationId], references: [activations.id] }),
}));

// ============================================================
// Activation Issues
// ============================================================

export const activationIssues = pgTable("activation_issues", {
  id: varchar("id", { length: 64 }).primaryKey(),
  activationId: varchar("activation_id", { length: 64 }).notNull().references(() => activations.id, { onDelete: "cascade" }),
  reportedBy: varchar("reported_by", { length: 255 }).notNull(),
  reportedByPersonnelId: varchar("reported_by_personnel_id", { length: 64 }),
  category: varchar("category", { length: 32 }).notNull().default("other"),
  severity: varchar("severity", { length: 16 }).notNull().default("medium"),
  status: varchar("status", { length: 32 }).notNull().default("open"),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull().default(""),
  resolution: text("resolution").notNull().default(""),
  resolvedBy: varchar("resolved_by", { length: 255 }),
  resolvedAt: timestamp("resolved_at", { mode: "string" }),
  escalatedTo: varchar("escalated_to", { length: 255 }),
  photos: jsonb("photos").notNull().$type<string[]>().default([]),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export const activationIssuesRelations = relations(activationIssues, ({ one }) => ({
  activation: one(activations, { fields: [activationIssues.activationId], references: [activations.id] }),
}));

// ============================================================
// Activation Media
// ============================================================

export const activationMedia = pgTable("activation_media", {
  id: varchar("id", { length: 64 }).primaryKey(),
  activationId: varchar("activation_id", { length: 64 }).notNull().references(() => activations.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 16 }).notNull().default("photo"),
  url: text("url").notNull().default(""),
  thumbnailUrl: text("thumbnail_url").notNull().default(""),
  caption: text("caption").notNull().default(""),
  takenBy: varchar("taken_by", { length: 255 }).notNull().default(""),
  takenAt: timestamp("taken_at", { mode: "string" }).notNull().defaultNow(),
  tags: jsonb("tags").notNull().$type<string[]>().default([]),
  approved: boolean("approved").notNull().default(false),
  approvedBy: varchar("approved_by", { length: 255 }),
  fileSize: integer("file_size").notNull().default(0),
});

export const activationMediaRelations = relations(activationMedia, ({ one }) => ({
  activation: one(activations, { fields: [activationMedia.activationId], references: [activations.id] }),
}));

// ============================================================
// Activation Run of Show
// ============================================================

export const activationRunOfShow = pgTable("activation_run_of_show", {
  id: varchar("id", { length: 64 }).primaryKey(),
  activationId: varchar("activation_id", { length: 64 }).notNull().references(() => activations.id, { onDelete: "cascade" }),
  time: varchar("time", { length: 16 }).notNull(),
  endTime: varchar("end_time", { length: 16 }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull().default(""),
  responsiblePersonnelId: varchar("responsible_personnel_id", { length: 64 }),
  responsibleName: varchar("responsible_name", { length: 255 }).notNull().default(""),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at", { mode: "string" }),
  order: integer("order").notNull().default(0),
});

export const activationRunOfShowRelations = relations(activationRunOfShow, ({ one }) => ({
  activation: one(activations, { fields: [activationRunOfShow.activationId], references: [activations.id] }),
}));

// ============================================================
// Activation Reports
// ============================================================

export const activationReports = pgTable("activation_reports", {
  id: varchar("id", { length: 64 }).primaryKey(),
  activationId: varchar("activation_id", { length: 64 }).notNull().references(() => activations.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  summary: text("summary").notNull().default(""),
  totalLeads: integer("total_leads").notNull().default(0),
  totalSamples: integer("total_samples").notNull().default(0),
  totalInteractions: integer("total_interactions").notNull().default(0),
  totalBudgetSpent: integer("total_budget_spent").notNull().default(0),
  costPerLead: integer("cost_per_lead").notNull().default(0),
  costPerSample: integer("cost_per_sample").notNull().default(0),
  costPerInteraction: integer("cost_per_interaction").notNull().default(0),
  highlights: jsonb("highlights").notNull().$type<string[]>().default([]),
  challenges: jsonb("challenges").notNull().$type<string[]>().default([]),
  recommendations: jsonb("recommendations").notNull().$type<string[]>().default([]),
  generatedAt: timestamp("generated_at", { mode: "string" }).notNull().defaultNow(),
  generatedBy: varchar("generated_by", { length: 255 }).notNull().default(""),
});

export const activationReportsRelations = relations(activationReports, ({ one }) => ({
  activation: one(activations, { fields: [activationReports.activationId], references: [activations.id] }),
}));
