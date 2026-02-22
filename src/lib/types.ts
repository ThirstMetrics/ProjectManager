// ============================================================
// Core Types for TaskFlow Pro
// ============================================================

export type ProjectType = "software" | "beverage" | "marketing" | "event" | "general";
export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type ApprovalStatus = "none" | "pending" | "approved" | "rejected";
export type NotificationType = "info" | "success" | "warning" | "danger";
export type NotificationChannel = "screen" | "email" | "sms";
export type ProjectRole = "owner" | "manager" | "contributor" | "viewer";

export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  color: string;
  icon: string;
  status: "active" | "archived" | "completed";
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  dueDate: string | null;
  startDate: string | null;
  tags: string[];
  subtasks: Subtask[];
  dependencies: string[];
  dependents: string[];
  attachments: string[];
  approvalRequired: boolean;
  approver: string | null;
  approvalStatus: ApprovalStatus;
  approvalComment: string | null;
  approvalRequestedAt: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  order: number;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface CalendarEvent {
  id: string;
  projectId: string | null;
  taskId: string | null;
  title: string;
  description: string;
  start: string;
  end: string;
  allDay: boolean;
  color: string;
  type: "event" | "deadline" | "milestone" | "meeting";
}

export interface FileItem {
  id: string;
  projectId: string;
  name: string;
  size: number;
  type: string;
  url: string;
  folder: string;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
}

// ============================================================
// Team & Roles
// ============================================================

export interface TeamMember {
  id: string;
  projectId: string;
  name: string;
  email: string;
  role: ProjectRole;
  avatar: string | null;     // URL or null for initials
  invitedBy: string | null;  // member ID who invited them
  joinedAt: string;
  lastLoginAt: string;
  status: "active" | "invited" | "inactive";
}

export interface ActivityLogEntry {
  id: string;
  projectId: string;
  memberId: string;
  memberName: string;
  action: string;            // e.g. "uploaded file", "completed task", "sent message"
  target: string;            // e.g. file name, task title, channel name
  timestamp: string;
}

// ============================================================
// Chat
// ============================================================

export interface ChatChannel {
  id: string;
  projectId: string;
  name: string;              // e.g. "general", "menu-edits", "print-proofs"
  description: string;
  createdBy: string;
  createdAt: string;
  isDefault: boolean;        // #general is default, cannot be deleted
}

export interface ChatMessage {
  id: string;
  channelId: string;
  projectId: string;
  senderId: string;
  senderName: string;
  content: string;
  threadId: string | null;   // null = top-level, string = reply to this message ID
  mentions: string[];        // member IDs mentioned via @
  timestamp: string;
  edited: boolean;
}

// ============================================================
// Notifications
// ============================================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel[];
  read: boolean;
  actionUrl: string | null;
  projectId: string | null;
  taskId: string | null;
  createdAt: string;
}

export interface NotificationPreferences {
  screen: boolean;
  email: boolean;
  sms: boolean;
  emailAddress: string;
  phoneNumber: string;
  taskAssigned: NotificationChannel[];
  taskCompleted: NotificationChannel[];
  taskOverdue: NotificationChannel[];
  eventReminder: NotificationChannel[];
  fileUploaded: NotificationChannel[];
  projectUpdate: NotificationChannel[];
}

export interface DashboardStat {
  label: string;
  value: number | string;
  change?: number;
  icon: string;
  color: string;
}

// ============================================================
// Role permissions helper
// ============================================================

export const rolePermissions: Record<ProjectRole, {
  label: string;
  description: string;
  canInvite: boolean;
  canManageTasks: boolean;
  canUploadFiles: boolean;
  canChat: boolean;
  canEditProject: boolean;
  canViewActivity: boolean;
}> = {
  owner: {
    label: "Owner",
    description: "Full control over the project",
    canInvite: true, canManageTasks: true, canUploadFiles: true,
    canChat: true, canEditProject: true, canViewActivity: true,
  },
  manager: {
    label: "Manager",
    description: "Can invite members, assign tasks, manage files",
    canInvite: true, canManageTasks: true, canUploadFiles: true,
    canChat: true, canEditProject: false, canViewActivity: true,
  },
  contributor: {
    label: "Contributor",
    description: "Can update tasks, upload files, and chat",
    canInvite: false, canManageTasks: true, canUploadFiles: true,
    canChat: true, canEditProject: false, canViewActivity: false,
  },
  viewer: {
    label: "Viewer",
    description: "Read-only access to project content",
    canInvite: false, canManageTasks: false, canUploadFiles: false,
    canChat: false, canEditProject: false, canViewActivity: false,
  },
};

// ============================================================
// Brand Activation Types
// ============================================================

export type ActivationPhase = "planning" | "pre_event" | "live" | "post_event" | "closed";
export type ActivationStatus = "draft" | "confirmed" | "in_progress" | "completed" | "cancelled";
export type VenueStatus = "identified" | "contacted" | "walkthrough_scheduled" | "walkthrough_done" | "booked" | "cancelled";
export type StakeholderType = "brand" | "venue" | "distributor" | "marketing_agency" | "vendor" | "personnel" | "other";
export type StakeholderNDAStatus = "not_required" | "pending" | "sent" | "signed" | "expired" | "declined";
export type ProductInventoryStatus = "requested" | "confirmed" | "shipped" | "delivered" | "in_use" | "reconciled";
export type PersonnelClockStatus = "not_started" | "clocked_in" | "on_break" | "clocked_out";
export type DocumentType = "nda" | "contract" | "permit" | "license" | "insurance" | "other";
export type DocumentSignStatus = "draft" | "pending_signature" | "signed" | "expired" | "voided";
export type BudgetCategory = "venue" | "staffing" | "product" | "materials" | "shipping" | "permits" | "marketing" | "photography" | "decor" | "catering" | "miscellaneous";
export type BudgetItemStatus = "estimated" | "pending_approval" | "approved" | "paid" | "rejected";
export type IssueCategory = "product" | "personnel" | "venue" | "equipment" | "safety" | "compliance" | "other";
export type IssueSeverity = "low" | "medium" | "high" | "critical";
export type IssueStatus = "open" | "in_progress" | "escalated" | "resolved" | "closed";
export type LeadSource = "instagram" | "x" | "email" | "phone" | "qr_code" | "walk_in" | "other";
export type ChecklistCategory = "compliance" | "setup" | "teardown" | "safety" | "branding" | "product_knowledge";

// ============================================================
// Activation Core
// ============================================================

export interface Activation {
  id: string;
  name: string;
  brand: string;
  description: string;
  color: string;
  icon: string;
  phase: ActivationPhase;
  status: ActivationStatus;
  eventDate: string;
  eventEndDate: string | null;
  setupDate: string | null;
  teardownDate: string | null;
  venueId: string | null;
  budgetTotal: number;       // in cents
  budgetSpent: number;       // in cents
  leadGoal: number;
  sampleGoal: number;
  interactionGoal: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ActivationVenue {
  id: string;
  activationId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  venueType: string;
  capacity: number;
  status: VenueStatus;
  walkthroughDate: string | null;
  walkthroughNotes: string;
  bookingConfirmedAt: string | null;
  bookingCost: number;       // in cents
  specialRequirements: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Activation Stakeholders & Personnel
// ============================================================

export interface ActivationStakeholder {
  id: string;
  activationId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  type: StakeholderType;
  role: string;
  avatar: string | null;
  ndaStatus: StakeholderNDAStatus;
  ndaDocumentId: string | null;
  canViewBudget: boolean;
  canViewLeads: boolean;
  canViewAllDocuments: boolean;
  notes: string;
  invitedAt: string;
  status: "active" | "invited" | "inactive";
  createdAt: string;
}

export interface ActivationPersonnel {
  id: string;
  activationId: string;
  stakeholderId: string | null;
  name: string;
  email: string;
  phone: string;
  role: string;
  clockStatus: PersonnelClockStatus;
  clockInTime: string | null;
  clockOutTime: string | null;
  breakStartTime: string | null;
  totalHoursWorked: number | null;
  hourlyRate: number;        // in cents
  productKnowledgeVerified: boolean;
  productKnowledgeVerifiedAt: string | null;
  productKnowledgeScore: number | null;
  notes: string;
  createdAt: string;
}

// ============================================================
// Activation Products & Inventory
// ============================================================

export interface ActivationProduct {
  id: string;
  activationId: string;
  name: string;
  sku: string;
  category: string;
  quantityRequested: number;
  quantityConfirmed: number;
  quantityShipped: number;
  quantityDelivered: number;
  quantityUsed: number;
  quantityReturned: number;
  quantityDamaged: number;
  unitCost: number;          // in cents
  status: ProductInventoryStatus;
  shippingTrackingNumber: string;
  shippingCarrier: string;
  expectedDeliveryDate: string | null;
  deliveredAt: string | null;
  reconciledAt: string | null;
  reconciledBy: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Activation Budget
// ============================================================

export interface ActivationBudgetItem {
  id: string;
  activationId: string;
  category: BudgetCategory;
  description: string;
  vendor: string;
  estimatedAmount: number;   // in cents
  actualAmount: number | null;
  status: BudgetItemStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  receiptUrl: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Activation Documents & E-Sign
// ============================================================

export interface ActivationDocument {
  id: string;
  activationId: string;
  type: DocumentType;
  title: string;
  content: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  scopedToStakeholderId: string | null;
  visibleToStakeholderIds: string[];
  signStatus: DocumentSignStatus;
  signedBy: string | null;
  signedAt: string | null;
  signatureData: string | null;
  signerName: string | null;
  signerEmail: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Activation Checklists & Compliance
// ============================================================

export interface ActivationChecklist {
  id: string;
  activationId: string;
  category: ChecklistCategory;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  completedBy: string | null;
  completedAt: string | null;
  dueDate: string | null;
  order: number;
}

// ============================================================
// Activation Issues & Escalation
// ============================================================

export interface ActivationIssue {
  id: string;
  activationId: string;
  reportedBy: string;
  reportedByPersonnelId: string | null;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  title: string;
  description: string;
  resolution: string;
  resolvedBy: string | null;
  resolvedAt: string | null;
  escalatedTo: string | null;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Activation Lead Capture
// ============================================================

export interface ActivationLeadCapture {
  id: string;
  activationId: string;
  capturedBy: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  instagramHandle: string;
  xHandle: string;
  source: LeadSource;
  consentGiven: boolean;
  consentTimestamp: string | null;
  consentText: string;
  notes: string;
  tags: string[];
  capturedAt: string;
}

// ============================================================
// Activation Media
// ============================================================

export interface ActivationMediaItem {
  id: string;
  activationId: string;
  type: "photo" | "video";
  url: string;
  thumbnailUrl: string;
  caption: string;
  takenBy: string;
  takenAt: string;
  tags: string[];
  approved: boolean;
  approvedBy: string | null;
  fileSize: number;
}

// ============================================================
// Activation Run of Show
// ============================================================

export interface ActivationRunOfShow {
  id: string;
  activationId: string;
  time: string;
  endTime: string | null;
  title: string;
  description: string;
  responsiblePersonnelId: string | null;
  responsibleName: string;
  completed: boolean;
  completedAt: string | null;
  order: number;
}

// ============================================================
// Activation After-Action Report
// ============================================================

export interface ActivationReport {
  id: string;
  activationId: string;
  title: string;
  summary: string;
  totalLeads: number;
  totalSamples: number;
  totalInteractions: number;
  totalBudgetSpent: number;  // in cents
  costPerLead: number;       // in cents
  costPerSample: number;     // in cents
  costPerInteraction: number; // in cents
  highlights: string[];
  challenges: string[];
  recommendations: string[];
  generatedAt: string;
  generatedBy: string;
}

// ============================================================
// Activation Stakeholder Permissions
// ============================================================

export const stakeholderPermissions: Record<StakeholderType, {
  label: string;
  description: string;
  defaultCanViewBudget: boolean;
  defaultCanViewLeads: boolean;
  defaultCanViewAllDocuments: boolean;
}> = {
  brand: {
    label: "Brand",
    description: "The brand being activated (e.g. T-Mobile, PepsiCo)",
    defaultCanViewBudget: true, defaultCanViewLeads: true, defaultCanViewAllDocuments: false,
  },
  venue: {
    label: "Venue",
    description: "Location hosting the activation",
    defaultCanViewBudget: false, defaultCanViewLeads: false, defaultCanViewAllDocuments: false,
  },
  distributor: {
    label: "Distributor",
    description: "Product distributor managing logistics",
    defaultCanViewBudget: true, defaultCanViewLeads: false, defaultCanViewAllDocuments: false,
  },
  marketing_agency: {
    label: "Marketing Agency",
    description: "Agency handling promotion and creative",
    defaultCanViewBudget: false, defaultCanViewLeads: true, defaultCanViewAllDocuments: false,
  },
  vendor: {
    label: "Vendor",
    description: "Third-party supplier (photography, decor, catering)",
    defaultCanViewBudget: false, defaultCanViewLeads: false, defaultCanViewAllDocuments: false,
  },
  personnel: {
    label: "On-Ground Personnel",
    description: "Brand ambassadors and event staff",
    defaultCanViewBudget: false, defaultCanViewLeads: false, defaultCanViewAllDocuments: false,
  },
  other: {
    label: "Other",
    description: "Other stakeholder type",
    defaultCanViewBudget: false, defaultCanViewLeads: false, defaultCanViewAllDocuments: false,
  },
};
