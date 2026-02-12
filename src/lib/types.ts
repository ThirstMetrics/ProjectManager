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
