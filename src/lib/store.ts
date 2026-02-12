import { create } from "zustand";
import { v4 as uuid } from "uuid";
import {
  Project, Task, CalendarEvent, FileItem, Notification,
  NotificationPreferences, TaskStatus, Subtask, ApprovalStatus,
  Milestone, TeamMember, ActivityLogEntry, ChatChannel, ChatMessage, ProjectRole,
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
}));
