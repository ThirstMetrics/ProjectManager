import { create } from "zustand";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
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
import { apiClient } from "./api-client";

const now = () => new Date().toISOString();

const defaultPreferences: NotificationPreferences = {
  screen: true, email: true, sms: false, emailAddress: "", phoneNumber: "",
  taskAssigned: ["screen", "email"], taskCompleted: ["screen"], taskOverdue: ["screen", "email", "sms"],
  eventReminder: ["screen", "email"], fileUploaded: ["screen"], projectUpdate: ["screen"],
};

// ============================================================
// ZUSTAND STORE
// ============================================================

interface AppState {
  // Hydration
  _hydrated: boolean;
  _hydrating: boolean;
  hydrate: () => Promise<void>;

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

// Helper: fire-and-forget API call with rollback on error
function persist(
  apiCall: () => Promise<unknown>,
  rollback: () => void,
) {
  apiCall().catch((err) => {
    console.error("API error, rolling back:", err);
    rollback();
    toast.error("Failed to save — change reverted");
  });
}

export const useAppStore = create<AppState>((set, get) => ({
  // ---------- Hydration ----------
  _hydrated: false,
  _hydrating: false,
  hydrate: async () => {
    if (get()._hydrating || get()._hydrated) return;
    set({ _hydrating: true });
    try {
      const data = await apiClient.get<Record<string, unknown>>("/api/hydrate");
      set({
        projects: (data.projects as Project[]) || [],
        tasks: (data.tasks as Task[]) || [],
        milestones: (data.milestones as Milestone[]) || [],
        events: (data.events as CalendarEvent[]) || [],
        files: (data.files as FileItem[]) || [],
        notifications: (data.notifications as Notification[]) || [],
        notificationPreferences: (data.notificationPreferences as NotificationPreferences) || defaultPreferences,
        teamMembers: (data.teamMembers as TeamMember[]) || [],
        activityLog: (data.activityLog as ActivityLogEntry[]) || [],
        chatChannels: (data.chatChannels as ChatChannel[]) || [],
        chatMessages: (data.chatMessages as ChatMessage[]) || [],
        activations: (data.activations as Activation[]) || [],
        activationVenues: (data.activationVenues as ActivationVenue[]) || [],
        activationStakeholders: (data.activationStakeholders as ActivationStakeholder[]) || [],
        activationProducts: (data.activationProducts as ActivationProduct[]) || [],
        activationPersonnel: (data.activationPersonnel as ActivationPersonnel[]) || [],
        activationLeads: (data.activationLeads as ActivationLeadCapture[]) || [],
        activationBudgetItems: (data.activationBudgetItems as ActivationBudgetItem[]) || [],
        activationDocuments: (data.activationDocuments as ActivationDocument[]) || [],
        activationChecklists: (data.activationChecklists as ActivationChecklist[]) || [],
        activationIssues: (data.activationIssues as ActivationIssue[]) || [],
        activationMedia: (data.activationMedia as ActivationMediaItem[]) || [],
        activationRunOfShow: (data.activationRunOfShow as ActivationRunOfShow[]) || [],
        activationReports: (data.activationReports as ActivationReport[]) || [],
        _hydrated: true,
        _hydrating: false,
      });
    } catch (err) {
      console.error("Hydration failed:", err);
      set({ _hydrating: false });
      toast.error("Failed to load data from server");
    }
  },

  // ---------- Initial empty state ----------
  projects: [],
  tasks: [],
  milestones: [],
  events: [],
  files: [],
  notifications: [],
  notificationPreferences: defaultPreferences,
  teamMembers: [],
  activityLog: [],
  chatChannels: [],
  chatMessages: [],
  activations: [],
  activationVenues: [],
  activationStakeholders: [],
  activationProducts: [],
  activationPersonnel: [],
  activationLeads: [],
  activationBudgetItems: [],
  activationDocuments: [],
  activationChecklists: [],
  activationIssues: [],
  activationMedia: [],
  activationRunOfShow: [],
  activationReports: [],

  // ============================================================
  // PROJECTS
  // ============================================================

  addProject: (p) => {
    const id = `proj-${uuid().slice(0, 8)}`;
    const project: Project = { ...p, id, createdAt: now(), updatedAt: now() };
    const chId = `ch-${uuid().slice(0, 8)}`;
    const channel: ChatChannel = { id: chId, projectId: id, name: "general", description: "General project discussion", createdBy: "", createdAt: now(), isDefault: true };
    set((s) => ({
      projects: [...s.projects, project],
      chatChannels: [...s.chatChannels, channel],
    }));
    persist(
      () => apiClient.post("/api/projects", p),
      () => set((s) => ({
        projects: s.projects.filter((x) => x.id !== id),
        chatChannels: s.chatChannels.filter((x) => x.id !== chId),
      })),
    );
    return id;
  },

  updateProject: (id, data) => {
    const prev = get().projects.find((p) => p.id === id);
    set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...data, updatedAt: now() } : p)) }));
    persist(
      () => apiClient.patch(`/api/projects/${id}`, data),
      () => { if (prev) set((s) => ({ projects: s.projects.map((p) => (p.id === id ? prev : p)) })); },
    );
  },

  deleteProject: (id) => {
    const prev = {
      projects: get().projects,
      tasks: get().tasks,
      events: get().events,
      files: get().files,
      milestones: get().milestones,
      teamMembers: get().teamMembers,
      chatChannels: get().chatChannels,
      chatMessages: get().chatMessages,
      activityLog: get().activityLog,
    };
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      tasks: s.tasks.filter((t) => t.projectId !== id),
      events: s.events.filter((e) => e.projectId !== id),
      files: s.files.filter((f) => f.projectId !== id),
      milestones: s.milestones.filter((m) => m.projectId !== id),
      teamMembers: s.teamMembers.filter((m) => m.projectId !== id),
      chatChannels: s.chatChannels.filter((c) => c.projectId !== id),
      chatMessages: s.chatMessages.filter((m) => m.projectId !== id),
      activityLog: s.activityLog.filter((a) => a.projectId !== id),
    }));
    persist(
      () => apiClient.delete(`/api/projects/${id}`),
      () => set(prev),
    );
  },

  // ============================================================
  // MILESTONES
  // ============================================================

  addMilestone: (m) => {
    const id = `ms-${uuid().slice(0, 8)}`;
    set((s) => ({ milestones: [...s.milestones, { ...m, id }] }));
    persist(
      () => apiClient.post("/api/milestones", { ...m, id }),
      () => set((s) => ({ milestones: s.milestones.filter((x) => x.id !== id) })),
    );
    return id;
  },

  toggleMilestone: (id) => {
    const prev = get().milestones.find((m) => m.id === id);
    set((s) => ({ milestones: s.milestones.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m)) }));
    persist(
      () => apiClient.patch("/api/milestones", { id, completed: !prev?.completed }),
      () => { if (prev) set((s) => ({ milestones: s.milestones.map((m) => (m.id === id ? prev : m)) })); },
    );
  },

  deleteMilestone: (id) => {
    const prev = get().milestones;
    set((s) => ({ milestones: s.milestones.filter((m) => m.id !== id) }));
    persist(
      () => apiClient.delete("/api/milestones", { id }),
      () => set({ milestones: prev }),
    );
  },

  // ============================================================
  // TASKS
  // ============================================================

  addTask: (t) => {
    const id = `task-${uuid().slice(0, 8)}`;
    const order = get().tasks.filter((x) => x.projectId === t.projectId).length;
    const task: Task = {
      ...t, id,
      approvalRequired: t.approvalRequired ?? false,
      approver: t.approver ?? null,
      approvalStatus: "none",
      approvalComment: null,
      approvalRequestedAt: null,
      createdAt: now(), updatedAt: now(), completedAt: null, order,
    };
    set((s) => ({ tasks: [...s.tasks, task] }));
    persist(
      () => apiClient.post("/api/tasks", t),
      () => set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) })),
    );
    return id;
  },

  updateTask: (id, data) => {
    const prev = get().tasks.find((t) => t.id === id);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data, updatedAt: now() } : t)) }));
    persist(
      () => apiClient.patch(`/api/tasks/${id}`, data),
      () => { if (prev) set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? prev : t)) })); },
    );
  },

  deleteTask: (id) => {
    const prev = get().tasks;
    set((s) => ({
      tasks: s.tasks.filter((t) => t.id !== id).map((t) => ({
        ...t,
        dependencies: t.dependencies.filter((d) => d !== id),
        dependents: t.dependents.filter((d) => d !== id),
      })),
    }));
    persist(
      () => apiClient.delete(`/api/tasks/${id}`),
      () => set({ tasks: prev }),
    );
  },

  moveTask: (id, status) => {
    const prev = get().tasks.find((t) => t.id === id);
    const completedAt = status === "done" ? now() : null;
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, status, completedAt, updatedAt: now() } : t)) }));
    persist(
      () => apiClient.patch(`/api/tasks/${id}`, { status }),
      () => { if (prev) set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? prev : t)) })); },
    );
  },

  addSubtask: (taskId, title) => {
    const subtask: Subtask = { id: `st-${uuid().slice(0, 8)}`, title, completed: false };
    const prev = get().tasks.find((t) => t.id === taskId);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, subtasks: [...t.subtasks, subtask], updatedAt: now() } : t)) }));
    persist(
      () => apiClient.post(`/api/tasks/${taskId}/subtasks`, { title }),
      () => { if (prev) set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? prev : t)) })); },
    );
  },

  toggleSubtask: (taskId, subtaskId) => {
    const prev = get().tasks.find((t) => t.id === taskId);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, subtasks: t.subtasks.map((st) => (st.id === subtaskId ? { ...st, completed: !st.completed } : st)), updatedAt: now() } : t)) }));
    persist(
      () => apiClient.patch(`/api/tasks/${taskId}/subtasks`, { subtaskId }),
      () => { if (prev) set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? prev : t)) })); },
    );
  },

  addDependency: (taskId, dependsOnId) => {
    const prev = get().tasks;
    set((s) => ({ tasks: s.tasks.map((t) => {
      if (t.id === taskId && !t.dependencies.includes(dependsOnId)) return { ...t, dependencies: [...t.dependencies, dependsOnId], updatedAt: now() };
      if (t.id === dependsOnId && !t.dependents.includes(taskId)) return { ...t, dependents: [...t.dependents, taskId], updatedAt: now() };
      return t;
    }) }));
    persist(
      () => apiClient.post(`/api/tasks/${taskId}/dependencies`, { dependsOnId }),
      () => set({ tasks: prev }),
    );
  },

  removeDependency: (taskId, dependsOnId) => {
    const prev = get().tasks;
    set((s) => ({ tasks: s.tasks.map((t) => {
      if (t.id === taskId) return { ...t, dependencies: t.dependencies.filter((d) => d !== dependsOnId), updatedAt: now() };
      if (t.id === dependsOnId) return { ...t, dependents: t.dependents.filter((d) => d !== taskId), updatedAt: now() };
      return t;
    }) }));
    persist(
      () => apiClient.delete(`/api/tasks/${taskId}/dependencies`, { dependsOnId }),
      () => set({ tasks: prev }),
    );
  },

  // ============================================================
  // APPROVALS
  // ============================================================

  requestApproval: (taskId, approver) => {
    const prev = get().tasks.find((t) => t.id === taskId);
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, approvalRequired: true, approver, approvalStatus: "pending" as const, approvalRequestedAt: now(), updatedAt: now() } : t)),
    }));
    const task = get().tasks.find((t) => t.id === taskId);
    if (task) {
      get().addNotification({ title: "Approval requested", message: `"${task.title}" needs your approval`, type: "warning", channel: ["screen", "email"], actionUrl: `/tasks`, projectId: task.projectId, taskId });
    }
    persist(
      () => apiClient.post(`/api/tasks/${taskId}/approval`, { approver }),
      () => { if (prev) set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? prev : t)) })); },
    );
  },

  resolveApproval: (taskId, status, comment) => {
    const prev = get().tasks.find((t) => t.id === taskId);
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, approvalStatus: status, approvalComment: comment || null, updatedAt: now() } : t)),
    }));
    const task = get().tasks.find((t) => t.id === taskId);
    if (task) {
      get().addNotification({ title: status === "approved" ? "Task approved" : "Task rejected", message: `"${task.title}" was ${status}${comment ? `: ${comment}` : ""}`, type: status === "approved" ? "success" : "danger", channel: ["screen", "email"], actionUrl: `/tasks`, projectId: task.projectId, taskId });
    }
    persist(
      () => apiClient.patch(`/api/tasks/${taskId}/approval`, { status, comment }),
      () => { if (prev) set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? prev : t)) })); },
    );
  },

  // ============================================================
  // EVENTS
  // ============================================================

  addEvent: (e) => {
    const id = `evt-${uuid().slice(0, 8)}`;
    set((s) => ({ events: [...s.events, { ...e, id }] }));
    persist(
      () => apiClient.post("/api/calendar", { ...e, id }),
      () => set((s) => ({ events: s.events.filter((x) => x.id !== id) })),
    );
    return id;
  },

  updateEvent: (id, data) => {
    const prev = get().events.find((e) => e.id === id);
    set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...data } : e)) }));
    persist(
      () => apiClient.patch("/api/calendar", { id, ...data }),
      () => { if (prev) set((s) => ({ events: s.events.map((e) => (e.id === id ? prev : e)) })); },
    );
  },

  deleteEvent: (id) => {
    const prev = get().events;
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
    persist(
      () => apiClient.delete("/api/calendar", { id }),
      () => set({ events: prev }),
    );
  },

  // ============================================================
  // FILES
  // ============================================================

  addFile: (f) => {
    const id = `file-${uuid().slice(0, 8)}`;
    set((s) => ({ files: [...s.files, { ...f, id, uploadedAt: now() }] }));
    persist(
      () => apiClient.post("/api/files", f),
      () => set((s) => ({ files: s.files.filter((x) => x.id !== id) })),
    );
    return id;
  },

  deleteFile: (id) => {
    const prev = get().files;
    set((s) => ({ files: s.files.filter((f) => f.id !== id) }));
    persist(
      () => apiClient.delete("/api/files", { id }),
      () => set({ files: prev }),
    );
  },

  // ============================================================
  // TEAM
  // ============================================================

  addTeamMember: (m) => {
    const id = `tm-${uuid().slice(0, 8)}`;
    set((s) => ({ teamMembers: [...s.teamMembers, { ...m, id, joinedAt: now(), lastLoginAt: now() }] }));
    persist(
      () => apiClient.post("/api/team", m),
      () => set((s) => ({ teamMembers: s.teamMembers.filter((x) => x.id !== id) })),
    );
    return id;
  },

  updateTeamMember: (id, data) => {
    const prev = get().teamMembers.find((m) => m.id === id);
    set((s) => ({ teamMembers: s.teamMembers.map((m) => (m.id === id ? { ...m, ...data } : m)) }));
    persist(
      () => apiClient.patch("/api/team", { id, ...data }),
      () => { if (prev) set((s) => ({ teamMembers: s.teamMembers.map((m) => (m.id === id ? prev : m)) })); },
    );
  },

  removeTeamMember: (id) => {
    const prev = get().teamMembers;
    set((s) => ({ teamMembers: s.teamMembers.filter((m) => m.id !== id) }));
    persist(
      () => apiClient.delete("/api/team", { id }),
      () => set({ teamMembers: prev }),
    );
  },

  // ============================================================
  // ACTIVITY LOG
  // ============================================================

  logActivity: (entry) => {
    const id = `al-${uuid().slice(0, 8)}`;
    set((s) => ({ activityLog: [{ ...entry, id, timestamp: now() }, ...s.activityLog] }));
    persist(
      () => apiClient.post("/api/activity", entry),
      () => set((s) => ({ activityLog: s.activityLog.filter((x) => x.id !== id) })),
    );
  },

  // ============================================================
  // CHAT
  // ============================================================

  addChannel: (ch) => {
    const id = `ch-${uuid().slice(0, 8)}`;
    set((s) => ({ chatChannels: [...s.chatChannels, { ...ch, id, createdAt: now() }] }));
    persist(
      () => apiClient.post("/api/chat/channels", ch),
      () => set((s) => ({ chatChannels: s.chatChannels.filter((x) => x.id !== id) })),
    );
    return id;
  },

  deleteChannel: (id) => {
    const prev = { chatChannels: get().chatChannels, chatMessages: get().chatMessages };
    set((s) => ({ chatChannels: s.chatChannels.filter((c) => c.id !== id), chatMessages: s.chatMessages.filter((m) => m.channelId !== id) }));
    persist(
      () => apiClient.delete("/api/chat/channels", { id }),
      () => set(prev),
    );
  },

  sendMessage: (msg) => {
    const id = `msg-${uuid().slice(0, 8)}`;
    set((s) => ({ chatMessages: [...s.chatMessages, { ...msg, id, timestamp: now(), edited: false }] }));
    persist(
      () => apiClient.post("/api/chat/messages", msg),
      () => set((s) => ({ chatMessages: s.chatMessages.filter((x) => x.id !== id) })),
    );
    return id;
  },

  editMessage: (id, content) => {
    const prev = get().chatMessages.find((m) => m.id === id);
    set((s) => ({ chatMessages: s.chatMessages.map((m) => (m.id === id ? { ...m, content, edited: true } : m)) }));
    persist(
      () => apiClient.patch("/api/chat/messages", { id, content }),
      () => { if (prev) set((s) => ({ chatMessages: s.chatMessages.map((m) => (m.id === id ? prev : m)) })); },
    );
  },

  deleteMessage: (id) => {
    const prev = get().chatMessages;
    set((s) => ({ chatMessages: s.chatMessages.filter((m) => m.id !== id) }));
    persist(
      () => apiClient.delete("/api/chat/messages", { id }),
      () => set({ chatMessages: prev }),
    );
  },

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  addNotification: (n) => {
    const notification: Notification = { ...n, id: `notif-${uuid().slice(0, 8)}`, read: false, createdAt: now() };
    set((s) => ({ notifications: [notification, ...s.notifications] }));
    persist(
      () => apiClient.post("/api/notifications", n),
      () => set((s) => ({ notifications: s.notifications.filter((x) => x.id !== notification.id) })),
    );
  },

  markNotificationRead: (id) => {
    const prev = get().notifications.find((n) => n.id === id);
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
    persist(
      () => apiClient.patch("/api/notifications", { id, read: true }),
      () => { if (prev) set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? prev : n)) })); },
    );
  },

  markAllNotificationsRead: () => {
    const prev = get().notifications;
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
    persist(
      () => apiClient.patch("/api/notifications", { markAllRead: true }),
      () => set({ notifications: prev }),
    );
  },

  deleteNotification: (id) => {
    const prev = get().notifications;
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
    persist(
      () => apiClient.delete("/api/notifications", { id }),
      () => set({ notifications: prev }),
    );
  },

  updateNotificationPreferences: (prefs) => {
    const prev = get().notificationPreferences;
    set((s) => ({ notificationPreferences: { ...s.notificationPreferences, ...prefs } }));
    persist(
      () => apiClient.patch("/api/notifications?preferences=true", { preferences: true, ...prefs }),
      () => set({ notificationPreferences: prev }),
    );
  },

  // ============================================================
  // ACTIVATIONS
  // ============================================================

  addActivation: (a) => {
    const id = `act-${uuid().slice(0, 8)}`;
    set((s) => ({ activations: [...s.activations, { ...a, id, createdAt: now(), updatedAt: now() }] }));
    const chId = `ch-${uuid().slice(0, 8)}`;
    set((s) => ({ chatChannels: [...s.chatChannels, { id: chId, projectId: id, name: "general", description: "General activation discussion", createdBy: "", createdAt: now(), isDefault: true }] }));
    persist(
      () => apiClient.post("/api/activations", a),
      () => set((s) => ({
        activations: s.activations.filter((x) => x.id !== id),
        chatChannels: s.chatChannels.filter((x) => x.id !== chId),
      })),
    );
    return id;
  },

  updateActivation: (id, data) => {
    const prev = get().activations.find((a) => a.id === id);
    set((s) => ({ activations: s.activations.map((a) => (a.id === id ? { ...a, ...data, updatedAt: now() } : a)) }));
    persist(
      () => apiClient.patch(`/api/activations/${id}`, data),
      () => { if (prev) set((s) => ({ activations: s.activations.map((a) => (a.id === id ? prev : a)) })); },
    );
  },

  deleteActivation: (id) => {
    const prev = {
      activations: get().activations,
      activationVenues: get().activationVenues,
      activationStakeholders: get().activationStakeholders,
      activationProducts: get().activationProducts,
      activationPersonnel: get().activationPersonnel,
      activationLeads: get().activationLeads,
      activationBudgetItems: get().activationBudgetItems,
      activationDocuments: get().activationDocuments,
      activationChecklists: get().activationChecklists,
      activationIssues: get().activationIssues,
      activationMedia: get().activationMedia,
      activationRunOfShow: get().activationRunOfShow,
      activationReports: get().activationReports,
      chatChannels: get().chatChannels,
      chatMessages: get().chatMessages,
    };
    set((s) => ({
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
    }));
    persist(
      () => apiClient.delete(`/api/activations/${id}`),
      () => set(prev),
    );
  },

  updateActivationPhase: (id, phase) => {
    const prev = get().activations.find((a) => a.id === id);
    set((s) => ({ activations: s.activations.map((a) => (a.id === id ? { ...a, phase, updatedAt: now() } : a)) }));
    const activation = get().activations.find((a) => a.id === id);
    if (activation) {
      get().addNotification({ title: "Phase updated", message: `"${activation.name}" moved to ${phase.replace("_", " ")}`, type: "info", channel: ["screen"], actionUrl: `/activations/${id}`, projectId: null, taskId: null });
    }
    persist(
      () => apiClient.patch(`/api/activations/${id}`, { phase }),
      () => { if (prev) set((s) => ({ activations: s.activations.map((a) => (a.id === id ? prev : a)) })); },
    );
  },

  // ============================================================
  // VENUES
  // ============================================================

  addVenue: (v) => {
    const id = `venue-${uuid().slice(0, 8)}`;
    set((s) => ({ activationVenues: [...s.activationVenues, { ...v, id, createdAt: now(), updatedAt: now() }] }));
    persist(
      () => apiClient.post(`/api/activations/${v.activationId}/venues`, v),
      () => set((s) => ({ activationVenues: s.activationVenues.filter((x) => x.id !== id) })),
    );
    return id;
  },

  updateVenue: (id, data) => {
    const prev = get().activationVenues.find((v) => v.id === id);
    set((s) => ({ activationVenues: s.activationVenues.map((v) => (v.id === id ? { ...v, ...data, updatedAt: now() } : v)) }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/venues`, { id, ...data }),
      () => { if (prev) set((s) => ({ activationVenues: s.activationVenues.map((v) => (v.id === id ? prev : v)) })); },
    );
  },

  deleteVenue: (id) => {
    const prev = get().activationVenues;
    const venue = prev.find((v) => v.id === id);
    set((s) => ({ activationVenues: s.activationVenues.filter((v) => v.id !== id) }));
    persist(
      () => apiClient.delete(`/api/activations/${venue?.activationId}/venues`, { id }),
      () => set({ activationVenues: prev }),
    );
  },

  // ============================================================
  // STAKEHOLDERS
  // ============================================================

  addStakeholder: (s_) => {
    const id = `stk-${uuid().slice(0, 8)}`;
    set((s) => ({ activationStakeholders: [...s.activationStakeholders, { ...s_, id, createdAt: now() }] }));
    persist(
      () => apiClient.post(`/api/activations/${s_.activationId}/stakeholders`, s_),
      () => set((s) => ({ activationStakeholders: s.activationStakeholders.filter((x) => x.id !== id) })),
    );
    return id;
  },

  updateStakeholder: (id, data) => {
    const prev = get().activationStakeholders.find((st) => st.id === id);
    set((s) => ({ activationStakeholders: s.activationStakeholders.map((st) => (st.id === id ? { ...st, ...data } : st)) }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/stakeholders`, { id, ...data }),
      () => { if (prev) set((s) => ({ activationStakeholders: s.activationStakeholders.map((st) => (st.id === id ? prev : st)) })); },
    );
  },

  removeStakeholder: (id) => {
    const prev = get().activationStakeholders;
    const stk = prev.find((st) => st.id === id);
    set((s) => ({ activationStakeholders: s.activationStakeholders.filter((st) => st.id !== id) }));
    persist(
      () => apiClient.delete(`/api/activations/${stk?.activationId}/stakeholders`, { id }),
      () => set({ activationStakeholders: prev }),
    );
  },

  // ============================================================
  // PRODUCTS
  // ============================================================

  addActivationProduct: (p) => {
    const id = `prod-${uuid().slice(0, 8)}`;
    set((s) => ({ activationProducts: [...s.activationProducts, { ...p, id, createdAt: now(), updatedAt: now() }] }));
    persist(
      () => apiClient.post(`/api/activations/${p.activationId}/products`, p),
      () => set((s) => ({ activationProducts: s.activationProducts.filter((x) => x.id !== id) })),
    );
    return id;
  },

  updateActivationProduct: (id, data) => {
    const prev = get().activationProducts.find((p) => p.id === id);
    set((s) => ({ activationProducts: s.activationProducts.map((p) => (p.id === id ? { ...p, ...data, updatedAt: now() } : p)) }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/products`, { id, ...data }),
      () => { if (prev) set((s) => ({ activationProducts: s.activationProducts.map((p) => (p.id === id ? prev : p)) })); },
    );
  },

  deleteActivationProduct: (id) => {
    const prev = get().activationProducts;
    const prod = prev.find((p) => p.id === id);
    set((s) => ({ activationProducts: s.activationProducts.filter((p) => p.id !== id) }));
    persist(
      () => apiClient.delete(`/api/activations/${prod?.activationId}/products`, { id }),
      () => set({ activationProducts: prev }),
    );
  },

  reconcileProduct: (id, used, returned, damaged, reconciledBy) => {
    const prev = get().activationProducts.find((p) => p.id === id);
    set((s) => ({
      activationProducts: s.activationProducts.map((p) => (p.id === id ? { ...p, quantityUsed: used, quantityReturned: returned, quantityDamaged: damaged, reconciledBy, reconciledAt: now(), status: "reconciled" as const, updatedAt: now() } : p)),
    }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/products`, { id, reconcile: true, quantityUsed: used, quantityReturned: returned, quantityDamaged: damaged, reconciledBy }),
      () => { if (prev) set((s) => ({ activationProducts: s.activationProducts.map((p) => (p.id === id ? prev : p)) })); },
    );
  },

  // ============================================================
  // PERSONNEL
  // ============================================================

  addPersonnel: (p) => {
    const id = `pers-${uuid().slice(0, 8)}`;
    set((s) => ({ activationPersonnel: [...s.activationPersonnel, { ...p, id, createdAt: now() }] }));
    persist(
      () => apiClient.post(`/api/activations/${p.activationId}/personnel`, p),
      () => set((s) => ({ activationPersonnel: s.activationPersonnel.filter((x) => x.id !== id) })),
    );
    return id;
  },

  updatePersonnel: (id, data) => {
    const prev = get().activationPersonnel.find((p) => p.id === id);
    set((s) => ({ activationPersonnel: s.activationPersonnel.map((p) => (p.id === id ? { ...p, ...data } : p)) }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/personnel`, { id, ...data }),
      () => { if (prev) set((s) => ({ activationPersonnel: s.activationPersonnel.map((p) => (p.id === id ? prev : p)) })); },
    );
  },

  removePersonnel: (id) => {
    const prev = get().activationPersonnel;
    const pers = prev.find((p) => p.id === id);
    set((s) => ({ activationPersonnel: s.activationPersonnel.filter((p) => p.id !== id) }));
    persist(
      () => apiClient.delete(`/api/activations/${pers?.activationId}/personnel`, { id }),
      () => set({ activationPersonnel: prev }),
    );
  },

  clockIn: (id) => {
    const prev = get().activationPersonnel.find((p) => p.id === id);
    const clockInTime = now();
    set((s) => ({ activationPersonnel: s.activationPersonnel.map((p) => (p.id === id ? { ...p, clockStatus: "clocked_in" as const, clockInTime } : p)) }));
    const person = get().activationPersonnel.find((p) => p.id === id);
    if (person) {
      get().addNotification({ title: "Personnel clocked in", message: `${person.name} clocked in as ${person.role}`, type: "info", channel: ["screen"], actionUrl: null, projectId: null, taskId: null });
    }
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/personnel`, { id, clockStatus: "clocked_in", clockInTime }),
      () => { if (prev) set((s) => ({ activationPersonnel: s.activationPersonnel.map((p) => (p.id === id ? prev : p)) })); },
    );
  },

  clockOut: (id) => {
    const person = get().activationPersonnel.find((p) => p.id === id);
    let totalHoursWorked: number | null = null;
    if (person?.clockInTime) {
      totalHoursWorked = Math.round(((Date.now() - new Date(person.clockInTime).getTime()) / (1000 * 60 * 60)) * 100) / 100;
    }
    const clockOutTime = now();
    set((s) => ({ activationPersonnel: s.activationPersonnel.map((p) => (p.id === id ? { ...p, clockStatus: "clocked_out" as const, clockOutTime, totalHoursWorked } : p)) }));
    if (person) {
      get().addNotification({ title: "Personnel clocked out", message: `${person.name} clocked out (${totalHoursWorked?.toFixed(1) ?? "?"} hours)`, type: "info", channel: ["screen"], actionUrl: null, projectId: null, taskId: null });
    }
    persist(
      () => apiClient.patch(`/api/activations/${person?.activationId}/personnel`, { id, clockStatus: "clocked_out", clockOutTime, totalHoursWorked }),
      () => { if (person) set((s) => ({ activationPersonnel: s.activationPersonnel.map((p) => (p.id === id ? person : p)) })); },
    );
  },

  startBreak: (id) => {
    const prev = get().activationPersonnel.find((p) => p.id === id);
    const breakStartTime = now();
    set((s) => ({ activationPersonnel: s.activationPersonnel.map((p) => (p.id === id ? { ...p, clockStatus: "on_break" as const, breakStartTime } : p)) }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/personnel`, { id, clockStatus: "on_break", breakStartTime }),
      () => { if (prev) set((s) => ({ activationPersonnel: s.activationPersonnel.map((p) => (p.id === id ? prev : p)) })); },
    );
  },

  endBreak: (id) => {
    const prev = get().activationPersonnel.find((p) => p.id === id);
    set((s) => ({ activationPersonnel: s.activationPersonnel.map((p) => (p.id === id ? { ...p, clockStatus: "clocked_in" as const, breakStartTime: null } : p)) }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/personnel`, { id, clockStatus: "clocked_in", breakStartTime: null }),
      () => { if (prev) set((s) => ({ activationPersonnel: s.activationPersonnel.map((p) => (p.id === id ? prev : p)) })); },
    );
  },

  verifyProductKnowledge: (id, score) => {
    const prev = get().activationPersonnel.find((p) => p.id === id);
    const verified = score >= 70;
    const verifiedAt = now();
    set((s) => ({ activationPersonnel: s.activationPersonnel.map((p) => (p.id === id ? { ...p, productKnowledgeVerified: verified, productKnowledgeVerifiedAt: verifiedAt, productKnowledgeScore: score } : p)) }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/personnel`, { id, productKnowledgeVerified: verified, productKnowledgeVerifiedAt: verifiedAt, productKnowledgeScore: score }),
      () => { if (prev) set((s) => ({ activationPersonnel: s.activationPersonnel.map((p) => (p.id === id ? prev : p)) })); },
    );
  },

  // ============================================================
  // LEAD CAPTURE
  // ============================================================

  captureLead: (lead) => {
    const id = `lead-${uuid().slice(0, 8)}`;
    set((s) => ({ activationLeads: [...s.activationLeads, { ...lead, id, capturedAt: now() }] }));
    persist(
      () => apiClient.post(`/api/activations/${lead.activationId}/leads`, lead),
      () => set((s) => ({ activationLeads: s.activationLeads.filter((x) => x.id !== id) })),
    );
    return id;
  },

  updateLead: (id, data) => {
    const prev = get().activationLeads.find((l) => l.id === id);
    set((s) => ({ activationLeads: s.activationLeads.map((l) => (l.id === id ? { ...l, ...data } : l)) }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/leads`, { id, ...data }),
      () => { if (prev) set((s) => ({ activationLeads: s.activationLeads.map((l) => (l.id === id ? prev : l)) })); },
    );
  },

  deleteLead: (id) => {
    const prev = get().activationLeads;
    const lead = prev.find((l) => l.id === id);
    set((s) => ({ activationLeads: s.activationLeads.filter((l) => l.id !== id) }));
    persist(
      () => apiClient.delete(`/api/activations/${lead?.activationId}/leads`, { id }),
      () => set({ activationLeads: prev }),
    );
  },

  // ============================================================
  // BUDGET
  // ============================================================

  addBudgetItem: (b) => {
    const id = `budget-${uuid().slice(0, 8)}`;
    set((s) => ({ activationBudgetItems: [...s.activationBudgetItems, { ...b, id, createdAt: now(), updatedAt: now() }] }));
    persist(
      () => apiClient.post(`/api/activations/${b.activationId}/budget`, b),
      () => set((s) => ({ activationBudgetItems: s.activationBudgetItems.filter((x) => x.id !== id) })),
    );
    return id;
  },

  updateBudgetItem: (id, data) => {
    const prev = get().activationBudgetItems.find((b) => b.id === id);
    set((s) => ({ activationBudgetItems: s.activationBudgetItems.map((b) => (b.id === id ? { ...b, ...data, updatedAt: now() } : b)) }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/budget`, { id, ...data }),
      () => { if (prev) set((s) => ({ activationBudgetItems: s.activationBudgetItems.map((b) => (b.id === id ? prev : b)) })); },
    );
  },

  deleteBudgetItem: (id) => {
    const prev = get().activationBudgetItems;
    const item = prev.find((b) => b.id === id);
    set((s) => ({ activationBudgetItems: s.activationBudgetItems.filter((b) => b.id !== id) }));
    persist(
      () => apiClient.delete(`/api/activations/${item?.activationId}/budget`, { id }),
      () => set({ activationBudgetItems: prev }),
    );
  },

  approveBudgetItem: (id, approvedBy) => {
    const prev = get().activationBudgetItems.find((b) => b.id === id);
    set((s) => ({ activationBudgetItems: s.activationBudgetItems.map((b) => (b.id === id ? { ...b, status: "approved" as const, approvedBy, approvedAt: now(), updatedAt: now() } : b)) }));
    const item = get().activationBudgetItems.find((b) => b.id === id);
    if (item) {
      get().addNotification({ title: "Budget item approved", message: `"${item.description}" approved`, type: "success", channel: ["screen"], actionUrl: null, projectId: null, taskId: null });
    }
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/budget`, { id, approve: true, approvedBy }),
      () => { if (prev) set((s) => ({ activationBudgetItems: s.activationBudgetItems.map((b) => (b.id === id ? prev : b)) })); },
    );
  },

  rejectBudgetItem: (id) => {
    const prev = get().activationBudgetItems.find((b) => b.id === id);
    set((s) => ({ activationBudgetItems: s.activationBudgetItems.map((b) => (b.id === id ? { ...b, status: "rejected" as const, updatedAt: now() } : b)) }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/budget`, { id, reject: true }),
      () => { if (prev) set((s) => ({ activationBudgetItems: s.activationBudgetItems.map((b) => (b.id === id ? prev : b)) })); },
    );
  },

  // ============================================================
  // DOCUMENTS & E-SIGN
  // ============================================================

  addDocument: (d) => {
    const id = `doc-${uuid().slice(0, 8)}`;
    set((s) => ({ activationDocuments: [...s.activationDocuments, { ...d, id, createdAt: now(), updatedAt: now() }] }));
    persist(
      () => apiClient.post(`/api/activations/${d.activationId}/documents`, d),
      () => set((s) => ({ activationDocuments: s.activationDocuments.filter((x) => x.id !== id) })),
    );
    return id;
  },

  updateDocument: (id, data) => {
    const prev = get().activationDocuments.find((d) => d.id === id);
    set((s) => ({ activationDocuments: s.activationDocuments.map((d) => (d.id === id ? { ...d, ...data, updatedAt: now() } : d)) }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/documents`, { id, ...data }),
      () => { if (prev) set((s) => ({ activationDocuments: s.activationDocuments.map((d) => (d.id === id ? prev : d)) })); },
    );
  },

  deleteDocument: (id) => {
    const prev = get().activationDocuments;
    const doc = prev.find((d) => d.id === id);
    set((s) => ({ activationDocuments: s.activationDocuments.filter((d) => d.id !== id) }));
    persist(
      () => apiClient.delete(`/api/activations/${doc?.activationId}/documents`, { id }),
      () => set({ activationDocuments: prev }),
    );
  },

  signDocument: (id, signatureData, signerName, signerEmail) => {
    const doc = get().activationDocuments.find((d) => d.id === id);
    const prev = doc;
    set((s) => ({
      activationDocuments: s.activationDocuments.map((d) => (d.id === id ? { ...d, signStatus: "signed" as const, signatureData, signedAt: now(), signerName, signerEmail, signedBy: d.scopedToStakeholderId, updatedAt: now() } : d)),
    }));
    if (doc?.scopedToStakeholderId) {
      set((s) => ({
        activationStakeholders: s.activationStakeholders.map((st) => (st.id === doc.scopedToStakeholderId ? { ...st, ndaStatus: "signed" as const } : st)),
      }));
    }
    get().addNotification({ title: "Document signed", message: `"${doc?.title ?? "Document"}" signed by ${signerName}`, type: "success", channel: ["screen", "email"], actionUrl: null, projectId: null, taskId: null });
    persist(
      () => apiClient.patch(`/api/activations/${doc?.activationId}/documents`, { id, sign: true, signatureData, signerName, signerEmail }),
      () => { if (prev) set((s) => ({ activationDocuments: s.activationDocuments.map((d) => (d.id === id ? prev : d)) })); },
    );
  },

  // ============================================================
  // CHECKLISTS
  // ============================================================

  addChecklistItem: (c) => {
    const id = `chk-${uuid().slice(0, 8)}`;
    set((s) => ({ activationChecklists: [...s.activationChecklists, { ...c, id }] }));
    persist(
      () => apiClient.post(`/api/activations/${c.activationId}/checklists`, { ...c, id }),
      () => set((s) => ({ activationChecklists: s.activationChecklists.filter((x) => x.id !== id) })),
    );
    return id;
  },

  toggleChecklistItem: (id, completedBy) => {
    const prev = get().activationChecklists.find((c) => c.id === id);
    set((s) => ({
      activationChecklists: s.activationChecklists.map((c) => (c.id === id ? { ...c, completed: !c.completed, completedBy: !c.completed ? completedBy : null, completedAt: !c.completed ? now() : null } : c)),
    }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/checklists`, { id, toggle: true, completedBy }),
      () => { if (prev) set((s) => ({ activationChecklists: s.activationChecklists.map((c) => (c.id === id ? prev : c)) })); },
    );
  },

  deleteChecklistItem: (id) => {
    const prev = get().activationChecklists;
    const item = prev.find((c) => c.id === id);
    set((s) => ({ activationChecklists: s.activationChecklists.filter((c) => c.id !== id) }));
    persist(
      () => apiClient.delete(`/api/activations/${item?.activationId}/checklists`, { id }),
      () => set({ activationChecklists: prev }),
    );
  },

  // ============================================================
  // ISSUES
  // ============================================================

  addIssue: (i) => {
    const id = `issue-${uuid().slice(0, 8)}`;
    set((s) => ({ activationIssues: [...s.activationIssues, { ...i, id, createdAt: now(), updatedAt: now() }] }));
    persist(
      () => apiClient.post(`/api/activations/${i.activationId}/issues`, i),
      () => set((s) => ({ activationIssues: s.activationIssues.filter((x) => x.id !== id) })),
    );
    return id;
  },

  updateIssue: (id, data) => {
    const prev = get().activationIssues.find((i) => i.id === id);
    set((s) => ({ activationIssues: s.activationIssues.map((i) => (i.id === id ? { ...i, ...data, updatedAt: now() } : i)) }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/issues`, { id, ...data }),
      () => { if (prev) set((s) => ({ activationIssues: s.activationIssues.map((i) => (i.id === id ? prev : i)) })); },
    );
  },

  escalateIssue: (id, escalatedTo) => {
    const prev = get().activationIssues.find((i) => i.id === id);
    set((s) => ({ activationIssues: s.activationIssues.map((i) => (i.id === id ? { ...i, status: "escalated" as const, escalatedTo, updatedAt: now() } : i)) }));
    const issue = get().activationIssues.find((i) => i.id === id);
    if (issue) {
      get().addNotification({ title: "Issue escalated", message: `"${issue.title}" escalated to ${escalatedTo}`, type: "warning", channel: ["screen", "email"], actionUrl: null, projectId: null, taskId: null });
    }
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/issues`, { id, escalate: true, escalatedTo }),
      () => { if (prev) set((s) => ({ activationIssues: s.activationIssues.map((i) => (i.id === id ? prev : i)) })); },
    );
  },

  resolveIssue: (id, resolution, resolvedBy) => {
    const prev = get().activationIssues.find((i) => i.id === id);
    set((s) => ({
      activationIssues: s.activationIssues.map((i) => (i.id === id ? { ...i, status: "resolved" as const, resolution, resolvedBy, resolvedAt: now(), updatedAt: now() } : i)),
    }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/issues`, { id, resolve: true, resolution, resolvedBy }),
      () => { if (prev) set((s) => ({ activationIssues: s.activationIssues.map((i) => (i.id === id ? prev : i)) })); },
    );
  },

  // ============================================================
  // MEDIA
  // ============================================================

  addMediaItem: (m) => {
    const id = `media-${uuid().slice(0, 8)}`;
    set((s) => ({ activationMedia: [...s.activationMedia, { ...m, id }] }));
    persist(
      () => apiClient.post(`/api/activations/${m.activationId}/media`, { ...m, id }),
      () => set((s) => ({ activationMedia: s.activationMedia.filter((x) => x.id !== id) })),
    );
    return id;
  },

  updateMediaItem: (id, data) => {
    const prev = get().activationMedia.find((m) => m.id === id);
    set((s) => ({ activationMedia: s.activationMedia.map((m) => (m.id === id ? { ...m, ...data } : m)) }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/media`, { id, ...data }),
      () => { if (prev) set((s) => ({ activationMedia: s.activationMedia.map((m) => (m.id === id ? prev : m)) })); },
    );
  },

  deleteMediaItem: (id) => {
    const prev = get().activationMedia;
    const item = prev.find((m) => m.id === id);
    set((s) => ({ activationMedia: s.activationMedia.filter((m) => m.id !== id) }));
    persist(
      () => apiClient.delete(`/api/activations/${item?.activationId}/media`, { id }),
      () => set({ activationMedia: prev }),
    );
  },

  approveMediaItem: (id, approvedBy) => {
    const prev = get().activationMedia.find((m) => m.id === id);
    set((s) => ({ activationMedia: s.activationMedia.map((m) => (m.id === id ? { ...m, approved: true, approvedBy } : m)) }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/media`, { id, approve: true, approvedBy }),
      () => { if (prev) set((s) => ({ activationMedia: s.activationMedia.map((m) => (m.id === id ? prev : m)) })); },
    );
  },

  // ============================================================
  // RUN OF SHOW
  // ============================================================

  addRunOfShowItem: (r) => {
    const id = `ros-${uuid().slice(0, 8)}`;
    set((s) => ({ activationRunOfShow: [...s.activationRunOfShow, { ...r, id }] }));
    persist(
      () => apiClient.post(`/api/activations/${r.activationId}/run-of-show`, { ...r, id }),
      () => set((s) => ({ activationRunOfShow: s.activationRunOfShow.filter((x) => x.id !== id) })),
    );
    return id;
  },

  updateRunOfShowItem: (id, data) => {
    const prev = get().activationRunOfShow.find((r) => r.id === id);
    set((s) => ({ activationRunOfShow: s.activationRunOfShow.map((r) => (r.id === id ? { ...r, ...data } : r)) }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/run-of-show`, { id, ...data }),
      () => { if (prev) set((s) => ({ activationRunOfShow: s.activationRunOfShow.map((r) => (r.id === id ? prev : r)) })); },
    );
  },

  deleteRunOfShowItem: (id) => {
    const prev = get().activationRunOfShow;
    const item = prev.find((r) => r.id === id);
    set((s) => ({ activationRunOfShow: s.activationRunOfShow.filter((r) => r.id !== id) }));
    persist(
      () => apiClient.delete(`/api/activations/${item?.activationId}/run-of-show`, { id }),
      () => set({ activationRunOfShow: prev }),
    );
  },

  completeRunOfShowItem: (id) => {
    const prev = get().activationRunOfShow.find((r) => r.id === id);
    set((s) => ({ activationRunOfShow: s.activationRunOfShow.map((r) => (r.id === id ? { ...r, completed: true, completedAt: now() } : r)) }));
    persist(
      () => apiClient.patch(`/api/activations/${prev?.activationId}/run-of-show`, { id, complete: true }),
      () => { if (prev) set((s) => ({ activationRunOfShow: s.activationRunOfShow.map((r) => (r.id === id ? prev : r)) })); },
    );
  },

  // ============================================================
  // REPORTS
  // ============================================================

  generateReport: (activationId) => {
    const id = `rpt-${uuid().slice(0, 8)}`;
    const activation = get().activations.find((a) => a.id === activationId);
    const leads = get().activationLeads.filter((l) => l.activationId === activationId);
    const products = get().activationProducts.filter((p) => p.activationId === activationId);
    const budgetItems = get().activationBudgetItems.filter((b) => b.activationId === activationId);
    const totalSamples = products.reduce((sum, p) => sum + p.quantityUsed, 0);
    const totalBudgetSpent = budgetItems.reduce((sum, b) => sum + (b.actualAmount ?? b.estimatedAmount), 0);
    const totalLeads = leads.length;
    const totalInteractions = activation?.interactionGoal ?? 0;
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
    persist(
      () => apiClient.post(`/api/activations/${activationId}/reports`, {}),
      () => set((s) => ({ activationReports: s.activationReports.filter((r) => r.id !== id) })),
    );
    return id;
  },
}));
