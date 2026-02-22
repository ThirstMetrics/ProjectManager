"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { ActivationStakeholder, StakeholderType, StakeholderNDAStatus, stakeholderPermissions } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ndaStatusConfig } from "@/lib/utils";
import { UserPlus, Users, Shield, Eye, DollarSign, BarChart3 } from "lucide-react";

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

const stakeholderTypes: StakeholderType[] = ["brand", "venue", "distributor", "marketing_agency", "vendor", "personnel", "other"];

const typeColors: Record<StakeholderType, { color: string; bg: string }> = {
  brand: { color: "#6366f1", bg: "#e0e7ff" },
  venue: { color: "#22c55e", bg: "#dcfce7" },
  distributor: { color: "#0ea5e9", bg: "#e0f2fe" },
  marketing_agency: { color: "#ec4899", bg: "#fce7f3" },
  vendor: { color: "#f59e0b", bg: "#fef3c7" },
  personnel: { color: "#8b5cf6", bg: "#ede9fe" },
  other: { color: "#94a3b8", bg: "#f1f5f9" },
};

export function StakeholderList({ activationId, stakeholders }: { activationId: string; stakeholders: ActivationStakeholder[] }) {
  const { addStakeholder, updateStakeholder } = useAppStore();
  const [showInvite, setShowInvite] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Invite form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [type, setType] = useState<StakeholderType>("brand");
  const [role, setRole] = useState("");
  const [ndaRequired, setNdaRequired] = useState(true);
  const [canViewBudget, setCanViewBudget] = useState(false);
  const [canViewLeads, setCanViewLeads] = useState(false);
  const [canViewAllDocs, setCanViewAllDocs] = useState(false);

  // Group stakeholders by type
  const grouped = useMemo(() => {
    const groups: Record<string, ActivationStakeholder[]> = {};
    for (const s of stakeholders) {
      if (!groups[s.type]) groups[s.type] = [];
      groups[s.type].push(s);
    }
    return Object.entries(groups).sort(([a], [b]) => stakeholderTypes.indexOf(a as StakeholderType) - stakeholderTypes.indexOf(b as StakeholderType));
  }, [stakeholders]);

  const resetForm = () => {
    setName(""); setEmail(""); setPhone(""); setCompany(""); setType("brand");
    setRole(""); setNdaRequired(true); setCanViewBudget(false); setCanViewLeads(false); setCanViewAllDocs(false);
  };

  const applyTypeDefaults = (t: StakeholderType) => {
    setType(t);
    const perms = stakeholderPermissions[t];
    setCanViewBudget(perms.defaultCanViewBudget);
    setCanViewLeads(perms.defaultCanViewLeads);
    setCanViewAllDocs(perms.defaultCanViewAllDocuments);
  };

  const handleInvite = () => {
    if (!name.trim()) return;
    addStakeholder({
      activationId, name: name.trim(), email: email.trim(), phone: phone.trim(),
      company: company.trim(), type, role: role.trim(), avatar: null,
      ndaStatus: ndaRequired ? "pending" : "not_required",
      ndaDocumentId: null, canViewBudget, canViewLeads, canViewAllDocuments: canViewAllDocs,
      notes: "", invitedAt: new Date().toISOString(), status: "invited",
    });
    resetForm();
    setShowInvite(false);
  };

  const openEditForm = (s: ActivationStakeholder) => {
    setEditId(s.id);
    setName(s.name); setEmail(s.email); setPhone(s.phone); setCompany(s.company);
    setType(s.type); setRole(s.role);
    setNdaRequired(s.ndaStatus !== "not_required");
    setCanViewBudget(s.canViewBudget); setCanViewLeads(s.canViewLeads); setCanViewAllDocs(s.canViewAllDocuments);
  };

  const handleEdit = () => {
    if (!editId || !name.trim()) return;
    updateStakeholder(editId, {
      name: name.trim(), email: email.trim(), phone: phone.trim(),
      company: company.trim(), type, role: role.trim(),
      canViewBudget, canViewLeads, canViewAllDocuments: canViewAllDocs,
    });
    setEditId(null);
    resetForm();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)]">Stakeholders</h3>
          <p className="text-xs text-[var(--color-text-muted)]">{stakeholders.length} stakeholders across {grouped.length} groups</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => { resetForm(); applyTypeDefaults("brand"); setShowInvite(true); }}>
          <UserPlus size={14} className="mr-1" /> Invite Stakeholder
        </Button>
      </div>

      {/* Type summary */}
      <div className="flex gap-2 flex-wrap">
        {grouped.map(([type, list]) => {
          const tc = typeColors[type as StakeholderType];
          return (
            <span key={type} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: tc.bg, color: tc.color }}>
              {stakeholderPermissions[type as StakeholderType].label}: {list.length}
            </span>
          );
        })}
      </div>

      {/* Grouped stakeholder list */}
      {stakeholders.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>No stakeholders added yet</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([type, list]) => {
            const tc = typeColors[type as StakeholderType];
            const permConf = stakeholderPermissions[type as StakeholderType];
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tc.color }} />
                  <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase">{permConf.label}</h4>
                </div>
                <div className="space-y-2">
                  {list.map((s) => {
                    const ndaConf = ndaStatusConfig[s.ndaStatus];
                    return (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: tc.bg, color: tc.color }}>
                          {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[var(--color-text-primary)] truncate">{s.name}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{s.company} — {s.role}</p>
                        </div>
                        {/* Permission icons */}
                        <div className="flex items-center gap-1.5">
                          {s.canViewBudget && <span title="Can view budget"><DollarSign size={13} className="text-green-500" /></span>}
                          {s.canViewLeads && <span title="Can view leads"><BarChart3 size={13} className="text-blue-500" /></span>}
                          {s.canViewAllDocuments && <span title="Can view all docs"><Eye size={13} className="text-purple-500" /></span>}
                        </div>
                        <Badge style={{ backgroundColor: ndaConf.bg, color: ndaConf.color }} size="sm">
                          <Shield size={10} className="inline mr-0.5" />
                          {ndaConf.label}
                        </Badge>
                        <button onClick={() => openEditForm(s)} className="text-xs text-[var(--color-primary)] hover:underline cursor-pointer">Edit</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Stakeholder Modal */}
      {showInvite && (
        <StakeholderFormModal open={true} title="Invite Stakeholder" onClose={() => { setShowInvite(false); resetForm(); }} onSubmit={handleInvite} submitLabel="Invite"
          {...{ name, setName, email, setEmail, phone, setPhone, company, setCompany, type, role, setRole, ndaRequired, setNdaRequired, canViewBudget, setCanViewBudget, canViewLeads, setCanViewLeads, canViewAllDocs, setCanViewAllDocs }}
          setType={applyTypeDefaults} />
      )}

      {/* Edit Stakeholder Modal */}
      {editId && (
        <StakeholderFormModal open={true} title="Edit Stakeholder" onClose={() => { setEditId(null); resetForm(); }} onSubmit={handleEdit} submitLabel="Save Changes"
          {...{ name, setName, email, setEmail, phone, setPhone, company, setCompany, type, role, setRole, ndaRequired, setNdaRequired, canViewBudget, setCanViewBudget, canViewLeads, setCanViewLeads, canViewAllDocs, setCanViewAllDocs }}
          setType={applyTypeDefaults} />
      )}
    </div>
  );
}

/* Shared form modal */
function StakeholderFormModal({ open, title, onClose, onSubmit, submitLabel,
  name, setName, email, setEmail, phone, setPhone, company, setCompany, type, setType, role, setRole,
  ndaRequired, setNdaRequired, canViewBudget, setCanViewBudget, canViewLeads, setCanViewLeads, canViewAllDocs, setCanViewAllDocs,
}: {
  open: boolean; title: string; onClose: () => void; onSubmit: () => void; submitLabel: string;
  name: string; setName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  company: string; setCompany: (v: string) => void;
  type: StakeholderType; setType: (v: StakeholderType) => void;
  role: string; setRole: (v: string) => void;
  ndaRequired: boolean; setNdaRequired: (v: boolean) => void;
  canViewBudget: boolean; setCanViewBudget: (v: boolean) => void;
  canViewLeads: boolean; setCanViewLeads: (v: boolean) => void;
  canViewAllDocs: boolean; setCanViewAllDocs: (v: boolean) => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Full Name</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jennifer Chen" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Company</label>
            <input className={inputClass} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="PepsiCo" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Email</label>
            <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jennifer@company.com" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Phone</label>
            <input className={inputClass} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Type</label>
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as StakeholderType)}>
              {stakeholderTypes.map((t) => <option key={t} value={t}>{stakeholderPermissions[t].label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Role</label>
            <input className={inputClass} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Brand Manager" />
          </div>
        </div>

        {/* Type description */}
        <div className="bg-[var(--color-background)] rounded-lg p-3 text-xs text-[var(--color-text-muted)]">
          {stakeholderPermissions[type].description}
        </div>

        {/* Permissions */}
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2">Permissions & Access</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={ndaRequired} onChange={(e) => setNdaRequired(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
              <span className="text-sm text-[var(--color-text-primary)]">NDA required</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={canViewBudget} onChange={(e) => setCanViewBudget(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
              <span className="text-sm text-[var(--color-text-primary)]">Can view budget</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={canViewLeads} onChange={(e) => setCanViewLeads(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
              <span className="text-sm text-[var(--color-text-primary)]">Can view leads</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={canViewAllDocs} onChange={(e) => setCanViewAllDocs(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
              <span className="text-sm text-[var(--color-text-primary)]">Can view all documents</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={onSubmit} disabled={!name.trim()}>{submitLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}
