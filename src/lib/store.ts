import { create } from "zustand";
import { v4 as uuid } from "uuid";
import {
  Project, Task, CalendarEvent, FileItem, Notification,
  NotificationPreferences, TaskStatus, Subtask, ApprovalStatus,
  Milestone, TeamMember, ActivityLogEntry, ChatChannel, ChatMessage, ProjectRole,
  Activation, ActivationVenue, ActivationStakeholder, ActivationProduct,
  ActivationPersonnel, ActivationLeadCapture, ActivationBudgetItem,
  ActivationDocument, ActivationChecklist, ActivationIssue,
  ActivationMediaItem, ActivationRunOfShow, ActivationReport,
  ActivationPhase, StakeholderType, StakeholderNDAStatus,
  BudgetCategory, BudgetItemStatus, DocumentType, DocumentSignStatus,
  ProductInventoryStatus, PersonnelClockStatus, VenueStatus,
  IssueSeverity, IssueStatus, IssueCategory, LeadSource, ChecklistCategory,
} from "./types";

// ---------- seed helpers ----------
function daysFromNow(n: number) {
  const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString();
}
function hoursAgo(n: number) {
  return new Date(Date.now() - n * 60 * 60 * 1000).toISOString();
}
const now = () => new Date().toISOString();

// ---------- seed data ----------
const seedProjects: Project[] = [
  { id: "proj-1", name: "Mobile App Redesign", description: "Complete overhaul of the mobile experience with new UI components and improved performance.", type: "software", color: "#6366f1", icon: "Code2", status: "active", startDate: daysFromNow(-14), endDate: daysFromNow(30), createdAt: daysFromNow(-14), updatedAt: now() },
  { id: "proj-2", name: "Valentine's Champagne Activation", description: "Brand X sponsoring a Valentine's champagne special with Restaurant Y — tastings, POS displays, photographer, flower wall.", type: "beverage", color: "#f59e0b", icon: "Wine", status: "active", startDate: daysFromNow(-7), endDate: daysFromNow(14), createdAt: daysFromNow(-7), updatedAt: now() },
  { id: "proj-3", name: "Q1 Marketing Push", description: "Multi-channel marketing campaign for Q1 product launches.", type: "marketing", color: "#ec4899", icon: "Megaphone", status: "active", startDate: daysFromNow(-3), endDate: daysFromNow(60), createdAt: daysFromNow(-3), updatedAt: now() },
];

const seedMilestones: Milestone[] = [
  { id: "ms-1", projectId: "proj-1", title: "Design Review Complete", dueDate: daysFromNow(3), completed: false },
  { id: "ms-2", projectId: "proj-1", title: "Sprint Demo", dueDate: daysFromNow(7), completed: false },
  { id: "ms-3", projectId: "proj-1", title: "Beta Release", dueDate: daysFromNow(25), completed: false },
  { id: "ms-4", projectId: "proj-2", title: "Venue Confirmed", dueDate: daysFromNow(2), completed: false },
  { id: "ms-5", projectId: "proj-2", title: "Menu Finalized", dueDate: daysFromNow(5), completed: false },
  { id: "ms-6", projectId: "proj-2", title: "Print Materials Ready", dueDate: daysFromNow(8), completed: false },
  { id: "ms-7", projectId: "proj-2", title: "Valentine's Event Day", dueDate: daysFromNow(14), completed: false },
  { id: "ms-8", projectId: "proj-3", title: "Campaign Go-Live", dueDate: daysFromNow(10), completed: false },
];

const seedTasks: Task[] = [
  { id: "task-1", projectId: "proj-1", title: "Design new navigation flow", description: "Create wireframes and high-fidelity mockups.", status: "in_progress", priority: "high", assignee: "Alice", dueDate: daysFromNow(3), startDate: daysFromNow(-5), tags: ["design", "ux"], subtasks: [{ id: "st-1", title: "Research competitor patterns", completed: true }, { id: "st-2", title: "Create wireframes", completed: true }, { id: "st-3", title: "High-fidelity mockups", completed: false }], dependencies: [], dependents: ["task-2", "task-3"], attachments: [], approvalRequired: false, approver: null, approvalStatus: "none", approvalComment: null, approvalRequestedAt: null, createdAt: daysFromNow(-5), updatedAt: now(), completedAt: null, order: 0 },
  { id: "task-2", projectId: "proj-1", title: "Implement navigation components", description: "Build React Native navigation components.", status: "todo", priority: "high", assignee: "Bob", dueDate: daysFromNow(7), startDate: daysFromNow(3), tags: ["frontend"], subtasks: [], dependencies: ["task-1"], dependents: [], attachments: [], approvalRequired: false, approver: null, approvalStatus: "none", approvalComment: null, approvalRequestedAt: null, createdAt: daysFromNow(-3), updatedAt: now(), completedAt: null, order: 1 },
  { id: "task-3", projectId: "proj-1", title: "API integration for user profiles", description: "Connect redesigned profile screens to REST API.", status: "backlog", priority: "medium", assignee: null, dueDate: daysFromNow(10), startDate: null, tags: ["backend", "api"], subtasks: [], dependencies: ["task-1"], dependents: [], attachments: [], approvalRequired: false, approver: null, approvalStatus: "none", approvalComment: null, approvalRequestedAt: null, createdAt: daysFromNow(-2), updatedAt: now(), completedAt: null, order: 2 },
  { id: "task-4", projectId: "proj-1", title: "Write unit tests for auth module", description: "Achieve 90%+ coverage.", status: "done", priority: "medium", assignee: "Alice", dueDate: daysFromNow(-1), startDate: daysFromNow(-7), tags: ["testing"], subtasks: [], dependencies: [], dependents: [], attachments: [], approvalRequired: false, approver: null, approvalStatus: "none", approvalComment: null, approvalRequestedAt: null, createdAt: daysFromNow(-7), updatedAt: now(), completedAt: daysFromNow(-1), order: 3 },
  { id: "task-5", projectId: "proj-2", title: "Book venue for champagne tasting", description: "Secure Restaurant Y for the Valentine's event.", status: "in_progress", priority: "urgent", assignee: "Carol", dueDate: daysFromNow(2), startDate: daysFromNow(-4), tags: ["venue", "logistics"], subtasks: [{ id: "st-4", title: "Research venue options", completed: true }, { id: "st-5", title: "Get quotes from Restaurant Y", completed: true }, { id: "st-6", title: "Sign venue contract", completed: false }], dependencies: [], dependents: ["task-6"], attachments: [], approvalRequired: false, approver: null, approvalStatus: "none", approvalComment: null, approvalRequestedAt: null, createdAt: daysFromNow(-6), updatedAt: now(), completedAt: null, order: 0 },
  { id: "task-6", projectId: "proj-2", title: "Design POS display & table tents", description: "Create Brand X Valentine's branded point-of-sale materials.", status: "todo", priority: "high", assignee: "Maria", dueDate: daysFromNow(8), startDate: daysFromNow(2), tags: ["design", "print"], subtasks: [], dependencies: ["task-5"], dependents: [], attachments: [], approvalRequired: true, approver: "Carol", approvalStatus: "none", approvalComment: null, approvalRequestedAt: null, createdAt: daysFromNow(-3), updatedAt: now(), completedAt: null, order: 1 },
  { id: "task-7", projectId: "proj-2", title: "Coordinate influencer outreach", description: "Reach out to 20 local influencers for event coverage.", status: "todo", priority: "medium", assignee: "Carol", dueDate: daysFromNow(5), startDate: null, tags: ["marketing", "influencer"], subtasks: [], dependencies: [], dependents: [], attachments: [], approvalRequired: false, approver: null, approvalStatus: "none", approvalComment: null, approvalRequestedAt: null, createdAt: daysFromNow(-2), updatedAt: now(), completedAt: null, order: 2 },
  { id: "task-9", projectId: "proj-2", title: "Chef uploads special menu", description: "Chef to create and upload Valentine's champagne pairing menu.", status: "review", priority: "high", assignee: "Chef Laurent", dueDate: daysFromNow(5), startDate: null, tags: ["menu", "food"], subtasks: [], dependencies: [], dependents: [], attachments: [], approvalRequired: true, approver: "Sophie", approvalStatus: "pending", approvalComment: null, approvalRequestedAt: hoursAgo(6), createdAt: daysFromNow(-1), updatedAt: now(), completedAt: null, order: 3 },
  { id: "task-10", projectId: "proj-2", title: "Send final menu to printer", description: "Once menu is approved, send to Maria for printing.", status: "backlog", priority: "high", assignee: "Carol", dueDate: daysFromNow(8), startDate: null, tags: ["print", "logistics"], subtasks: [], dependencies: [], dependents: [], attachments: [], approvalRequired: true, approver: "Jake", approvalStatus: "none", approvalComment: null, approvalRequestedAt: null, createdAt: daysFromNow(-1), updatedAt: now(), completedAt: null, order: 4 },
  { id: "task-11", projectId: "proj-2", title: "Book photographer for event", description: "Hire Brand X's preferred photographer for Valentine's event.", status: "todo", priority: "medium", assignee: "Jake", dueDate: daysFromNow(10), startDate: null, tags: ["photography", "vendor"], subtasks: [], dependencies: [], dependents: [], attachments: [], approvalRequired: false, approver: null, approvalStatus: "none", approvalComment: null, approvalRequestedAt: null, createdAt: daysFromNow(-1), updatedAt: now(), completedAt: null, order: 5 },
  { id: "task-12", projectId: "proj-2", title: "Arrange flower wall for entrance", description: "Hire party company for branded flower wall installation.", status: "backlog", priority: "medium", assignee: "Jake", dueDate: daysFromNow(12), startDate: null, tags: ["decor", "vendor"], subtasks: [], dependencies: [], dependents: [], attachments: [], approvalRequired: false, approver: null, approvalStatus: "none", approvalComment: null, approvalRequestedAt: null, createdAt: now(), updatedAt: now(), completedAt: null, order: 6 },
  { id: "task-8", projectId: "proj-3", title: "Draft email campaign copy", description: "Write copy for the 4-part email drip campaign.", status: "review", priority: "high", assignee: "Eve", dueDate: daysFromNow(1), startDate: daysFromNow(-3), tags: ["copy", "email"], subtasks: [], dependencies: [], dependents: [], attachments: [], approvalRequired: true, approver: "Eve", approvalStatus: "pending", approvalComment: null, approvalRequestedAt: hoursAgo(2), createdAt: daysFromNow(-5), updatedAt: now(), completedAt: null, order: 0 },
];

// Team members – modeled after the beverage activation scenario
const seedTeamMembers: TeamMember[] = [
  // proj-2: Valentine's Champagne Activation
  { id: "tm-1", projectId: "proj-2", name: "Carol Distributor", email: "carol@distributor.com", role: "owner", avatar: null, invitedBy: null, joinedAt: daysFromNow(-7), lastLoginAt: hoursAgo(1), status: "active" },
  { id: "tm-2", projectId: "proj-2", name: "Jake Brand Manager", email: "jake@brandx.com", role: "manager", avatar: null, invitedBy: "tm-1", joinedAt: daysFromNow(-6), lastLoginAt: hoursAgo(3), status: "active" },
  { id: "tm-3", projectId: "proj-2", name: "Sophie Restaurant Mgr", email: "sophie@restauranty.com", role: "manager", avatar: null, invitedBy: "tm-1", joinedAt: daysFromNow(-5), lastLoginAt: hoursAgo(12), status: "active" },
  { id: "tm-4", projectId: "proj-2", name: "Maria Designer", email: "maria@printshop.com", role: "contributor", avatar: null, invitedBy: "tm-2", joinedAt: daysFromNow(-3), lastLoginAt: hoursAgo(24), status: "active" },
  { id: "tm-5", projectId: "proj-2", name: "Chef Laurent", email: "laurent@restauranty.com", role: "contributor", avatar: null, invitedBy: "tm-3", joinedAt: daysFromNow(-2), lastLoginAt: hoursAgo(48), status: "active" },
  { id: "tm-6", projectId: "proj-2", name: "PhotoPro Studios", email: "info@photopro.com", role: "contributor", avatar: null, invitedBy: "tm-2", joinedAt: daysFromNow(-1), lastLoginAt: daysFromNow(-1), status: "invited" },
  { id: "tm-7", projectId: "proj-2", name: "Bloom & Petal Events", email: "events@bloompetal.com", role: "viewer", avatar: null, invitedBy: "tm-2", joinedAt: now(), lastLoginAt: now(), status: "invited" },
  // proj-1: Software project
  { id: "tm-8", projectId: "proj-1", name: "Alice Chen", email: "alice@team.com", role: "owner", avatar: null, invitedBy: null, joinedAt: daysFromNow(-14), lastLoginAt: hoursAgo(0.5), status: "active" },
  { id: "tm-9", projectId: "proj-1", name: "Bob Park", email: "bob@team.com", role: "contributor", avatar: null, invitedBy: "tm-8", joinedAt: daysFromNow(-14), lastLoginAt: hoursAgo(2), status: "active" },
  // proj-3
  { id: "tm-10", projectId: "proj-3", name: "Eve Marketing", email: "eve@marketing.com", role: "owner", avatar: null, invitedBy: null, joinedAt: daysFromNow(-3), lastLoginAt: hoursAgo(4), status: "active" },
];

const seedActivityLog: ActivityLogEntry[] = [
  { id: "al-1", projectId: "proj-2", memberId: "tm-1", memberName: "Carol Distributor", action: "created project", target: "Valentine's Champagne Activation", timestamp: daysFromNow(-7) },
  { id: "al-2", projectId: "proj-2", memberId: "tm-1", memberName: "Carol Distributor", action: "invited", target: "Jake Brand Manager", timestamp: daysFromNow(-6) },
  { id: "al-3", projectId: "proj-2", memberId: "tm-1", memberName: "Carol Distributor", action: "invited", target: "Sophie Restaurant Mgr", timestamp: daysFromNow(-5) },
  { id: "al-4", projectId: "proj-2", memberId: "tm-2", memberName: "Jake Brand Manager", action: "invited", target: "Maria Designer", timestamp: daysFromNow(-3) },
  { id: "al-5", projectId: "proj-2", memberId: "tm-3", memberName: "Sophie Restaurant Mgr", action: "invited", target: "Chef Laurent", timestamp: daysFromNow(-2) },
  { id: "al-6", projectId: "proj-2", memberId: "tm-5", memberName: "Chef Laurent", action: "uploaded file", target: "champagne-pairing-menu-v1.pdf", timestamp: daysFromNow(-1) },
  { id: "al-7", projectId: "proj-2", memberId: "tm-1", memberName: "Carol Distributor", action: "completed subtask", target: "Get quotes from Restaurant Y", timestamp: hoursAgo(6) },
  { id: "al-8", projectId: "proj-2", memberId: "tm-4", memberName: "Maria Designer", action: "uploaded file", target: "valentines-pos-draft.png", timestamp: hoursAgo(4) },
  { id: "al-9", projectId: "proj-2", memberId: "tm-2", memberName: "Jake Brand Manager", action: "sent message", target: "#general", timestamp: hoursAgo(2) },
];

// Chat channels & messages
const seedChannels: ChatChannel[] = [
  { id: "ch-1", projectId: "proj-2", name: "general", description: "General project discussion", createdBy: "tm-1", createdAt: daysFromNow(-7), isDefault: true },
  { id: "ch-2", projectId: "proj-2", name: "menu-edits", description: "Menu design and content discussion", createdBy: "tm-3", createdAt: daysFromNow(-3), isDefault: false },
  { id: "ch-3", projectId: "proj-2", name: "print-proofs", description: "Print material reviews and approvals", createdBy: "tm-2", createdAt: daysFromNow(-2), isDefault: false },
  { id: "ch-4", projectId: "proj-1", name: "general", description: "General project discussion", createdBy: "tm-8", createdAt: daysFromNow(-14), isDefault: true },
  { id: "ch-5", projectId: "proj-3", name: "general", description: "General project discussion", createdBy: "tm-10", createdAt: daysFromNow(-3), isDefault: true },
];

const seedMessages: ChatMessage[] = [
  { id: "msg-1", channelId: "ch-1", projectId: "proj-2", senderId: "tm-1", senderName: "Carol Distributor", content: "Welcome everyone! Let's make this Valentine's activation incredible. Key dates pinned in milestones.", threadId: null, mentions: [], timestamp: daysFromNow(-7), edited: false },
  { id: "msg-2", channelId: "ch-1", projectId: "proj-2", senderId: "tm-2", senderName: "Jake Brand Manager", content: "Thanks Carol! I've invited Maria from the print shop for the POS displays. @Sophie Restaurant Mgr can you get Chef Laurent onboard for the menu?", threadId: null, mentions: ["tm-3"], timestamp: daysFromNow(-6), edited: false },
  { id: "msg-3", channelId: "ch-1", projectId: "proj-2", senderId: "tm-3", senderName: "Sophie Restaurant Mgr", content: "Done! Chef Laurent is now on the project. He'll upload the champagne pairing menu by end of week.", threadId: "msg-2", mentions: [], timestamp: daysFromNow(-5), edited: false },
  { id: "msg-4", channelId: "ch-2", projectId: "proj-2", senderId: "tm-5", senderName: "Chef Laurent", content: "I've uploaded the first draft of the champagne pairing menu. Three courses with bubbly pairings. Please review!", threadId: null, mentions: [], timestamp: daysFromNow(-1), edited: false },
  { id: "msg-5", channelId: "ch-2", projectId: "proj-2", senderId: "tm-3", senderName: "Sophie Restaurant Mgr", content: "Looks beautiful, Chef! Can we swap the dessert from crème brûlée to chocolate fondant? Pairs better with the rosé.", threadId: "msg-4", mentions: [], timestamp: hoursAgo(20), edited: false },
  { id: "msg-6", channelId: "ch-1", projectId: "proj-2", senderId: "tm-2", senderName: "Jake Brand Manager", content: "Quick update — photographer and flower wall company have been invited. @Carol Distributor we're on track!", threadId: null, mentions: ["tm-1"], timestamp: hoursAgo(2), edited: false },
  { id: "msg-7", channelId: "ch-3", projectId: "proj-2", senderId: "tm-4", senderName: "Maria Designer", content: "First draft of the Valentine's POS display is uploaded to Files. Let me know if the Brand X logo placement works.", threadId: null, mentions: [], timestamp: hoursAgo(4), edited: false },
];

const seedEvents: CalendarEvent[] = [
  { id: "evt-1", projectId: "proj-2", taskId: null, title: "Valentine's Champagne Event", description: "Flagship tasting event at Restaurant Y", start: daysFromNow(14), end: daysFromNow(14), allDay: false, color: "#f59e0b", type: "event" },
  { id: "evt-2", projectId: "proj-1", taskId: "task-1", title: "Design Review Meeting", description: "Review navigation mockups", start: daysFromNow(2), end: daysFromNow(2), allDay: false, color: "#6366f1", type: "meeting" },
  { id: "evt-3", projectId: "proj-1", taskId: null, title: "Sprint Demo", description: "End of sprint demo", start: daysFromNow(7), end: daysFromNow(7), allDay: false, color: "#6366f1", type: "milestone" },
  { id: "evt-4", projectId: "proj-3", taskId: null, title: "Campaign Go-Live", description: "Q1 campaign launches", start: daysFromNow(10), end: daysFromNow(10), allDay: true, color: "#ec4899", type: "milestone" },
];

const seedNotifications: Notification[] = [
  { id: "notif-1", title: "Task assigned", message: "You have been assigned 'Design new navigation flow'", type: "info", channel: ["screen"], read: false, actionUrl: "/tasks", projectId: "proj-1", taskId: "task-1", createdAt: daysFromNow(-1) },
  { id: "notif-2", title: "Deadline approaching", message: "'Book venue for champagne tasting' is due in 2 days", type: "warning", channel: ["screen", "email"], read: false, actionUrl: "/tasks", projectId: "proj-2", taskId: "task-5", createdAt: now() },
  { id: "notif-3", title: "Task completed", message: "'Write unit tests for auth module' has been completed", type: "success", channel: ["screen"], read: true, actionUrl: "/tasks", projectId: "proj-1", taskId: "task-4", createdAt: daysFromNow(-1) },
  { id: "notif-4", title: "New team member", message: "Maria Designer joined Valentine's Champagne Activation", type: "info", channel: ["screen"], read: false, actionUrl: "/projects/proj-2", projectId: "proj-2", taskId: null, createdAt: daysFromNow(-3) },
];

// ============================================================
// ACTIVATION SEED DATA
// ============================================================

const seedActivations: Activation[] = [
  {
    id: "act-1", name: "Valentine's Champagne Tasting", brand: "Brand X Champagne",
    description: "Brand X sponsoring a Valentine's champagne tasting at Restaurant Y — tastings, POS displays, photographer, flower wall.",
    color: "#f59e0b", icon: "Wine", phase: "pre_event", status: "confirmed",
    eventDate: daysFromNow(14), eventEndDate: null, setupDate: daysFromNow(13), teardownDate: daysFromNow(15),
    venueId: "venue-1", budgetTotal: 1500000, budgetSpent: 425000,
    leadGoal: 150, sampleGoal: 300, interactionGoal: 500,
    tags: ["champagne", "valentines", "restaurant"], createdAt: daysFromNow(-7), updatedAt: now(), createdBy: "you",
  },
  {
    id: "act-2", name: "T-Mobile Summer Splash", brand: "T-Mobile",
    description: "T-Mobile branded beach activation at Sunset Beach Bar with phone charging stations, music, and giveaways.",
    color: "#e91e8b", icon: "Smartphone", phase: "planning", status: "draft",
    eventDate: daysFromNow(60), eventEndDate: daysFromNow(61), setupDate: daysFromNow(59), teardownDate: daysFromNow(62),
    venueId: null, budgetTotal: 5000000, budgetSpent: 0,
    leadGoal: 500, sampleGoal: 1000, interactionGoal: 2000,
    tags: ["tech", "summer", "beach"], createdAt: daysFromNow(-2), updatedAt: now(), createdBy: "you",
  },
];

const seedActivationVenues: ActivationVenue[] = [
  {
    id: "venue-1", activationId: "act-1", name: "Restaurant Y", address: "425 Ocean Drive",
    city: "Miami Beach", state: "FL", zip: "33139",
    contactName: "Sophie Martinez", contactEmail: "sophie@restauranty.com", contactPhone: "(305) 555-0142",
    venueType: "restaurant", capacity: 120, status: "booked",
    walkthroughDate: daysFromNow(-3), walkthroughNotes: "Main dining room fits 80 guests. Patio for 40. Bar area ideal for tasting station. Power outlets near entrance for POS displays. Flower wall goes against east wall.",
    bookingConfirmedAt: daysFromNow(-2), bookingCost: 250000,
    specialRequirements: "Liquor license covers champagne service. Need to confirm insurance by next week. Valet parking available.",
    createdAt: daysFromNow(-5), updatedAt: now(),
  },
];

const seedActivationStakeholders: ActivationStakeholder[] = [
  { id: "stk-1", activationId: "act-1", name: "Jake Rivera", email: "jake@brandxchampagne.com", phone: "(212) 555-0198", company: "Brand X Champagne", type: "brand", role: "Brand Manager", avatar: null, ndaStatus: "signed", ndaDocumentId: "doc-1", canViewBudget: true, canViewLeads: true, canViewAllDocuments: false, notes: "Primary contact for Brand X. Approves all creative.", invitedAt: daysFromNow(-6), status: "active", createdAt: daysFromNow(-6) },
  { id: "stk-2", activationId: "act-1", name: "Carol Washington", email: "carol@distributor.com", phone: "(305) 555-0177", company: "SunCoast Distributors", type: "distributor", role: "Account Manager", avatar: null, ndaStatus: "signed", ndaDocumentId: "doc-2", canViewBudget: true, canViewLeads: false, canViewAllDocuments: false, notes: "Handles product shipment and inventory.", invitedAt: daysFromNow(-7), status: "active", createdAt: daysFromNow(-7) },
  { id: "stk-3", activationId: "act-1", name: "Sophie Martinez", email: "sophie@restauranty.com", phone: "(305) 555-0142", company: "Restaurant Y", type: "venue", role: "General Manager", avatar: null, ndaStatus: "pending", ndaDocumentId: "doc-3", canViewBudget: false, canViewLeads: false, canViewAllDocuments: false, notes: "Venue contact. Coordinates with Chef Laurent.", invitedAt: daysFromNow(-5), status: "active", createdAt: daysFromNow(-5) },
  { id: "stk-4", activationId: "act-1", name: "Maria Gonzalez", email: "maria@printshop.com", phone: "(305) 555-0133", company: "PrintCraft Studios", type: "vendor", role: "Design Lead", avatar: null, ndaStatus: "not_required", ndaDocumentId: null, canViewBudget: false, canViewLeads: false, canViewAllDocuments: false, notes: "Handles POS displays and table tents.", invitedAt: daysFromNow(-3), status: "active", createdAt: daysFromNow(-3) },
  { id: "stk-5", activationId: "act-1", name: "Lena Voss", email: "lena@luminousagency.com", phone: "(786) 555-0109", company: "Luminous Agency", type: "marketing_agency", role: "Campaign Lead", avatar: null, ndaStatus: "signed", ndaDocumentId: "doc-4", canViewBudget: false, canViewLeads: true, canViewAllDocuments: false, notes: "Manages influencer outreach and social strategy.", invitedAt: daysFromNow(-4), status: "active", createdAt: daysFromNow(-4) },
  { id: "stk-6", activationId: "act-1", name: "PhotoPro Studios", email: "info@photopro.com", phone: "(305) 555-0188", company: "PhotoPro Studios", type: "vendor", role: "Photographer", avatar: null, ndaStatus: "not_required", ndaDocumentId: null, canViewBudget: false, canViewLeads: false, canViewAllDocuments: false, notes: "Event photography and videography.", invitedAt: daysFromNow(-1), status: "invited", createdAt: daysFromNow(-1) },
  { id: "stk-7", activationId: "act-1", name: "Bloom & Petal Events", email: "events@bloompetal.com", phone: "(305) 555-0155", company: "Bloom & Petal Events", type: "vendor", role: "Floral/Decor", avatar: null, ndaStatus: "not_required", ndaDocumentId: null, canViewBudget: false, canViewLeads: false, canViewAllDocuments: false, notes: "Flower wall installation.", invitedAt: now(), status: "invited", createdAt: now() },
  // act-2 stakeholders
  { id: "stk-8", activationId: "act-2", name: "Marcus Johnson", email: "marcus@tmobile.com", phone: "(425) 555-0201", company: "T-Mobile", type: "brand", role: "Regional Marketing Director", avatar: null, ndaStatus: "not_required", ndaDocumentId: null, canViewBudget: true, canViewLeads: true, canViewAllDocuments: true, notes: "Executive sponsor for Summer Splash.", invitedAt: daysFromNow(-2), status: "active", createdAt: daysFromNow(-2) },
];

const seedActivationProducts: ActivationProduct[] = [
  { id: "prod-1", activationId: "act-1", name: "Brand X Brut Champagne 750ml", sku: "BX-BRUT-750", category: "beverage", quantityRequested: 120, quantityConfirmed: 120, quantityShipped: 120, quantityDelivered: 0, quantityUsed: 0, quantityReturned: 0, quantityDamaged: 0, unitCost: 2800, status: "shipped", shippingTrackingNumber: "1Z999AA10123456784", shippingCarrier: "UPS", expectedDeliveryDate: daysFromNow(10), deliveredAt: null, reconciledAt: null, reconciledBy: null, notes: "Main tasting product", createdAt: daysFromNow(-5), updatedAt: now() },
  { id: "prod-2", activationId: "act-1", name: "Brand X Rosé Champagne 750ml", sku: "BX-ROSE-750", category: "beverage", quantityRequested: 60, quantityConfirmed: 60, quantityShipped: 0, quantityDelivered: 0, quantityUsed: 0, quantityReturned: 0, quantityDamaged: 0, unitCost: 3200, status: "confirmed", shippingTrackingNumber: "", shippingCarrier: "", expectedDeliveryDate: daysFromNow(11), deliveredAt: null, reconciledAt: null, reconciledBy: null, notes: "For rosé pairing course", createdAt: daysFromNow(-5), updatedAt: now() },
  { id: "prod-3", activationId: "act-1", name: "Branded Champagne Flutes", sku: "BX-FLUTE-SET", category: "merchandise", quantityRequested: 200, quantityConfirmed: 200, quantityShipped: 200, quantityDelivered: 200, quantityUsed: 0, quantityReturned: 0, quantityDamaged: 0, unitCost: 450, status: "delivered", shippingTrackingNumber: "1Z999BB20123456785", shippingCarrier: "UPS", expectedDeliveryDate: daysFromNow(-1), deliveredAt: daysFromNow(-1), reconciledAt: null, reconciledBy: null, notes: "Guest takeaway. Stored at venue.", createdAt: daysFromNow(-5), updatedAt: now() },
  { id: "prod-4", activationId: "act-1", name: "Brand X Table Tent Cards", sku: "BX-TENT-50", category: "display", quantityRequested: 50, quantityConfirmed: 0, quantityShipped: 0, quantityDelivered: 0, quantityUsed: 0, quantityReturned: 0, quantityDamaged: 0, unitCost: 150, status: "requested", shippingTrackingNumber: "", shippingCarrier: "", expectedDeliveryDate: null, deliveredAt: null, reconciledAt: null, reconciledBy: null, notes: "Awaiting design approval from Jake", createdAt: daysFromNow(-3), updatedAt: now() },
];

const seedActivationPersonnel: ActivationPersonnel[] = [
  { id: "pers-1", activationId: "act-1", stakeholderId: null, name: "Daniela Cruz", email: "daniela@brandambassadors.com", phone: "(305) 555-0166", role: "Lead Brand Ambassador", clockStatus: "not_started", clockInTime: null, clockOutTime: null, breakStartTime: null, totalHoursWorked: null, hourlyRate: 3500, productKnowledgeVerified: true, productKnowledgeVerifiedAt: daysFromNow(-2), productKnowledgeScore: 95, notes: "Experienced with champagne activations.", createdAt: daysFromNow(-4) },
  { id: "pers-2", activationId: "act-1", stakeholderId: null, name: "Ryan Okafor", email: "ryan@brandambassadors.com", phone: "(305) 555-0178", role: "Brand Ambassador", clockStatus: "not_started", clockInTime: null, clockOutTime: null, breakStartTime: null, totalHoursWorked: null, hourlyRate: 2500, productKnowledgeVerified: false, productKnowledgeVerifiedAt: null, productKnowledgeScore: null, notes: "First champagne event. Needs product training.", createdAt: daysFromNow(-4) },
  { id: "pers-3", activationId: "act-1", stakeholderId: "stk-6", name: "PhotoPro Studios", email: "info@photopro.com", phone: "(305) 555-0188", role: "Photographer", clockStatus: "not_started", clockInTime: null, clockOutTime: null, breakStartTime: null, totalHoursWorked: null, hourlyRate: 7500, productKnowledgeVerified: false, productKnowledgeVerifiedAt: null, productKnowledgeScore: null, notes: "Covering full event. Deliverables: 200+ edited photos, 2 social reels.", createdAt: daysFromNow(-1) },
];

const seedActivationLeads: ActivationLeadCapture[] = [];

const seedActivationBudgetItems: ActivationBudgetItem[] = [
  { id: "budget-1", activationId: "act-1", category: "venue", description: "Restaurant Y venue rental (4 hours)", vendor: "Restaurant Y", estimatedAmount: 250000, actualAmount: 250000, status: "paid", approvedBy: "stk-1", approvedAt: daysFromNow(-2), receiptUrl: "", notes: "Deposit paid. Balance due event day.", createdAt: daysFromNow(-5), updatedAt: now() },
  { id: "budget-2", activationId: "act-1", category: "product", description: "Brand X Brut Champagne (120 bottles)", vendor: "SunCoast Distributors", estimatedAmount: 336000, actualAmount: null, status: "approved", approvedBy: "stk-1", approvedAt: daysFromNow(-4), receiptUrl: "", notes: "At-cost pricing through distributor.", createdAt: daysFromNow(-5), updatedAt: now() },
  { id: "budget-3", activationId: "act-1", category: "product", description: "Brand X Rosé Champagne (60 bottles)", vendor: "SunCoast Distributors", estimatedAmount: 192000, actualAmount: null, status: "approved", approvedBy: "stk-1", approvedAt: daysFromNow(-4), receiptUrl: "", notes: "", createdAt: daysFromNow(-5), updatedAt: now() },
  { id: "budget-4", activationId: "act-1", category: "materials", description: "Branded champagne flutes (200 units)", vendor: "PrintCraft Studios", estimatedAmount: 90000, actualAmount: 90000, status: "paid", approvedBy: "stk-2", approvedAt: daysFromNow(-4), receiptUrl: "", notes: "Delivered to venue.", createdAt: daysFromNow(-5), updatedAt: now() },
  { id: "budget-5", activationId: "act-1", category: "photography", description: "Event photography & videography", vendor: "PhotoPro Studios", estimatedAmount: 150000, actualAmount: null, status: "pending_approval", approvedBy: null, approvedAt: null, receiptUrl: "", notes: "Full event coverage + 2 social reels.", createdAt: daysFromNow(-1), updatedAt: now() },
  { id: "budget-6", activationId: "act-1", category: "decor", description: "Flower wall installation", vendor: "Bloom & Petal Events", estimatedAmount: 85000, actualAmount: null, status: "estimated", approvedBy: null, approvedAt: null, receiptUrl: "", notes: "Awaiting final quote.", createdAt: now(), updatedAt: now() },
  { id: "budget-7", activationId: "act-1", category: "staffing", description: "Brand ambassadors (2 staff x 6 hours)", vendor: "Brand Ambassadors Inc.", estimatedAmount: 42000, actualAmount: null, status: "approved", approvedBy: "stk-2", approvedAt: daysFromNow(-3), receiptUrl: "", notes: "Lead: $35/hr, Support: $25/hr.", createdAt: daysFromNow(-4), updatedAt: now() },
  { id: "budget-8", activationId: "act-1", category: "marketing", description: "Influencer partnerships (5 micro-influencers)", vendor: "Luminous Agency", estimatedAmount: 125000, actualAmount: null, status: "pending_approval", approvedBy: null, approvedAt: null, receiptUrl: "", notes: "5 local food/lifestyle influencers, $500 each.", createdAt: daysFromNow(-2), updatedAt: now() },
  { id: "budget-9", activationId: "act-1", category: "materials", description: "Table tent cards (50 units)", vendor: "PrintCraft Studios", estimatedAmount: 7500, actualAmount: null, status: "estimated", approvedBy: null, approvedAt: null, receiptUrl: "", notes: "Pending design approval.", createdAt: daysFromNow(-3), updatedAt: now() },
  { id: "budget-10", activationId: "act-1", category: "permits", description: "Special event liquor permit", vendor: "Miami-Dade County", estimatedAmount: 15000, actualAmount: 15000, status: "paid", approvedBy: "stk-3", approvedAt: daysFromNow(-3), receiptUrl: "", notes: "Filed and approved.", createdAt: daysFromNow(-5), updatedAt: now() },
];

const seedActivationDocuments: ActivationDocument[] = [
  {
    id: "doc-1", activationId: "act-1", type: "nda", title: "NDA — Jake Rivera (Brand X)",
    content: "NON-DISCLOSURE AGREEMENT\n\nThis Non-Disclosure Agreement (\"Agreement\") is entered into as of the date of electronic signature below.\n\nBETWEEN: ThirstMetrics LLC (\"Disclosing Party\")\nAND: Jake Rivera, Brand X Champagne (\"Receiving Party\")\n\n1. CONFIDENTIAL INFORMATION. The Receiving Party agrees to hold in confidence all proprietary information related to the Valentine's Champagne Tasting activation, including but not limited to: budget details, vendor contracts, lead capture data, marketing strategies, and internal communications.\n\n2. TERM. This Agreement shall remain in effect for a period of two (2) years from the date of signing.\n\n3. PERMITTED USE. The Receiving Party may use Confidential Information solely for the purpose of fulfilling their role in the activation.\n\n4. RETURN OF MATERIALS. Upon completion of the activation or upon request, the Receiving Party shall return or destroy all Confidential Information.\n\n5. GOVERNING LAW. This Agreement shall be governed by the laws of the State of Florida.",
    fileName: "NDA-Jake-Rivera-BrandX.pdf", fileUrl: "", fileSize: 45000,
    scopedToStakeholderId: "stk-1", visibleToStakeholderIds: [],
    signStatus: "signed", signedBy: "stk-1", signedAt: daysFromNow(-5), signatureData: null,
    signerName: "Jake Rivera", signerEmail: "jake@brandxchampagne.com",
    expiresAt: daysFromNow(730), createdAt: daysFromNow(-6), updatedAt: daysFromNow(-5),
  },
  {
    id: "doc-2", activationId: "act-1", type: "nda", title: "NDA — Carol Washington (SunCoast Distributors)",
    content: "NON-DISCLOSURE AGREEMENT\n\nThis Non-Disclosure Agreement (\"Agreement\") is entered into as of the date of electronic signature below.\n\nBETWEEN: ThirstMetrics LLC (\"Disclosing Party\")\nAND: Carol Washington, SunCoast Distributors (\"Receiving Party\")\n\n1. CONFIDENTIAL INFORMATION. The Receiving Party agrees to hold in confidence all proprietary information related to the Valentine's Champagne Tasting activation, including but not limited to: budget details, vendor contracts, lead capture data, marketing strategies, and internal communications.\n\n2. TERM. This Agreement shall remain in effect for a period of two (2) years from the date of signing.\n\n3. PERMITTED USE. The Receiving Party may use Confidential Information solely for the purpose of fulfilling their role in the activation.\n\n4. RETURN OF MATERIALS. Upon completion of the activation or upon request, the Receiving Party shall return or destroy all Confidential Information.\n\n5. GOVERNING LAW. This Agreement shall be governed by the laws of the State of Florida.",
    fileName: "NDA-Carol-Washington-SunCoast.pdf", fileUrl: "", fileSize: 45000,
    scopedToStakeholderId: "stk-2", visibleToStakeholderIds: [],
    signStatus: "signed", signedBy: "stk-2", signedAt: daysFromNow(-6), signatureData: null,
    signerName: "Carol Washington", signerEmail: "carol@distributor.com",
    expiresAt: daysFromNow(730), createdAt: daysFromNow(-7), updatedAt: daysFromNow(-6),
  },
  {
    id: "doc-3", activationId: "act-1", type: "nda", title: "NDA — Sophie Martinez (Restaurant Y)",
    content: "NON-DISCLOSURE AGREEMENT\n\nThis Non-Disclosure Agreement (\"Agreement\") is entered into as of the date of electronic signature below.\n\nBETWEEN: ThirstMetrics LLC (\"Disclosing Party\")\nAND: Sophie Martinez, Restaurant Y (\"Receiving Party\")\n\n1. CONFIDENTIAL INFORMATION. The Receiving Party agrees to hold in confidence all proprietary information related to the Valentine's Champagne Tasting activation, including but not limited to: budget details, vendor contracts, lead capture data, marketing strategies, and internal communications.\n\n2. TERM. This Agreement shall remain in effect for a period of two (2) years from the date of signing.\n\n3. PERMITTED USE. The Receiving Party may use Confidential Information solely for the purpose of fulfilling their role in the activation.\n\n4. RETURN OF MATERIALS. Upon completion of the activation or upon request, the Receiving Party shall return or destroy all Confidential Information.\n\n5. GOVERNING LAW. This Agreement shall be governed by the laws of the State of Florida.",
    fileName: "NDA-Sophie-Martinez-RestaurantY.pdf", fileUrl: "", fileSize: 45000,
    scopedToStakeholderId: "stk-3", visibleToStakeholderIds: [],
    signStatus: "pending_signature", signedBy: null, signedAt: null, signatureData: null,
    signerName: null, signerEmail: null,
    expiresAt: daysFromNow(730), createdAt: daysFromNow(-5), updatedAt: now(),
  },
  {
    id: "doc-4", activationId: "act-1", type: "nda", title: "NDA — Lena Voss (Luminous Agency)",
    content: "NON-DISCLOSURE AGREEMENT\n\nThis Non-Disclosure Agreement (\"Agreement\") is entered into as of the date of electronic signature below.\n\nBETWEEN: ThirstMetrics LLC (\"Disclosing Party\")\nAND: Lena Voss, Luminous Agency (\"Receiving Party\")\n\n1. CONFIDENTIAL INFORMATION. The Receiving Party agrees to hold in confidence all proprietary information related to the Valentine's Champagne Tasting activation, including but not limited to: budget details, vendor contracts, lead capture data, marketing strategies, and internal communications.\n\n2. TERM. This Agreement shall remain in effect for a period of two (2) years from the date of signing.\n\n3. PERMITTED USE. The Receiving Party may use Confidential Information solely for the purpose of fulfilling their role in the activation.\n\n4. RETURN OF MATERIALS. Upon completion of the activation or upon request, the Receiving Party shall return or destroy all Confidential Information.\n\n5. GOVERNING LAW. This Agreement shall be governed by the laws of the State of Florida.",
    fileName: "NDA-Lena-Voss-Luminous.pdf", fileUrl: "", fileSize: 45000,
    scopedToStakeholderId: "stk-5", visibleToStakeholderIds: [],
    signStatus: "signed", signedBy: "stk-5", signedAt: daysFromNow(-3), signatureData: null,
    signerName: "Lena Voss", signerEmail: "lena@luminousagency.com",
    expiresAt: daysFromNow(730), createdAt: daysFromNow(-4), updatedAt: daysFromNow(-3),
  },
  {
    id: "doc-5", activationId: "act-1", type: "permit", title: "Special Event Liquor Permit — Miami-Dade",
    content: "SPECIAL EVENT LIQUOR PERMIT\n\nPermit Number: SE-2026-04521\nIssued To: ThirstMetrics LLC\nVenue: Restaurant Y, 425 Ocean Drive, Miami Beach, FL 33139\nEvent Date: Valentine's Champagne Tasting\nPermit Valid: Event date only\n\nThis permit authorizes the service of champagne and sparkling wine at the above-described special event.",
    fileName: "liquor-permit-miami-dade.pdf", fileUrl: "", fileSize: 32000,
    scopedToStakeholderId: null, visibleToStakeholderIds: ["stk-1", "stk-2", "stk-3"],
    signStatus: "signed", signedBy: null, signedAt: daysFromNow(-3), signatureData: null,
    signerName: "Miami-Dade County Clerk", signerEmail: null,
    expiresAt: daysFromNow(15), createdAt: daysFromNow(-5), updatedAt: daysFromNow(-3),
  },
];

const seedActivationChecklists: ActivationChecklist[] = [
  // Compliance
  { id: "chk-1", activationId: "act-1", category: "compliance", title: "Liquor license verified", description: "Confirm venue has valid liquor license for champagne service", required: true, completed: true, completedBy: "Sophie Martinez", completedAt: daysFromNow(-4), dueDate: daysFromNow(-3), order: 0 },
  { id: "chk-2", activationId: "act-1", category: "compliance", title: "Special event permit filed", description: "File special event liquor permit with Miami-Dade County", required: true, completed: true, completedBy: "Carol Washington", completedAt: daysFromNow(-3), dueDate: daysFromNow(-2), order: 1 },
  { id: "chk-3", activationId: "act-1", category: "compliance", title: "Event insurance confirmed", description: "General liability insurance for activation event", required: true, completed: false, completedBy: null, completedAt: null, dueDate: daysFromNow(5), order: 2 },
  { id: "chk-4", activationId: "act-1", category: "compliance", title: "NDAs signed by all key stakeholders", description: "Brand, distributor, venue, and agency NDAs complete", required: true, completed: false, completedBy: null, completedAt: null, dueDate: daysFromNow(7), order: 3 },
  // Setup
  { id: "chk-5", activationId: "act-1", category: "setup", title: "POS displays installed", description: "Brand X point-of-sale displays set up at venue", required: true, completed: false, completedBy: null, completedAt: null, dueDate: daysFromNow(13), order: 0 },
  { id: "chk-6", activationId: "act-1", category: "setup", title: "Flower wall assembled", description: "Bloom & Petal flower wall installed at east wall", required: false, completed: false, completedBy: null, completedAt: null, dueDate: daysFromNow(13), order: 1 },
  { id: "chk-7", activationId: "act-1", category: "setup", title: "Champagne chilled and staged", description: "All bottles chilled to service temperature", required: true, completed: false, completedBy: null, completedAt: null, dueDate: daysFromNow(14), order: 2 },
  { id: "chk-8", activationId: "act-1", category: "setup", title: "Table tents placed", description: "Brand X table tent cards on all tables", required: true, completed: false, completedBy: null, completedAt: null, dueDate: daysFromNow(14), order: 3 },
  // Product knowledge
  { id: "chk-9", activationId: "act-1", category: "product_knowledge", title: "All ambassadors complete product training", description: "Staff must know Brand X history, tasting notes, food pairings, and pricing", required: true, completed: false, completedBy: null, completedAt: null, dueDate: daysFromNow(12), order: 0 },
  // Teardown
  { id: "chk-10", activationId: "act-1", category: "teardown", title: "Remaining inventory boxed", description: "Count and box all unused champagne and materials", required: true, completed: false, completedBy: null, completedAt: null, dueDate: daysFromNow(15), order: 0 },
  { id: "chk-11", activationId: "act-1", category: "teardown", title: "Venue restored to original state", description: "Remove all Brand X materials, flower wall, POS displays", required: true, completed: false, completedBy: null, completedAt: null, dueDate: daysFromNow(15), order: 1 },
];

const seedActivationIssues: ActivationIssue[] = [];
const seedActivationMedia: ActivationMediaItem[] = [];

const seedActivationRunOfShow: ActivationRunOfShow[] = [
  { id: "ros-1", activationId: "act-1", time: "10:00", endTime: "12:00", title: "Setup & staging", description: "POS display installation, flower wall setup, champagne staging", responsiblePersonnelId: "pers-1", responsibleName: "Daniela Cruz", completed: false, completedAt: null, order: 0 },
  { id: "ros-2", activationId: "act-1", time: "12:00", endTime: "13:00", title: "Final walkthrough", description: "Jake + Carol + Sophie inspect setup, verify branding, check inventory", responsiblePersonnelId: null, responsibleName: "Jake Rivera", completed: false, completedAt: null, order: 1 },
  { id: "ros-3", activationId: "act-1", time: "13:00", endTime: "13:30", title: "Staff briefing", description: "Product knowledge refresher, tasting station assignments, lead capture review", responsiblePersonnelId: "pers-1", responsibleName: "Daniela Cruz", completed: false, completedAt: null, order: 2 },
  { id: "ros-4", activationId: "act-1", time: "14:00", endTime: "18:00", title: "Activation live — guest service", description: "Champagne tastings, guided pairings, lead capture, photography", responsiblePersonnelId: "pers-1", responsibleName: "Daniela Cruz", completed: false, completedAt: null, order: 3 },
  { id: "ros-5", activationId: "act-1", time: "18:00", endTime: "19:00", title: "Teardown", description: "Pack remaining inventory, remove displays, restore venue", responsiblePersonnelId: "pers-1", responsibleName: "Daniela Cruz", completed: false, completedAt: null, order: 4 },
];

const seedActivationReports: ActivationReport[] = [];

const defaultPreferences: NotificationPreferences = {
  screen: true, email: true, sms: false, emailAddress: "", phoneNumber: "",
  taskAssigned: ["screen", "email"], taskCompleted: ["screen"], taskOverdue: ["screen", "email", "sms"],
  eventReminder: ["screen", "email"], fileUploaded: ["screen"], projectUpdate: ["screen"],
};

// ============================================================
// ZUSTAND STORE
// ============================================================

interface AppState {
  projects: Project[];
  tasks: Task[];
  milestones: Milestone[];
  events: CalendarEvent[];
  files: FileItem[];
  notifications: Notification[];
  notificationPreferences: NotificationPreferences;
  teamMembers: TeamMember[];
  activityLog: ActivityLogEntry[];
  chatChannels: ChatChannel[];
  chatMessages: ChatMessage[];

  // Activation state
  activations: Activation[];
  activationVenues: ActivationVenue[];
  activationStakeholders: ActivationStakeholder[];
  activationProducts: ActivationProduct[];
  activationPersonnel: ActivationPersonnel[];
  activationLeads: ActivationLeadCapture[];
  activationBudgetItems: ActivationBudgetItem[];
  activationDocuments: ActivationDocument[];
  activationChecklists: ActivationChecklist[];
  activationIssues: ActivationIssue[];
  activationMedia: ActivationMediaItem[];
  activationRunOfShow: ActivationRunOfShow[];
  activationReports: ActivationReport[];

  // Project actions
  addProject: (p: Omit<Project, "id" | "createdAt" | "updatedAt">) => string;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Milestone actions
  addMilestone: (m: Omit<Milestone, "id">) => string;
  toggleMilestone: (id: string) => void;
  deleteMilestone: (id: string) => void;

  // Task actions
  addTask: (t: Omit<Task, "id" | "createdAt" | "updatedAt" | "completedAt" | "order">) => string;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addDependency: (taskId: string, dependsOnId: string) => void;
  removeDependency: (taskId: string, dependsOnId: string) => void;

  // Approval actions
  requestApproval: (taskId: string, approver: string) => void;
  resolveApproval: (taskId: string, status: "approved" | "rejected", comment: string) => void;

  // Event actions
  addEvent: (e: Omit<CalendarEvent, "id">) => string;
  updateEvent: (id: string, data: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  // File actions
  addFile: (f: Omit<FileItem, "id" | "uploadedAt">) => string;
  deleteFile: (id: string) => void;

  // Team actions
  addTeamMember: (m: Omit<TeamMember, "id" | "joinedAt" | "lastLoginAt">) => string;
  updateTeamMember: (id: string, data: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;

  // Activity log
  logActivity: (entry: Omit<ActivityLogEntry, "id" | "timestamp">) => void;

  // Chat actions
  addChannel: (ch: Omit<ChatChannel, "id" | "createdAt">) => string;
  deleteChannel: (id: string) => void;
  sendMessage: (msg: Omit<ChatMessage, "id" | "timestamp" | "edited">) => string;
  editMessage: (id: string, content: string) => void;
  deleteMessage: (id: string) => void;

  // Notification actions
  addNotification: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;

  // Activation actions
  addActivation: (a: Omit<Activation, "id" | "createdAt" | "updatedAt">) => string;
  updateActivation: (id: string, data: Partial<Activation>) => void;
  deleteActivation: (id: string) => void;
  updateActivationPhase: (id: string, phase: ActivationPhase) => void;

  // Venue actions
  addVenue: (v: Omit<ActivationVenue, "id" | "createdAt" | "updatedAt">) => string;
  updateVenue: (id: string, data: Partial<ActivationVenue>) => void;
  deleteVenue: (id: string) => void;

  // Stakeholder actions
  addStakeholder: (s: Omit<ActivationStakeholder, "id" | "createdAt">) => string;
  updateStakeholder: (id: string, data: Partial<ActivationStakeholder>) => void;
  removeStakeholder: (id: string) => void;

  // Product actions
  addActivationProduct: (p: Omit<ActivationProduct, "id" | "createdAt" | "updatedAt">) => string;
  updateActivationProduct: (id: string, data: Partial<ActivationProduct>) => void;
  deleteActivationProduct: (id: string) => void;
  reconcileProduct: (id: string, used: number, returned: number, damaged: number, reconciledBy: string) => void;

  // Personnel actions
  addPersonnel: (p: Omit<ActivationPersonnel, "id" | "createdAt">) => string;
  updatePersonnel: (id: string, data: Partial<ActivationPersonnel>) => void;
  removePersonnel: (id: string) => void;
  clockIn: (id: string) => void;
  clockOut: (id: string) => void;
  startBreak: (id: string) => void;
  endBreak: (id: string) => void;
  verifyProductKnowledge: (id: string, score: number) => void;

  // Lead capture actions
  captureLead: (lead: Omit<ActivationLeadCapture, "id" | "capturedAt">) => string;
  updateLead: (id: string, data: Partial<ActivationLeadCapture>) => void;
  deleteLead: (id: string) => void;

  // Budget actions
  addBudgetItem: (b: Omit<ActivationBudgetItem, "id" | "createdAt" | "updatedAt">) => string;
  updateBudgetItem: (id: string, data: Partial<ActivationBudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;
  approveBudgetItem: (id: string, approvedBy: string) => void;
  rejectBudgetItem: (id: string) => void;

  // Document & e-sign actions
  addDocument: (d: Omit<ActivationDocument, "id" | "createdAt" | "updatedAt">) => string;
  updateDocument: (id: string, data: Partial<ActivationDocument>) => void;
  deleteDocument: (id: string) => void;
  signDocument: (id: string, signatureData: string, signerName: string, signerEmail: string) => void;

  // Checklist actions
  addChecklistItem: (c: Omit<ActivationChecklist, "id">) => string;
  toggleChecklistItem: (id: string, completedBy: string) => void;
  deleteChecklistItem: (id: string) => void;

  // Issue actions
  addIssue: (i: Omit<ActivationIssue, "id" | "createdAt" | "updatedAt">) => string;
  updateIssue: (id: string, data: Partial<ActivationIssue>) => void;
  escalateIssue: (id: string, escalatedTo: string) => void;
  resolveIssue: (id: string, resolution: string, resolvedBy: string) => void;

  // Media actions
  addMediaItem: (m: Omit<ActivationMediaItem, "id">) => string;
  updateMediaItem: (id: string, data: Partial<ActivationMediaItem>) => void;
  deleteMediaItem: (id: string) => void;
  approveMediaItem: (id: string, approvedBy: string) => void;

  // Run of Show actions
  addRunOfShowItem: (r: Omit<ActivationRunOfShow, "id">) => string;
  updateRunOfShowItem: (id: string, data: Partial<ActivationRunOfShow>) => void;
  deleteRunOfShowItem: (id: string) => void;
  completeRunOfShowItem: (id: string) => void;

  // Report actions
  generateReport: (activationId: string) => string;
}

export const useAppStore = create<AppState>((set, get) => ({
  projects: seedProjects,
  tasks: seedTasks,
  milestones: seedMilestones,
  events: seedEvents,
  files: [],
  notifications: seedNotifications,
  notificationPreferences: defaultPreferences,
  teamMembers: seedTeamMembers,
  activityLog: seedActivityLog,
  chatChannels: seedChannels,
  chatMessages: seedMessages,

  // ---------- Projects ----------
  addProject: (p) => {
    const id = `proj-${uuid().slice(0, 8)}`;
    set((s) => ({ projects: [...s.projects, { ...p, id, createdAt: now(), updatedAt: now() }] }));
    // Auto-create #general channel
    const chId = `ch-${uuid().slice(0, 8)}`;
    set((s) => ({ chatChannels: [...s.chatChannels, { id: chId, projectId: id, name: "general", description: "General project discussion", createdBy: "", createdAt: now(), isDefault: true }] }));
    return id;
  },
  updateProject: (id, data) => set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...data, updatedAt: now() } : p)) })),
  deleteProject: (id) => set((s) => ({
    projects: s.projects.filter((p) => p.id !== id),
    tasks: s.tasks.filter((t) => t.projectId !== id),
    events: s.events.filter((e) => e.projectId !== id),
    files: s.files.filter((f) => f.projectId !== id),
    milestones: s.milestones.filter((m) => m.projectId !== id),
    teamMembers: s.teamMembers.filter((m) => m.projectId !== id),
    chatChannels: s.chatChannels.filter((c) => c.projectId !== id),
    chatMessages: s.chatMessages.filter((m) => m.projectId !== id),
    activityLog: s.activityLog.filter((a) => a.projectId !== id),
  })),

  // ---------- Milestones ----------
  addMilestone: (m) => { const id = `ms-${uuid().slice(0, 8)}`; set((s) => ({ milestones: [...s.milestones, { ...m, id }] })); return id; },
  toggleMilestone: (id) => set((s) => ({ milestones: s.milestones.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m)) })),
  deleteMilestone: (id) => set((s) => ({ milestones: s.milestones.filter((m) => m.id !== id) })),

  // ---------- Tasks ----------
  addTask: (t) => { const id = `task-${uuid().slice(0, 8)}`; const order = get().tasks.filter((x) => x.projectId === t.projectId).length; set((s) => ({ tasks: [...s.tasks, { ...t, id, approvalRequired: t.approvalRequired ?? false, approver: t.approver ?? null, approvalStatus: "none", approvalComment: null, approvalRequestedAt: null, createdAt: now(), updatedAt: now(), completedAt: null, order }] })); return id; },
  updateTask: (id, data) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data, updatedAt: now() } : t)) })),
  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id).map((t) => ({ ...t, dependencies: t.dependencies.filter((d) => d !== id), dependents: t.dependents.filter((d) => d !== id) })) })),
  moveTask: (id, status) => { const completedAt = status === "done" ? now() : null; set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, status, completedAt, updatedAt: now() } : t)) })); },
  addSubtask: (taskId, title) => { const subtask: Subtask = { id: `st-${uuid().slice(0, 8)}`, title, completed: false }; set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, subtasks: [...t.subtasks, subtask], updatedAt: now() } : t)) })); },
  toggleSubtask: (taskId, subtaskId) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, subtasks: t.subtasks.map((st) => (st.id === subtaskId ? { ...st, completed: !st.completed } : st)), updatedAt: now() } : t)) })),
  addDependency: (taskId, dependsOnId) => set((s) => ({ tasks: s.tasks.map((t) => { if (t.id === taskId && !t.dependencies.includes(dependsOnId)) return { ...t, dependencies: [...t.dependencies, dependsOnId], updatedAt: now() }; if (t.id === dependsOnId && !t.dependents.includes(taskId)) return { ...t, dependents: [...t.dependents, taskId], updatedAt: now() }; return t; }) })),
  removeDependency: (taskId, dependsOnId) => set((s) => ({ tasks: s.tasks.map((t) => { if (t.id === taskId) return { ...t, dependencies: t.dependencies.filter((d) => d !== dependsOnId), updatedAt: now() }; if (t.id === dependsOnId) return { ...t, dependents: t.dependents.filter((d) => d !== taskId), updatedAt: now() }; return t; }) })),

  // ---------- Approvals ----------
  requestApproval: (taskId, approver) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, approvalRequired: true, approver, approvalStatus: "pending" as const, approvalRequestedAt: now(), updatedAt: now() } : t)),
    }));
    const task = get().tasks.find((t) => t.id === taskId);
    if (task) {
      get().addNotification({ title: "Approval requested", message: `"${task.title}" needs your approval`, type: "warning", channel: ["screen", "email"], actionUrl: `/tasks`, projectId: task.projectId, taskId });
    }
  },
  resolveApproval: (taskId, status, comment) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, approvalStatus: status, approvalComment: comment || null, updatedAt: now() } : t)),
    }));
    const task = get().tasks.find((t) => t.id === taskId);
    if (task) {
      get().addNotification({ title: status === "approved" ? "Task approved" : "Task rejected", message: `"${task.title}" was ${status}${comment ? `: ${comment}` : ""}`, type: status === "approved" ? "success" : "danger", channel: ["screen", "email"], actionUrl: `/tasks`, projectId: task.projectId, taskId });
    }
  },

  // ---------- Events ----------
  addEvent: (e) => { const id = `evt-${uuid().slice(0, 8)}`; set((s) => ({ events: [...s.events, { ...e, id }] })); return id; },
  updateEvent: (id, data) => set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...data } : e)) })),
  deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

  // ---------- Files ----------
  addFile: (f) => { const id = `file-${uuid().slice(0, 8)}`; set((s) => ({ files: [...s.files, { ...f, id, uploadedAt: now() }] })); return id; },
  deleteFile: (id) => set((s) => ({ files: s.files.filter((f) => f.id !== id) })),

  // ---------- Team ----------
  addTeamMember: (m) => { const id = `tm-${uuid().slice(0, 8)}`; set((s) => ({ teamMembers: [...s.teamMembers, { ...m, id, joinedAt: now(), lastLoginAt: now() }] })); return id; },
  updateTeamMember: (id, data) => set((s) => ({ teamMembers: s.teamMembers.map((m) => (m.id === id ? { ...m, ...data } : m)) })),
  removeTeamMember: (id) => set((s) => ({ teamMembers: s.teamMembers.filter((m) => m.id !== id) })),

  // ---------- Activity Log ----------
  logActivity: (entry) => { const id = `al-${uuid().slice(0, 8)}`; set((s) => ({ activityLog: [{ ...entry, id, timestamp: now() }, ...s.activityLog] })); },

  // ---------- Chat ----------
  addChannel: (ch) => { const id = `ch-${uuid().slice(0, 8)}`; set((s) => ({ chatChannels: [...s.chatChannels, { ...ch, id, createdAt: now() }] })); return id; },
  deleteChannel: (id) => set((s) => ({ chatChannels: s.chatChannels.filter((c) => c.id !== id), chatMessages: s.chatMessages.filter((m) => m.channelId !== id) })),
  sendMessage: (msg) => { const id = `msg-${uuid().slice(0, 8)}`; set((s) => ({ chatMessages: [...s.chatMessages, { ...msg, id, timestamp: now(), edited: false }] })); return id; },
  editMessage: (id, content) => set((s) => ({ chatMessages: s.chatMessages.map((m) => (m.id === id ? { ...m, content, edited: true } : m)) })),
  deleteMessage: (id) => set((s) => ({ chatMessages: s.chatMessages.filter((m) => m.id !== id) })),

  // ---------- Notifications ----------
  addNotification: (n) => { set((s) => ({ notifications: [{ ...n, id: `notif-${uuid().slice(0, 8)}`, read: false, createdAt: now() }, ...s.notifications] })); },
  markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  deleteNotification: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
  updateNotificationPreferences: (prefs) => set((s) => ({ notificationPreferences: { ...s.notificationPreferences, ...prefs } })),

  // ============================================================
  // ACTIVATION STATE & ACTIONS
  // ============================================================

  activations: seedActivations,
  activationVenues: seedActivationVenues,
  activationStakeholders: seedActivationStakeholders,
  activationProducts: seedActivationProducts,
  activationPersonnel: seedActivationPersonnel,
  activationLeads: seedActivationLeads,
  activationBudgetItems: seedActivationBudgetItems,
  activationDocuments: seedActivationDocuments,
  activationChecklists: seedActivationChecklists,
  activationIssues: seedActivationIssues,
  activationMedia: seedActivationMedia,
  activationRunOfShow: seedActivationRunOfShow,
  activationReports: seedActivationReports,

  // ---------- Activations ----------
  addActivation: (a) => {
    const id = `act-${uuid().slice(0, 8)}`;
    set((s) => ({ activations: [...s.activations, { ...a, id, createdAt: now(), updatedAt: now() }] }));
    // Auto-create #general chat channel for this activation
    const chId = `ch-${uuid().slice(0, 8)}`;
    set((s) => ({ chatChannels: [...s.chatChannels, { id: chId, projectId: id, name: "general", description: "General activation discussion", createdBy: "", createdAt: now(), isDefault: true }] }));
    return id;
  },
  updateActivation: (id, data) => set((s) => ({ activations: s.activations.map((a) => (a.id === id ? { ...a, ...data, updatedAt: now() } : a)) })),
  deleteActivation: (id) => set((s) => ({
    activations: s.activations.filter((a) => a.id !== id),
    activationVenues: s.activationVenues.filter((v) => v.activationId !== id),
    activationStakeholders: s.activationStakeholders.filter((st) => st.activationId !== id),
    activationProducts: s.activationProducts.filter((p) => p.activationId !== id),
    activationPersonnel: s.activationPersonnel.filter((p) => p.activationId !== id),
    activationLeads: s.activationLeads.filter((l) => l.activationId !== id),
    activationBudgetItems: s.activationBudgetItems.filter((b) => b.activationId !== id),
    activationDocuments: s.activationDocuments.filter((d) => d.activationId !== id),
    activationChecklists: s.activationChecklists.filter((c) => c.activationId !== id),
    activationIssues: s.activationIssues.filter((i) => i.activationId !== id),
    activationMedia: s.activationMedia.filter((m) => m.activationId !== id),
    activationRunOfShow: s.activationRunOfShow.filter((r) => r.activationId !== id),
    activationReports: s.activationReports.filter((r) => r.activationId !== id),
    chatChannels: s.chatChannels.filter((c) => c.projectId !== id),
    chatMessages: s.chatMessages.filter((m) => m.projectId !== id),
  })),
  updateActivationPhase: (id, phase) => {
    set((s) => ({ activations: s.activations.map((a) => (a.id === id ? { ...a, phase, updatedAt: now() } : a)) }));
    const activation = get().activations.find((a) => a.id === id);
    if (activation) {
      get().addNotification({ title: "Phase updated", message: `"${activation.name}" moved to ${phase.replace("_", " ")}`, type: "info", channel: ["screen"], actionUrl: `/activations/${id}`, projectId: null, taskId: null });
    }
  },

  // ---------- Venues ----------
  addVenue: (v) => { const id = `venue-${uuid().slice(0, 8)}`; set((s) => ({ activationVenues: [...s.activationVenues, { ...v, id, createdAt: now(), updatedAt: now() }] })); return id; },
  updateVenue: (id, data) => set((s) => ({ activationVenues: s.activationVenues.map((v) => (v.id === id ? { ...v, ...data, updatedAt: now() } : v)) })),
  deleteVenue: (id) => set((s) => ({ activationVenues: s.activationVenues.filter((v) => v.id !== id) })),

  // ---------- Stakeholders ----------
  addStakeholder: (s_) => { const id = `stk-${uuid().slice(0, 8)}`; set((s) => ({ activationStakeholders: [...s.activationStakeholders, { ...s_, id, createdAt: now() }] })); return id; },
  updateStakeholder: (id, data) => set((s) => ({ activationStakeholders: s.activationStakeholders.map((st) => (st.id === id ? { ...st, ...data } : st)) })),
  removeStakeholder: (id) => set((s) => ({ activationStakeholders: s.activationStakeholders.filter((st) => st.id !== id) })),

  // ---------- Products ----------
  addActivationProduct: (p) => { const id = `prod-${uuid().slice(0, 8)}`; set((s) => ({ activationProducts: [...s.activationProducts, { ...p, id, createdAt: now(), updatedAt: now() }] })); return id; },
  updateActivationProduct: (id, data) => set((s) => ({ activationProducts: s.activationProducts.map((p) => (p.id === id ? { ...p, ...data, updatedAt: now() } : p)) })),
  deleteActivationProduct: (id) => set((s) => ({ activationProducts: s.activationProducts.filter((p) => p.id !== id) })),
  reconcileProduct: (id, used, returned, damaged, reconciledBy) => set((s) => ({
    activationProducts: s.activationProducts.map((p) => (p.id === id ? { ...p, quantityUsed: used, quantityReturned: returned, quantityDamaged: damaged, reconciledBy, reconciledAt: now(), status: "reconciled" as const, updatedAt: now() } : p)),
  })),

  // ---------- Personnel ----------
  addPersonnel: (p) => { const id = `pers-${uuid().slice(0, 8)}`; set((s) => ({ activationPersonnel: [...s.activationPersonnel, { ...p, id, createdAt: now() }] })); return id; },
  updatePersonnel: (id, data) => set((s) => ({ activationPersonnel: s.activationPersonnel.map((p) => (p.id === id ? { ...p, ...data } : p)) })),
  removePersonnel: (id) => set((s) => ({ activationPersonnel: s.activationPersonnel.filter((p) => p.id !== id) })),
  clockIn: (id) => {
    set((s) => ({ activationPersonnel: s.activationPersonnel.map((p) => (p.id === id ? { ...p, clockStatus: "clocked_in" as const, clockInTime: now() } : p)) }));
    const person = get().activationPersonnel.find((p) => p.id === id);
    if (person) {
      get().addNotification({ title: "Personnel clocked in", message: `${person.name} clocked in as ${person.role}`, type: "info", channel: ["screen"], actionUrl: null, projectId: null, taskId: null });
    }
  },
  clockOut: (id) => {
    const person = get().activationPersonnel.find((p) => p.id === id);
    let totalHours: number | null = null;
    if (person?.clockInTime) {
      totalHours = Math.round(((Date.now() - new Date(person.clockInTime).getTime()) / (1000 * 60 * 60)) * 100) / 100;
    }
    set((s) => ({ activationPersonnel: s.activationPersonnel.map((p) => (p.id === id ? { ...p, clockStatus: "clocked_out" as const, clockOutTime: now(), totalHoursWorked: totalHours } : p)) }));
    if (person) {
      get().addNotification({ title: "Personnel clocked out", message: `${person.name} clocked out (${totalHours?.toFixed(1) ?? "?"} hours)`, type: "info", channel: ["screen"], actionUrl: null, projectId: null, taskId: null });
    }
  },
  startBreak: (id) => set((s) => ({ activationPersonnel: s.activationPersonnel.map((p) => (p.id === id ? { ...p, clockStatus: "on_break" as const, breakStartTime: now() } : p)) })),
  endBreak: (id) => set((s) => ({ activationPersonnel: s.activationPersonnel.map((p) => (p.id === id ? { ...p, clockStatus: "clocked_in" as const, breakStartTime: null } : p)) })),
  verifyProductKnowledge: (id, score) => set((s) => ({ activationPersonnel: s.activationPersonnel.map((p) => (p.id === id ? { ...p, productKnowledgeVerified: score >= 70, productKnowledgeVerifiedAt: now(), productKnowledgeScore: score } : p)) })),

  // ---------- Lead Capture ----------
  captureLead: (lead) => { const id = `lead-${uuid().slice(0, 8)}`; set((s) => ({ activationLeads: [...s.activationLeads, { ...lead, id, capturedAt: now() }] })); return id; },
  updateLead: (id, data) => set((s) => ({ activationLeads: s.activationLeads.map((l) => (l.id === id ? { ...l, ...data } : l)) })),
  deleteLead: (id) => set((s) => ({ activationLeads: s.activationLeads.filter((l) => l.id !== id) })),

  // ---------- Budget ----------
  addBudgetItem: (b) => {
    const id = `budget-${uuid().slice(0, 8)}`;
    set((s) => ({ activationBudgetItems: [...s.activationBudgetItems, { ...b, id, createdAt: now(), updatedAt: now() }] }));
    return id;
  },
  updateBudgetItem: (id, data) => set((s) => ({ activationBudgetItems: s.activationBudgetItems.map((b) => (b.id === id ? { ...b, ...data, updatedAt: now() } : b)) })),
  deleteBudgetItem: (id) => set((s) => ({ activationBudgetItems: s.activationBudgetItems.filter((b) => b.id !== id) })),
  approveBudgetItem: (id, approvedBy) => {
    set((s) => ({ activationBudgetItems: s.activationBudgetItems.map((b) => (b.id === id ? { ...b, status: "approved" as const, approvedBy, approvedAt: now(), updatedAt: now() } : b)) }));
    const item = get().activationBudgetItems.find((b) => b.id === id);
    if (item) {
      get().addNotification({ title: "Budget item approved", message: `"${item.description}" approved`, type: "success", channel: ["screen"], actionUrl: null, projectId: null, taskId: null });
    }
  },
  rejectBudgetItem: (id) => set((s) => ({ activationBudgetItems: s.activationBudgetItems.map((b) => (b.id === id ? { ...b, status: "rejected" as const, updatedAt: now() } : b)) })),

  // ---------- Documents & E-Sign ----------
  addDocument: (d) => { const id = `doc-${uuid().slice(0, 8)}`; set((s) => ({ activationDocuments: [...s.activationDocuments, { ...d, id, createdAt: now(), updatedAt: now() }] })); return id; },
  updateDocument: (id, data) => set((s) => ({ activationDocuments: s.activationDocuments.map((d) => (d.id === id ? { ...d, ...data, updatedAt: now() } : d)) })),
  deleteDocument: (id) => set((s) => ({ activationDocuments: s.activationDocuments.filter((d) => d.id !== id) })),
  signDocument: (id, signatureData, signerName, signerEmail) => {
    const doc = get().activationDocuments.find((d) => d.id === id);
    set((s) => ({
      activationDocuments: s.activationDocuments.map((d) => (d.id === id ? { ...d, signStatus: "signed" as const, signatureData, signedAt: now(), signerName, signerEmail, signedBy: d.scopedToStakeholderId, updatedAt: now() } : d)),
    }));
    // Update stakeholder NDA status
    if (doc?.scopedToStakeholderId) {
      set((s) => ({
        activationStakeholders: s.activationStakeholders.map((st) => (st.id === doc.scopedToStakeholderId ? { ...st, ndaStatus: "signed" as const } : st)),
      }));
    }
    get().addNotification({ title: "Document signed", message: `"${doc?.title ?? "Document"}" signed by ${signerName}`, type: "success", channel: ["screen", "email"], actionUrl: null, projectId: null, taskId: null });
  },

  // ---------- Checklists ----------
  addChecklistItem: (c) => { const id = `chk-${uuid().slice(0, 8)}`; set((s) => ({ activationChecklists: [...s.activationChecklists, { ...c, id }] })); return id; },
  toggleChecklistItem: (id, completedBy) => set((s) => ({
    activationChecklists: s.activationChecklists.map((c) => (c.id === id ? { ...c, completed: !c.completed, completedBy: !c.completed ? completedBy : null, completedAt: !c.completed ? now() : null } : c)),
  })),
  deleteChecklistItem: (id) => set((s) => ({ activationChecklists: s.activationChecklists.filter((c) => c.id !== id) })),

  // ---------- Issues ----------
  addIssue: (i) => { const id = `issue-${uuid().slice(0, 8)}`; set((s) => ({ activationIssues: [...s.activationIssues, { ...i, id, createdAt: now(), updatedAt: now() }] })); return id; },
  updateIssue: (id, data) => set((s) => ({ activationIssues: s.activationIssues.map((i) => (i.id === id ? { ...i, ...data, updatedAt: now() } : i)) })),
  escalateIssue: (id, escalatedTo) => {
    set((s) => ({ activationIssues: s.activationIssues.map((i) => (i.id === id ? { ...i, status: "escalated" as const, escalatedTo, updatedAt: now() } : i)) }));
    const issue = get().activationIssues.find((i) => i.id === id);
    if (issue) {
      get().addNotification({ title: "Issue escalated", message: `"${issue.title}" escalated to ${escalatedTo}`, type: "warning", channel: ["screen", "email"], actionUrl: null, projectId: null, taskId: null });
    }
  },
  resolveIssue: (id, resolution, resolvedBy) => set((s) => ({
    activationIssues: s.activationIssues.map((i) => (i.id === id ? { ...i, status: "resolved" as const, resolution, resolvedBy, resolvedAt: now(), updatedAt: now() } : i)),
  })),

  // ---------- Media ----------
  addMediaItem: (m) => { const id = `media-${uuid().slice(0, 8)}`; set((s) => ({ activationMedia: [...s.activationMedia, { ...m, id }] })); return id; },
  updateMediaItem: (id, data) => set((s) => ({ activationMedia: s.activationMedia.map((m) => (m.id === id ? { ...m, ...data } : m)) })),
  deleteMediaItem: (id) => set((s) => ({ activationMedia: s.activationMedia.filter((m) => m.id !== id) })),
  approveMediaItem: (id, approvedBy) => set((s) => ({ activationMedia: s.activationMedia.map((m) => (m.id === id ? { ...m, approved: true, approvedBy } : m)) })),

  // ---------- Run of Show ----------
  addRunOfShowItem: (r) => { const id = `ros-${uuid().slice(0, 8)}`; set((s) => ({ activationRunOfShow: [...s.activationRunOfShow, { ...r, id }] })); return id; },
  updateRunOfShowItem: (id, data) => set((s) => ({ activationRunOfShow: s.activationRunOfShow.map((r) => (r.id === id ? { ...r, ...data } : r)) })),
  deleteRunOfShowItem: (id) => set((s) => ({ activationRunOfShow: s.activationRunOfShow.filter((r) => r.id !== id) })),
  completeRunOfShowItem: (id) => set((s) => ({ activationRunOfShow: s.activationRunOfShow.map((r) => (r.id === id ? { ...r, completed: true, completedAt: now() } : r)) })),

  // ---------- Reports ----------
  generateReport: (activationId) => {
    const id = `rpt-${uuid().slice(0, 8)}`;
    const activation = get().activations.find((a) => a.id === activationId);
    const leads = get().activationLeads.filter((l) => l.activationId === activationId);
    const products = get().activationProducts.filter((p) => p.activationId === activationId);
    const budgetItems = get().activationBudgetItems.filter((b) => b.activationId === activationId);
    const totalSamples = products.reduce((sum, p) => sum + p.quantityUsed, 0);
    const totalBudgetSpent = budgetItems.reduce((sum, b) => sum + (b.actualAmount ?? b.estimatedAmount), 0);
    const totalLeads = leads.length;
    const totalInteractions = activation?.interactionGoal ?? 0; // placeholder until real tracking
    const report: ActivationReport = {
      id, activationId, title: `After-Action Report: ${activation?.name ?? "Activation"}`,
      summary: `Activation "${activation?.name}" completed. ${totalLeads} leads captured, ${totalSamples} samples distributed.`,
      totalLeads, totalSamples, totalInteractions,
      totalBudgetSpent,
      costPerLead: totalLeads > 0 ? Math.round(totalBudgetSpent / totalLeads) : 0,
      costPerSample: totalSamples > 0 ? Math.round(totalBudgetSpent / totalSamples) : 0,
      costPerInteraction: totalInteractions > 0 ? Math.round(totalBudgetSpent / totalInteractions) : 0,
      highlights: [], challenges: [], recommendations: [],
      generatedAt: now(), generatedBy: "you",
    };
    set((s) => ({ activationReports: [...s.activationReports, report] }));
    return id;
  },
}));
