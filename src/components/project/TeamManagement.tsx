"use client";

import { useAppStore } from "@/lib/store";
import { useMemo, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { UserPlus, Shield, Clock, Activity, Trash2, ChevronDown } from "lucide-react";
import { rolePermissions, ProjectRole } from "@/lib/types";
import { relativeDate, getInitials, cn } from "@/lib/utils";
import { InviteMemberModal } from "./InviteMemberModal";

const roleColors: Record<ProjectRole, string> = {
  owner: "#6366f1",
  manager: "#0ea5e9",
  contributor: "#22c55e",
  viewer: "#94a3b8",
};

const statusBadge: Record<string, { variant: "success" | "warning" | "default"; label: string }> = {
  active: { variant: "success", label: "Active" },
  invited: { variant: "warning", label: "Invited" },
  inactive: { variant: "default", label: "Inactive" },
};

export function TeamManagement({ projectId }: { projectId: string }) {
  const allMembers = useAppStore((s) => s.teamMembers);
  const allActivity = useAppStore((s) => s.activityLog);
  const updateTeamMember = useAppStore((s) => s.updateTeamMember);
  const removeTeamMember = useAppStore((s) => s.removeTeamMember);
  const logActivity = useAppStore((s) => s.logActivity);

  const members = useMemo(() => allMembers.filter((m) => m.projectId === projectId), [allMembers, projectId]);
  const activity = useMemo(
    () => allActivity.filter((a) => a.projectId === projectId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20),
    [allActivity, projectId]
  );

  const [showInvite, setShowInvite] = useState(false);
  const [roleDropdown, setRoleDropdown] = useState<string | null>(null);

  const handleRoleChange = (memberId: string, newRole: ProjectRole) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    updateTeamMember(memberId, { role: newRole });
    logActivity({ projectId, memberId: "", memberName: "You", action: "changed role to " + newRole, target: member.name });
    setRoleDropdown(null);
  };

  const handleRemove = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    if (!confirm(`Remove ${member.name} from this project?`)) return;
    removeTeamMember(memberId);
    logActivity({ projectId, memberId: "", memberName: "You", action: "removed", target: member.name });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Team Members</h2>
        <Button size="sm" onClick={() => setShowInvite(true)}>
          <UserPlus size={14} /> Invite Member
        </Button>
      </div>

      {/* Members List */}
      <Card>
        <div className="divide-y divide-[var(--color-border)]">
          {members.map((member) => {
            const rColor = roleColors[member.role];
            const sBadge = statusBadge[member.status];
            return (
              <div key={member.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--color-surface-hover)] transition-colors">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold"
                  style={{ backgroundColor: rColor }}
                >
                  {getInitials(member.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{member.name}</p>
                    <Badge variant={sBadge.variant}>{sBadge.label}</Badge>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{member.email}</p>
                </div>

                {/* Role selector */}
                <div className="relative">
                  <button
                    onClick={() => setRoleDropdown(roleDropdown === member.id ? null : member.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer hover:bg-[var(--color-surface-hover)]"
                    style={{ color: rColor }}
                    disabled={member.role === "owner"}
                  >
                    <Shield size={12} />
                    {rolePermissions[member.role].label}
                    {member.role !== "owner" && <ChevronDown size={10} />}
                  </button>
                  {roleDropdown === member.id && member.role !== "owner" && (
                    <div className="absolute right-0 top-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg z-20 py-1 min-w-[140px]">
                      {(["manager", "contributor", "viewer"] as ProjectRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => handleRoleChange(member.id, r)}
                          className={cn(
                            "w-full text-left px-3 py-2 text-xs hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors",
                            member.role === r ? "font-bold text-[var(--color-primary)]" : "text-[var(--color-text-secondary)]"
                          )}
                        >
                          {rolePermissions[r].label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Last login */}
                <div className="text-right shrink-0 hidden md:block">
                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                    <Clock size={10} />
                    <span>{relativeDate(member.lastLoginAt)}</span>
                  </div>
                </div>

                {/* Remove */}
                {member.role !== "owner" && (
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
          {members.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--color-text-muted)]">No team members yet.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Activity Log */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-[var(--color-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Activity Log</h2>
        </div>
        <Card>
          <CardBody className="p-0">
            {activity.length === 0 ? (
              <div className="text-center py-8 px-5">
                <p className="text-sm text-[var(--color-text-muted)]">No activity recorded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {activity.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-7 h-7 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-[var(--color-primary)]">{getInitials(entry.memberName)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        <span className="font-semibold text-[var(--color-text-primary)]">{entry.memberName}</span>{" "}
                        {entry.action}{" "}
                        <span className="font-medium text-[var(--color-text-primary)]">{entry.target}</span>
                      </p>
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)] shrink-0">{relativeDate(entry.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <InviteMemberModal open={showInvite} onClose={() => setShowInvite(false)} projectId={projectId} />
    </div>
  );
}
