"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { ActivationPersonnel } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { personnelClockConfig } from "@/lib/utils";
import { UserPlus, Users, Clock, Award } from "lucide-react";

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

export function PersonnelList({ activationId, personnel }: { activationId: string; personnel: ActivationPersonnel[] }) {
  const { addPersonnel } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    addPersonnel({
      activationId, stakeholderId: null, name: name.trim(), email: email.trim(), phone: phone.trim(),
      role: role.trim(), clockStatus: "not_started",
      clockInTime: null, clockOutTime: null, breakStartTime: null, totalHoursWorked: null,
      hourlyRate: Math.round(parseFloat(hourlyRate || "0") * 100),
      productKnowledgeVerified: false, productKnowledgeVerifiedAt: null, productKnowledgeScore: null, notes: "",
    });
    setName(""); setEmail(""); setPhone(""); setRole(""); setHourlyRate("");
    setShowAdd(false);
  };

  const clockedIn = personnel.filter((p) => p.clockStatus === "clocked_in").length;
  const verified = personnel.filter((p) => p.productKnowledgeVerified).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)]">Personnel</h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            {personnel.length} staff — {clockedIn} clocked in — {verified} verified
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
          <UserPlus size={14} className="mr-1" /> Add Personnel
        </Button>
      </div>

      {personnel.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>No personnel assigned yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {personnel.map((p) => {
            const clockConf = personnelClockConfig[p.clockStatus];
            return (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors">
                <div className="w-9 h-9 rounded-full bg-[var(--color-secondary-light)] flex items-center justify-center text-xs font-bold text-[var(--color-secondary)] shrink-0">
                  {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[var(--color-text-primary)] truncate">{p.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{p.role}{p.hourlyRate > 0 ? ` — $${(p.hourlyRate / 100).toFixed(2)}/hr` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge style={{ backgroundColor: clockConf.bg, color: clockConf.color }} size="sm">
                    <Clock size={10} className="inline mr-0.5" />
                    {clockConf.label}
                  </Badge>
                  <Badge size="sm" style={{ backgroundColor: p.productKnowledgeVerified ? "#dcfce7" : "#fee2e2", color: p.productKnowledgeVerified ? "#22c55e" : "#ef4444" }}>
                    <Award size={10} className="inline mr-0.5" />
                    {p.productKnowledgeVerified ? `${p.productKnowledgeScore ?? 0}%` : "Unverified"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Personnel Modal */}
      {showAdd && (
        <Modal open={true} title="Add Personnel" onClose={() => setShowAdd(false)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Full Name</label>
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Maria Santos" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Role</label>
                <input className={inputClass} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Brand Ambassador" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Email</label>
                <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="maria@team.com" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Phone</label>
                <input className={inputClass} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 987-6543" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Hourly Rate ($)</label>
              <input className={inputClass} type="number" step="0.01" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="25.00" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleAdd} disabled={!name.trim()}>Add Personnel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
