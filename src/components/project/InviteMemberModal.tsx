"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { ProjectRole, rolePermissions } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export function InviteMemberModal({ open, onClose, projectId }: Props) {
  const addTeamMember = useAppStore((s) => s.addTeamMember);
  const logActivity = useAppStore((s) => s.logActivity);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ProjectRole>("contributor");

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)]";

  const handleInvite = () => {
    if (!name.trim() || !email.trim()) return;
    const id = addTeamMember({
      projectId,
      name: name.trim(),
      email: email.trim(),
      role,
      avatar: null,
      invitedBy: null,
      status: "invited",
    });
    logActivity({
      projectId,
      memberId: "",
      memberName: "You",
      action: "invited",
      target: name.trim(),
    });
    setName("");
    setEmail("");
    setRole("contributor");
    onClose();
  };

  const roles: ProjectRole[] = ["manager", "contributor", "viewer"];

  return (
    <Modal open={open} onClose={onClose} title="Invite Team Member">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Name</label>
          <input className={inputClass} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Email</label>
          <input type="email" className={inputClass} placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Role</label>
          <div className="space-y-2">
            {roles.map((r) => {
              const info = rolePermissions[r];
              return (
                <label
                  key={r}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    role === r
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                      : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                  )}
                >
                  <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{info.label}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{info.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleInvite} disabled={!name.trim() || !email.trim()}>Send Invite</Button>
        </div>
      </div>
    </Modal>
  );
}
