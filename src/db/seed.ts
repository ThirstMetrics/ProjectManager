import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}
function hoursAgo(n: number) {
  return new Date(Date.now() - n * 60 * 60 * 1000).toISOString();
}
const now = () => new Date().toISOString();

async function seed() {
  console.log("Seeding database...");

  // ---------- Projects ----------
  await db.insert(schema.projects).values([
    { id: "proj-1", name: "Mobile App Redesign", description: "Complete overhaul of the mobile experience with new UI components and improved performance.", type: "software", color: "#6366f1", icon: "Code2", status: "active", startDate: daysFromNow(-14), endDate: daysFromNow(30), createdAt: daysFromNow(-14), updatedAt: now() },
    { id: "proj-2", name: "Valentine's Champagne Activation", description: "Brand X sponsoring a Valentine's champagne special with Restaurant Y — tastings, POS displays, photographer, flower wall.", type: "beverage", color: "#f59e0b", icon: "Wine", status: "active", startDate: daysFromNow(-7), endDate: daysFromNow(14), createdAt: daysFromNow(-7), updatedAt: now() },
    { id: "proj-3", name: "Q1 Marketing Push", description: "Multi-channel marketing campaign for Q1 product launches.", type: "marketing", color: "#ec4899", icon: "Megaphone", status: "active", startDate: daysFromNow(-3), endDate: daysFromNow(60), createdAt: daysFromNow(-3), updatedAt: now() },
  ]);

  // ---------- Milestones ----------
  await db.insert(schema.milestones).values([
    { id: "ms-1", projectId: "proj-1", title: "Design Review Complete", dueDate: daysFromNow(3), completed: false },
    { id: "ms-2", projectId: "proj-1", title: "Sprint Demo", dueDate: daysFromNow(7), completed: false },
    { id: "ms-3", projectId: "proj-1", title: "Beta Release", dueDate: daysFromNow(25), completed: false },
    { id: "ms-4", projectId: "proj-2", title: "Venue Confirmed", dueDate: daysFromNow(2), completed: false },
    { id: "ms-5", projectId: "proj-2", title: "Menu Finalized", dueDate: daysFromNow(5), completed: false },
    { id: "ms-6", projectId: "proj-2", title: "Print Materials Ready", dueDate: daysFromNow(8), completed: false },
    { id: "ms-7", projectId: "proj-2", title: "Valentine's Event Day", dueDate: daysFromNow(14), completed: false },
    { id: "ms-8", projectId: "proj-3", title: "Campaign Go-Live", dueDate: daysFromNow(10), completed: false },
  ]);

  // ---------- Tasks (no dependencies/dependents columns — those go in pivot) ----------
  await db.insert(schema.tasks).values([
    { id: "task-1", projectId: "proj-1", title: "Design new navigation flow", description: "Create wireframes and high-fidelity mockups.", status: "in_progress", priority: "high", assignee: "Alice", dueDate: daysFromNow(3), startDate: daysFromNow(-5), tags: ["design", "ux"], subtasks: [{ id: "st-1", title: "Research competitor patterns", completed: true }, { id: "st-2", title: "Create wireframes", completed: true }, { id: "st-3", title: "High-fidelity mockups", completed: false }], attachments: [], approvalRequired: false, approvalStatus: "none", createdAt: daysFromNow(-5), updatedAt: now(), order: 0 },
    { id: "task-2", projectId: "proj-1", title: "Implement navigation components", description: "Build React Native navigation components.", status: "todo", priority: "high", assignee: "Bob", dueDate: daysFromNow(7), startDate: daysFromNow(3), tags: ["frontend"], subtasks: [], attachments: [], approvalRequired: false, approvalStatus: "none", createdAt: daysFromNow(-3), updatedAt: now(), order: 1 },
    { id: "task-3", projectId: "proj-1", title: "API integration for user profiles", description: "Connect redesigned profile screens to REST API.", status: "backlog", priority: "medium", dueDate: daysFromNow(10), tags: ["backend", "api"], subtasks: [], attachments: [], approvalRequired: false, approvalStatus: "none", createdAt: daysFromNow(-2), updatedAt: now(), order: 2 },
    { id: "task-4", projectId: "proj-1", title: "Write unit tests for auth module", description: "Achieve 90%+ coverage.", status: "done", priority: "medium", assignee: "Alice", dueDate: daysFromNow(-1), startDate: daysFromNow(-7), tags: ["testing"], subtasks: [], attachments: [], approvalRequired: false, approvalStatus: "none", createdAt: daysFromNow(-7), updatedAt: now(), completedAt: daysFromNow(-1), order: 3 },
    { id: "task-5", projectId: "proj-2", title: "Book venue for champagne tasting", description: "Secure Restaurant Y for the Valentine's event.", status: "in_progress", priority: "urgent", assignee: "Carol", dueDate: daysFromNow(2), startDate: daysFromNow(-4), tags: ["venue", "logistics"], subtasks: [{ id: "st-4", title: "Research venue options", completed: true }, { id: "st-5", title: "Get quotes from Restaurant Y", completed: true }, { id: "st-6", title: "Sign venue contract", completed: false }], attachments: [], approvalRequired: false, approvalStatus: "none", createdAt: daysFromNow(-6), updatedAt: now(), order: 0 },
    { id: "task-6", projectId: "proj-2", title: "Design POS display & table tents", description: "Create Brand X Valentine's branded point-of-sale materials.", status: "todo", priority: "high", assignee: "Maria", dueDate: daysFromNow(8), startDate: daysFromNow(2), tags: ["design", "print"], subtasks: [], attachments: [], approvalRequired: true, approver: "Carol", approvalStatus: "none", createdAt: daysFromNow(-3), updatedAt: now(), order: 1 },
    { id: "task-7", projectId: "proj-2", title: "Coordinate influencer outreach", description: "Reach out to 20 local influencers for event coverage.", status: "todo", priority: "medium", assignee: "Carol", dueDate: daysFromNow(5), tags: ["marketing", "influencer"], subtasks: [], attachments: [], approvalRequired: false, approvalStatus: "none", createdAt: daysFromNow(-2), updatedAt: now(), order: 2 },
    { id: "task-9", projectId: "proj-2", title: "Chef uploads special menu", description: "Chef to create and upload Valentine's champagne pairing menu.", status: "review", priority: "high", assignee: "Chef Laurent", dueDate: daysFromNow(5), tags: ["menu", "food"], subtasks: [], attachments: [], approvalRequired: true, approver: "Sophie", approvalStatus: "pending", approvalRequestedAt: hoursAgo(6), createdAt: daysFromNow(-1), updatedAt: now(), order: 3 },
    { id: "task-10", projectId: "proj-2", title: "Send final menu to printer", description: "Once menu is approved, send to Maria for printing.", status: "backlog", priority: "high", assignee: "Carol", dueDate: daysFromNow(8), tags: ["print", "logistics"], subtasks: [], attachments: [], approvalRequired: true, approver: "Jake", approvalStatus: "none", createdAt: daysFromNow(-1), updatedAt: now(), order: 4 },
    { id: "task-11", projectId: "proj-2", title: "Book photographer for event", description: "Hire Brand X's preferred photographer for Valentine's event.", status: "todo", priority: "medium", assignee: "Jake", dueDate: daysFromNow(10), tags: ["photography", "vendor"], subtasks: [], attachments: [], approvalRequired: false, approvalStatus: "none", createdAt: daysFromNow(-1), updatedAt: now(), order: 5 },
    { id: "task-12", projectId: "proj-2", title: "Arrange flower wall for entrance", description: "Hire party company for branded flower wall installation.", status: "backlog", priority: "medium", assignee: "Jake", dueDate: daysFromNow(12), tags: ["decor", "vendor"], subtasks: [], attachments: [], approvalRequired: false, approvalStatus: "none", createdAt: now(), updatedAt: now(), order: 6 },
    { id: "task-8", projectId: "proj-3", title: "Draft email campaign copy", description: "Write copy for the 4-part email drip campaign.", status: "review", priority: "high", assignee: "Eve", dueDate: daysFromNow(1), startDate: daysFromNow(-3), tags: ["copy", "email"], subtasks: [], attachments: [], approvalRequired: true, approver: "Eve", approvalStatus: "pending", approvalRequestedAt: hoursAgo(2), createdAt: daysFromNow(-5), updatedAt: now(), order: 0 },
  ]);

  // ---------- Task Dependencies (pivot table) ----------
  await db.insert(schema.taskDependencies).values([
    // task-2 depends on task-1
    { taskId: "task-2", dependsOnId: "task-1" },
    // task-3 depends on task-1
    { taskId: "task-3", dependsOnId: "task-1" },
    // task-6 depends on task-5
    { taskId: "task-6", dependsOnId: "task-5" },
  ]);

  // ---------- Team Members ----------
  await db.insert(schema.teamMembers).values([
    { id: "tm-1", projectId: "proj-2", name: "Carol Distributor", email: "carol@distributor.com", role: "owner", joinedAt: daysFromNow(-7), lastLoginAt: hoursAgo(1), status: "active" },
    { id: "tm-2", projectId: "proj-2", name: "Jake Brand Manager", email: "jake@brandx.com", role: "manager", invitedBy: "tm-1", joinedAt: daysFromNow(-6), lastLoginAt: hoursAgo(3), status: "active" },
    { id: "tm-3", projectId: "proj-2", name: "Sophie Restaurant Mgr", email: "sophie@restauranty.com", role: "manager", invitedBy: "tm-1", joinedAt: daysFromNow(-5), lastLoginAt: hoursAgo(12), status: "active" },
    { id: "tm-4", projectId: "proj-2", name: "Maria Designer", email: "maria@printshop.com", role: "contributor", invitedBy: "tm-2", joinedAt: daysFromNow(-3), lastLoginAt: hoursAgo(24), status: "active" },
    { id: "tm-5", projectId: "proj-2", name: "Chef Laurent", email: "laurent@restauranty.com", role: "contributor", invitedBy: "tm-3", joinedAt: daysFromNow(-2), lastLoginAt: hoursAgo(48), status: "active" },
    { id: "tm-6", projectId: "proj-2", name: "PhotoPro Studios", email: "info@photopro.com", role: "contributor", invitedBy: "tm-2", joinedAt: daysFromNow(-1), lastLoginAt: daysFromNow(-1), status: "invited" },
    { id: "tm-7", projectId: "proj-2", name: "Bloom & Petal Events", email: "events@bloompetal.com", role: "viewer", invitedBy: "tm-2", joinedAt: now(), lastLoginAt: now(), status: "invited" },
    { id: "tm-8", projectId: "proj-1", name: "Alice Chen", email: "alice@team.com", role: "owner", joinedAt: daysFromNow(-14), lastLoginAt: hoursAgo(0.5), status: "active" },
    { id: "tm-9", projectId: "proj-1", name: "Bob Park", email: "bob@team.com", role: "contributor", invitedBy: "tm-8", joinedAt: daysFromNow(-14), lastLoginAt: hoursAgo(2), status: "active" },
    { id: "tm-10", projectId: "proj-3", name: "Eve Marketing", email: "eve@marketing.com", role: "owner", joinedAt: daysFromNow(-3), lastLoginAt: hoursAgo(4), status: "active" },
  ]);

  // ---------- Activity Log ----------
  await db.insert(schema.activityLog).values([
    { id: "al-1", projectId: "proj-2", memberId: "tm-1", memberName: "Carol Distributor", action: "created project", target: "Valentine's Champagne Activation", timestamp: daysFromNow(-7) },
    { id: "al-2", projectId: "proj-2", memberId: "tm-1", memberName: "Carol Distributor", action: "invited", target: "Jake Brand Manager", timestamp: daysFromNow(-6) },
    { id: "al-3", projectId: "proj-2", memberId: "tm-1", memberName: "Carol Distributor", action: "invited", target: "Sophie Restaurant Mgr", timestamp: daysFromNow(-5) },
    { id: "al-4", projectId: "proj-2", memberId: "tm-2", memberName: "Jake Brand Manager", action: "invited", target: "Maria Designer", timestamp: daysFromNow(-3) },
    { id: "al-5", projectId: "proj-2", memberId: "tm-3", memberName: "Sophie Restaurant Mgr", action: "invited", target: "Chef Laurent", timestamp: daysFromNow(-2) },
    { id: "al-6", projectId: "proj-2", memberId: "tm-5", memberName: "Chef Laurent", action: "uploaded file", target: "champagne-pairing-menu-v1.pdf", timestamp: daysFromNow(-1) },
    { id: "al-7", projectId: "proj-2", memberId: "tm-1", memberName: "Carol Distributor", action: "completed subtask", target: "Get quotes from Restaurant Y", timestamp: hoursAgo(6) },
    { id: "al-8", projectId: "proj-2", memberId: "tm-4", memberName: "Maria Designer", action: "uploaded file", target: "valentines-pos-draft.png", timestamp: hoursAgo(4) },
    { id: "al-9", projectId: "proj-2", memberId: "tm-2", memberName: "Jake Brand Manager", action: "sent message", target: "#general", timestamp: hoursAgo(2) },
  ]);

  // ---------- Chat Channels ----------
  await db.insert(schema.chatChannels).values([
    { id: "ch-1", projectId: "proj-2", name: "general", description: "General project discussion", createdBy: "tm-1", createdAt: daysFromNow(-7), isDefault: true },
    { id: "ch-2", projectId: "proj-2", name: "menu-edits", description: "Menu design and content discussion", createdBy: "tm-3", createdAt: daysFromNow(-3), isDefault: false },
    { id: "ch-3", projectId: "proj-2", name: "print-proofs", description: "Print material reviews and approvals", createdBy: "tm-2", createdAt: daysFromNow(-2), isDefault: false },
    { id: "ch-4", projectId: "proj-1", name: "general", description: "General project discussion", createdBy: "tm-8", createdAt: daysFromNow(-14), isDefault: true },
    { id: "ch-5", projectId: "proj-3", name: "general", description: "General project discussion", createdBy: "tm-10", createdAt: daysFromNow(-3), isDefault: true },
  ]);

  // ---------- Chat Messages ----------
  await db.insert(schema.chatMessages).values([
    { id: "msg-1", channelId: "ch-1", projectId: "proj-2", senderId: "tm-1", senderName: "Carol Distributor", content: "Welcome everyone! Let's make this Valentine's activation incredible. Key dates pinned in milestones.", timestamp: daysFromNow(-7), edited: false },
    { id: "msg-2", channelId: "ch-1", projectId: "proj-2", senderId: "tm-2", senderName: "Jake Brand Manager", content: "Thanks Carol! I've invited Maria from the print shop for the POS displays. @Sophie Restaurant Mgr can you get Chef Laurent onboard for the menu?", mentions: ["tm-3"], timestamp: daysFromNow(-6), edited: false },
    { id: "msg-3", channelId: "ch-1", projectId: "proj-2", senderId: "tm-3", senderName: "Sophie Restaurant Mgr", content: "Done! Chef Laurent is now on the project. He'll upload the champagne pairing menu by end of week.", threadId: "msg-2", timestamp: daysFromNow(-5), edited: false },
    { id: "msg-4", channelId: "ch-2", projectId: "proj-2", senderId: "tm-5", senderName: "Chef Laurent", content: "I've uploaded the first draft of the champagne pairing menu. Three courses with bubbly pairings. Please review!", timestamp: daysFromNow(-1), edited: false },
    { id: "msg-5", channelId: "ch-2", projectId: "proj-2", senderId: "tm-3", senderName: "Sophie Restaurant Mgr", content: "Looks beautiful, Chef! Can we swap the dessert from crème brûlée to chocolate fondant? Pairs better with the rosé.", threadId: "msg-4", timestamp: hoursAgo(20), edited: false },
    { id: "msg-6", channelId: "ch-1", projectId: "proj-2", senderId: "tm-2", senderName: "Jake Brand Manager", content: "Quick update — photographer and flower wall company have been invited. @Carol Distributor we're on track!", mentions: ["tm-1"], timestamp: hoursAgo(2), edited: false },
    { id: "msg-7", channelId: "ch-3", projectId: "proj-2", senderId: "tm-4", senderName: "Maria Designer", content: "First draft of the Valentine's POS display is uploaded to Files. Let me know if the Brand X logo placement works.", timestamp: hoursAgo(4), edited: false },
  ]);

  // ---------- Calendar Events ----------
  await db.insert(schema.calendarEvents).values([
    { id: "evt-1", projectId: "proj-2", title: "Valentine's Champagne Event", description: "Flagship tasting event at Restaurant Y", start: daysFromNow(14), end: daysFromNow(14), allDay: false, color: "#f59e0b", type: "event" },
    { id: "evt-2", projectId: "proj-1", taskId: "task-1", title: "Design Review Meeting", description: "Review navigation mockups", start: daysFromNow(2), end: daysFromNow(2), allDay: false, color: "#6366f1", type: "meeting" },
    { id: "evt-3", projectId: "proj-1", title: "Sprint Demo", description: "End of sprint demo", start: daysFromNow(7), end: daysFromNow(7), allDay: false, color: "#6366f1", type: "milestone" },
    { id: "evt-4", projectId: "proj-3", title: "Campaign Go-Live", description: "Q1 campaign launches", start: daysFromNow(10), end: daysFromNow(10), allDay: true, color: "#ec4899", type: "milestone" },
  ]);

  // ---------- Notifications ----------
  await db.insert(schema.notifications).values([
    { id: "notif-1", title: "Task assigned", message: "You have been assigned 'Design new navigation flow'", type: "info", channel: ["screen"], read: false, actionUrl: "/tasks", projectId: "proj-1", taskId: "task-1", createdAt: daysFromNow(-1) },
    { id: "notif-2", title: "Deadline approaching", message: "'Book venue for champagne tasting' is due in 2 days", type: "warning", channel: ["screen", "email"], read: false, actionUrl: "/tasks", projectId: "proj-2", taskId: "task-5", createdAt: now() },
    { id: "notif-3", title: "Task completed", message: "'Write unit tests for auth module' has been completed", type: "success", channel: ["screen"], read: true, actionUrl: "/tasks", projectId: "proj-1", taskId: "task-4", createdAt: daysFromNow(-1) },
    { id: "notif-4", title: "New team member", message: "Maria Designer joined Valentine's Champagne Activation", type: "info", channel: ["screen"], read: false, actionUrl: "/projects/proj-2", projectId: "proj-2", createdAt: daysFromNow(-3) },
  ]);

  // ---------- Notification Preferences ----------
  await db.insert(schema.notificationPreferences).values([{
    id: "default",
    screen: true, email: true, sms: false, emailAddress: "", phoneNumber: "",
    taskAssigned: ["screen", "email"], taskCompleted: ["screen"], taskOverdue: ["screen", "email", "sms"],
    eventReminder: ["screen", "email"], fileUploaded: ["screen"], projectUpdate: ["screen"],
  }]);

  // ---------- Activations ----------
  await db.insert(schema.activations).values([
    {
      id: "act-1", name: "Valentine's Champagne Tasting", brand: "Brand X Champagne",
      description: "Brand X sponsoring a Valentine's champagne tasting at Restaurant Y — tastings, POS displays, photographer, flower wall.",
      color: "#f59e0b", icon: "Wine", phase: "pre_event", status: "confirmed",
      eventDate: daysFromNow(14), setupDate: daysFromNow(13), teardownDate: daysFromNow(15),
      venueId: "venue-1", budgetTotal: 1500000, budgetSpent: 425000,
      leadGoal: 150, sampleGoal: 300, interactionGoal: 500,
      tags: ["champagne", "valentines", "restaurant"], createdAt: daysFromNow(-7), updatedAt: now(), createdBy: "you",
    },
    {
      id: "act-2", name: "T-Mobile Summer Splash", brand: "T-Mobile",
      description: "T-Mobile branded beach activation at Sunset Beach Bar with phone charging stations, music, and giveaways.",
      color: "#e91e8b", icon: "Smartphone", phase: "planning", status: "draft",
      eventDate: daysFromNow(60), eventEndDate: daysFromNow(61), setupDate: daysFromNow(59), teardownDate: daysFromNow(62),
      budgetTotal: 5000000, budgetSpent: 0,
      leadGoal: 500, sampleGoal: 1000, interactionGoal: 2000,
      tags: ["tech", "summer", "beach"], createdAt: daysFromNow(-2), updatedAt: now(), createdBy: "you",
    },
  ]);

  // ---------- Activation Venues ----------
  await db.insert(schema.activationVenues).values([{
    id: "venue-1", activationId: "act-1", name: "Restaurant Y", address: "425 Ocean Drive",
    city: "Miami Beach", state: "FL", zip: "33139",
    contactName: "Sophie Martinez", contactEmail: "sophie@restauranty.com", contactPhone: "(305) 555-0142",
    venueType: "restaurant", capacity: 120, status: "booked",
    walkthroughDate: daysFromNow(-3), walkthroughNotes: "Main dining room fits 80 guests. Patio for 40. Bar area ideal for tasting station. Power outlets near entrance for POS displays. Flower wall goes against east wall.",
    bookingConfirmedAt: daysFromNow(-2), bookingCost: 250000,
    specialRequirements: "Liquor license covers champagne service. Need to confirm insurance by next week. Valet parking available.",
    createdAt: daysFromNow(-5), updatedAt: now(),
  }]);

  // ---------- Activation Stakeholders ----------
  await db.insert(schema.activationStakeholders).values([
    { id: "stk-1", activationId: "act-1", name: "Jake Rivera", email: "jake@brandxchampagne.com", phone: "(212) 555-0198", company: "Brand X Champagne", type: "brand", role: "Brand Manager", ndaStatus: "signed", ndaDocumentId: "doc-1", canViewBudget: true, canViewLeads: true, notes: "Primary contact for Brand X. Approves all creative.", invitedAt: daysFromNow(-6), status: "active", createdAt: daysFromNow(-6) },
    { id: "stk-2", activationId: "act-1", name: "Carol Washington", email: "carol@distributor.com", phone: "(305) 555-0177", company: "SunCoast Distributors", type: "distributor", role: "Account Manager", ndaStatus: "signed", ndaDocumentId: "doc-2", canViewBudget: true, notes: "Handles product shipment and inventory.", invitedAt: daysFromNow(-7), status: "active", createdAt: daysFromNow(-7) },
    { id: "stk-3", activationId: "act-1", name: "Sophie Martinez", email: "sophie@restauranty.com", phone: "(305) 555-0142", company: "Restaurant Y", type: "venue", role: "General Manager", ndaStatus: "pending", ndaDocumentId: "doc-3", notes: "Venue contact. Coordinates with Chef Laurent.", invitedAt: daysFromNow(-5), status: "active", createdAt: daysFromNow(-5) },
    { id: "stk-4", activationId: "act-1", name: "Maria Gonzalez", email: "maria@printshop.com", phone: "(305) 555-0133", company: "PrintCraft Studios", type: "vendor", role: "Design Lead", ndaStatus: "not_required", notes: "Handles POS displays and table tents.", invitedAt: daysFromNow(-3), status: "active", createdAt: daysFromNow(-3) },
    { id: "stk-5", activationId: "act-1", name: "Lena Voss", email: "lena@luminousagency.com", phone: "(786) 555-0109", company: "Luminous Agency", type: "marketing_agency", role: "Campaign Lead", ndaStatus: "signed", ndaDocumentId: "doc-4", canViewLeads: true, notes: "Manages influencer outreach and social strategy.", invitedAt: daysFromNow(-4), status: "active", createdAt: daysFromNow(-4) },
    { id: "stk-6", activationId: "act-1", name: "PhotoPro Studios", email: "info@photopro.com", phone: "(305) 555-0188", company: "PhotoPro Studios", type: "vendor", role: "Photographer", ndaStatus: "not_required", notes: "Event photography and videography.", invitedAt: daysFromNow(-1), status: "invited", createdAt: daysFromNow(-1) },
    { id: "stk-7", activationId: "act-1", name: "Bloom & Petal Events", email: "events@bloompetal.com", phone: "(305) 555-0155", company: "Bloom & Petal Events", type: "vendor", role: "Floral/Decor", ndaStatus: "not_required", notes: "Flower wall installation.", invitedAt: now(), status: "invited", createdAt: now() },
    { id: "stk-8", activationId: "act-2", name: "Marcus Johnson", email: "marcus@tmobile.com", phone: "(425) 555-0201", company: "T-Mobile", type: "brand", role: "Regional Marketing Director", ndaStatus: "not_required", canViewBudget: true, canViewLeads: true, canViewAllDocuments: true, notes: "Executive sponsor for Summer Splash.", invitedAt: daysFromNow(-2), status: "active", createdAt: daysFromNow(-2) },
  ]);

  // ---------- Activation Products ----------
  await db.insert(schema.activationProducts).values([
    { id: "prod-1", activationId: "act-1", name: "Brand X Brut Champagne 750ml", sku: "BX-BRUT-750", category: "beverage", quantityRequested: 120, quantityConfirmed: 120, quantityShipped: 120, unitCost: 2800, status: "shipped", shippingTrackingNumber: "1Z999AA10123456784", shippingCarrier: "UPS", expectedDeliveryDate: daysFromNow(10), notes: "Main tasting product", createdAt: daysFromNow(-5), updatedAt: now() },
    { id: "prod-2", activationId: "act-1", name: "Brand X Rosé Champagne 750ml", sku: "BX-ROSE-750", category: "beverage", quantityRequested: 60, quantityConfirmed: 60, unitCost: 3200, status: "confirmed", expectedDeliveryDate: daysFromNow(11), notes: "For rosé pairing course", createdAt: daysFromNow(-5), updatedAt: now() },
    { id: "prod-3", activationId: "act-1", name: "Branded Champagne Flutes", sku: "BX-FLUTE-SET", category: "merchandise", quantityRequested: 200, quantityConfirmed: 200, quantityShipped: 200, quantityDelivered: 200, unitCost: 450, status: "delivered", shippingTrackingNumber: "1Z999BB20123456785", shippingCarrier: "UPS", expectedDeliveryDate: daysFromNow(-1), deliveredAt: daysFromNow(-1), notes: "Guest takeaway. Stored at venue.", createdAt: daysFromNow(-5), updatedAt: now() },
    { id: "prod-4", activationId: "act-1", name: "Brand X Table Tent Cards", sku: "BX-TENT-50", category: "display", quantityRequested: 50, unitCost: 150, status: "requested", notes: "Awaiting design approval from Jake", createdAt: daysFromNow(-3), updatedAt: now() },
  ]);

  // ---------- Activation Personnel ----------
  await db.insert(schema.activationPersonnel).values([
    { id: "pers-1", activationId: "act-1", name: "Daniela Cruz", email: "daniela@brandambassadors.com", phone: "(305) 555-0166", role: "Lead Brand Ambassador", clockStatus: "not_started", hourlyRate: 3500, productKnowledgeVerified: true, productKnowledgeVerifiedAt: daysFromNow(-2), productKnowledgeScore: 95, notes: "Experienced with champagne activations.", createdAt: daysFromNow(-4) },
    { id: "pers-2", activationId: "act-1", name: "Ryan Okafor", email: "ryan@brandambassadors.com", phone: "(305) 555-0178", role: "Brand Ambassador", clockStatus: "not_started", hourlyRate: 2500, notes: "First champagne event. Needs product training.", createdAt: daysFromNow(-4) },
    { id: "pers-3", activationId: "act-1", stakeholderId: "stk-6", name: "PhotoPro Studios", email: "info@photopro.com", phone: "(305) 555-0188", role: "Photographer", clockStatus: "not_started", hourlyRate: 7500, notes: "Covering full event. Deliverables: 200+ edited photos, 2 social reels.", createdAt: daysFromNow(-1) },
  ]);

  // ---------- Activation Budget Items ----------
  await db.insert(schema.activationBudgetItems).values([
    { id: "budget-1", activationId: "act-1", category: "venue", description: "Restaurant Y venue rental (4 hours)", vendor: "Restaurant Y", estimatedAmount: 250000, actualAmount: 250000, status: "paid", approvedBy: "stk-1", approvedAt: daysFromNow(-2), notes: "Deposit paid. Balance due event day.", createdAt: daysFromNow(-5), updatedAt: now() },
    { id: "budget-2", activationId: "act-1", category: "product", description: "Brand X Brut Champagne (120 bottles)", vendor: "SunCoast Distributors", estimatedAmount: 336000, status: "approved", approvedBy: "stk-1", approvedAt: daysFromNow(-4), notes: "At-cost pricing through distributor.", createdAt: daysFromNow(-5), updatedAt: now() },
    { id: "budget-3", activationId: "act-1", category: "product", description: "Brand X Rosé Champagne (60 bottles)", vendor: "SunCoast Distributors", estimatedAmount: 192000, status: "approved", approvedBy: "stk-1", approvedAt: daysFromNow(-4), createdAt: daysFromNow(-5), updatedAt: now() },
    { id: "budget-4", activationId: "act-1", category: "materials", description: "Branded champagne flutes (200 units)", vendor: "PrintCraft Studios", estimatedAmount: 90000, actualAmount: 90000, status: "paid", approvedBy: "stk-2", approvedAt: daysFromNow(-4), notes: "Delivered to venue.", createdAt: daysFromNow(-5), updatedAt: now() },
    { id: "budget-5", activationId: "act-1", category: "photography", description: "Event photography & videography", vendor: "PhotoPro Studios", estimatedAmount: 150000, status: "pending_approval", notes: "Full event coverage + 2 social reels.", createdAt: daysFromNow(-1), updatedAt: now() },
    { id: "budget-6", activationId: "act-1", category: "decor", description: "Flower wall installation", vendor: "Bloom & Petal Events", estimatedAmount: 85000, status: "estimated", notes: "Awaiting final quote.", createdAt: now(), updatedAt: now() },
    { id: "budget-7", activationId: "act-1", category: "staffing", description: "Brand ambassadors (2 staff x 6 hours)", vendor: "Brand Ambassadors Inc.", estimatedAmount: 42000, status: "approved", approvedBy: "stk-2", approvedAt: daysFromNow(-3), notes: "Lead: $35/hr, Support: $25/hr.", createdAt: daysFromNow(-4), updatedAt: now() },
    { id: "budget-8", activationId: "act-1", category: "marketing", description: "Influencer partnerships (5 micro-influencers)", vendor: "Luminous Agency", estimatedAmount: 125000, status: "pending_approval", notes: "5 local food/lifestyle influencers, $500 each.", createdAt: daysFromNow(-2), updatedAt: now() },
    { id: "budget-9", activationId: "act-1", category: "materials", description: "Table tent cards (50 units)", vendor: "PrintCraft Studios", estimatedAmount: 7500, status: "estimated", notes: "Pending design approval.", createdAt: daysFromNow(-3), updatedAt: now() },
    { id: "budget-10", activationId: "act-1", category: "permits", description: "Special event liquor permit", vendor: "Miami-Dade County", estimatedAmount: 15000, actualAmount: 15000, status: "paid", approvedBy: "stk-3", approvedAt: daysFromNow(-3), notes: "Filed and approved.", createdAt: daysFromNow(-5), updatedAt: now() },
  ]);

  // ---------- Activation Documents ----------
  await db.insert(schema.activationDocuments).values([
    {
      id: "doc-1", activationId: "act-1", type: "nda", title: "NDA — Jake Rivera (Brand X)",
      content: "NON-DISCLOSURE AGREEMENT\n\nThis Non-Disclosure Agreement (\"Agreement\") is entered into as of the date of electronic signature below.\n\nBETWEEN: ThirstMetrics LLC (\"Disclosing Party\")\nAND: Jake Rivera, Brand X Champagne (\"Receiving Party\")\n\n1. CONFIDENTIAL INFORMATION.\n2. TERM. Two (2) years.\n3. PERMITTED USE. Activation role only.\n4. RETURN OF MATERIALS.\n5. GOVERNING LAW. Florida.",
      fileName: "NDA-Jake-Rivera-BrandX.pdf", fileSize: 45000,
      scopedToStakeholderId: "stk-1",
      signStatus: "signed", signedBy: "stk-1", signedAt: daysFromNow(-5),
      signerName: "Jake Rivera", signerEmail: "jake@brandxchampagne.com",
      expiresAt: daysFromNow(730), createdAt: daysFromNow(-6), updatedAt: daysFromNow(-5),
    },
    {
      id: "doc-2", activationId: "act-1", type: "nda", title: "NDA — Carol Washington (SunCoast Distributors)",
      content: "NON-DISCLOSURE AGREEMENT\n\nBETWEEN: ThirstMetrics LLC\nAND: Carol Washington, SunCoast Distributors",
      fileName: "NDA-Carol-Washington-SunCoast.pdf", fileSize: 45000,
      scopedToStakeholderId: "stk-2",
      signStatus: "signed", signedBy: "stk-2", signedAt: daysFromNow(-6),
      signerName: "Carol Washington", signerEmail: "carol@distributor.com",
      expiresAt: daysFromNow(730), createdAt: daysFromNow(-7), updatedAt: daysFromNow(-6),
    },
    {
      id: "doc-3", activationId: "act-1", type: "nda", title: "NDA — Sophie Martinez (Restaurant Y)",
      content: "NON-DISCLOSURE AGREEMENT\n\nBETWEEN: ThirstMetrics LLC\nAND: Sophie Martinez, Restaurant Y",
      fileName: "NDA-Sophie-Martinez-RestaurantY.pdf", fileSize: 45000,
      scopedToStakeholderId: "stk-3",
      signStatus: "pending_signature",
      expiresAt: daysFromNow(730), createdAt: daysFromNow(-5), updatedAt: now(),
    },
    {
      id: "doc-4", activationId: "act-1", type: "nda", title: "NDA — Lena Voss (Luminous Agency)",
      content: "NON-DISCLOSURE AGREEMENT\n\nBETWEEN: ThirstMetrics LLC\nAND: Lena Voss, Luminous Agency",
      fileName: "NDA-Lena-Voss-Luminous.pdf", fileSize: 45000,
      scopedToStakeholderId: "stk-5",
      signStatus: "signed", signedBy: "stk-5", signedAt: daysFromNow(-3),
      signerName: "Lena Voss", signerEmail: "lena@luminousagency.com",
      expiresAt: daysFromNow(730), createdAt: daysFromNow(-4), updatedAt: daysFromNow(-3),
    },
    {
      id: "doc-5", activationId: "act-1", type: "permit", title: "Special Event Liquor Permit — Miami-Dade",
      content: "SPECIAL EVENT LIQUOR PERMIT\n\nPermit Number: SE-2026-04521\nIssued To: ThirstMetrics LLC\nVenue: Restaurant Y, 425 Ocean Drive, Miami Beach, FL 33139",
      fileName: "liquor-permit-miami-dade.pdf", fileSize: 32000,
      visibleToStakeholderIds: ["stk-1", "stk-2", "stk-3"],
      signStatus: "signed", signedAt: daysFromNow(-3),
      signerName: "Miami-Dade County Clerk",
      expiresAt: daysFromNow(15), createdAt: daysFromNow(-5), updatedAt: daysFromNow(-3),
    },
  ]);

  // ---------- Activation Checklists ----------
  await db.insert(schema.activationChecklists).values([
    { id: "chk-1", activationId: "act-1", category: "compliance", title: "Liquor license verified", description: "Confirm venue has valid liquor license for champagne service", required: true, completed: true, completedBy: "Sophie Martinez", completedAt: daysFromNow(-4), dueDate: daysFromNow(-3), order: 0 },
    { id: "chk-2", activationId: "act-1", category: "compliance", title: "Special event permit filed", description: "File special event liquor permit with Miami-Dade County", required: true, completed: true, completedBy: "Carol Washington", completedAt: daysFromNow(-3), dueDate: daysFromNow(-2), order: 1 },
    { id: "chk-3", activationId: "act-1", category: "compliance", title: "Event insurance confirmed", description: "General liability insurance for activation event", required: true, completed: false, dueDate: daysFromNow(5), order: 2 },
    { id: "chk-4", activationId: "act-1", category: "compliance", title: "NDAs signed by all key stakeholders", description: "Brand, distributor, venue, and agency NDAs complete", required: true, completed: false, dueDate: daysFromNow(7), order: 3 },
    { id: "chk-5", activationId: "act-1", category: "setup", title: "POS displays installed", description: "Brand X point-of-sale displays set up at venue", required: true, completed: false, dueDate: daysFromNow(13), order: 0 },
    { id: "chk-6", activationId: "act-1", category: "setup", title: "Flower wall assembled", description: "Bloom & Petal flower wall installed at east wall", required: false, completed: false, dueDate: daysFromNow(13), order: 1 },
    { id: "chk-7", activationId: "act-1", category: "setup", title: "Champagne chilled and staged", description: "All bottles chilled to service temperature", required: true, completed: false, dueDate: daysFromNow(14), order: 2 },
    { id: "chk-8", activationId: "act-1", category: "setup", title: "Table tents placed", description: "Brand X table tent cards on all tables", required: true, completed: false, dueDate: daysFromNow(14), order: 3 },
    { id: "chk-9", activationId: "act-1", category: "product_knowledge", title: "All ambassadors complete product training", description: "Staff must know Brand X history, tasting notes, food pairings, and pricing", required: true, completed: false, dueDate: daysFromNow(12), order: 0 },
    { id: "chk-10", activationId: "act-1", category: "teardown", title: "Remaining inventory boxed", description: "Count and box all unused champagne and materials", required: true, completed: false, dueDate: daysFromNow(15), order: 0 },
    { id: "chk-11", activationId: "act-1", category: "teardown", title: "Venue restored to original state", description: "Remove all Brand X materials, flower wall, POS displays", required: true, completed: false, dueDate: daysFromNow(15), order: 1 },
  ]);

  // ---------- Activation Run of Show ----------
  await db.insert(schema.activationRunOfShow).values([
    { id: "ros-1", activationId: "act-1", time: "10:00", endTime: "12:00", title: "Setup & staging", description: "POS display installation, flower wall setup, champagne staging", responsiblePersonnelId: "pers-1", responsibleName: "Daniela Cruz", completed: false, order: 0 },
    { id: "ros-2", activationId: "act-1", time: "12:00", endTime: "13:00", title: "Final walkthrough", description: "Jake + Carol + Sophie inspect setup, verify branding, check inventory", responsibleName: "Jake Rivera", completed: false, order: 1 },
    { id: "ros-3", activationId: "act-1", time: "13:00", endTime: "13:30", title: "Staff briefing", description: "Product knowledge refresher, tasting station assignments, lead capture review", responsiblePersonnelId: "pers-1", responsibleName: "Daniela Cruz", completed: false, order: 2 },
    { id: "ros-4", activationId: "act-1", time: "14:00", endTime: "18:00", title: "Activation live — guest service", description: "Champagne tastings, guided pairings, lead capture, photography", responsiblePersonnelId: "pers-1", responsibleName: "Daniela Cruz", completed: false, order: 3 },
    { id: "ros-5", activationId: "act-1", time: "18:00", endTime: "19:00", title: "Teardown", description: "Pack remaining inventory, remove displays, restore venue", responsiblePersonnelId: "pers-1", responsibleName: "Daniela Cruz", completed: false, order: 4 },
  ]);

  console.log("Seed complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
