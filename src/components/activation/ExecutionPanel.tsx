"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  ActivationPersonnel, ActivationRunOfShow, ActivationLeadCapture,
  ActivationIssue, LeadSource, IssueCategory, IssueSeverity,
} from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  personnelClockConfig, issueSeverityConfig, issueStatusConfig,
  formatDateTime, relativeDate,
} from "@/lib/utils";
import {
  Clock, Play, Pause, Square, UserCheck, AlertTriangle,
  Plus, CheckCircle, Phone, Mail, AtSign,
} from "lucide-react";
import { TimelineView } from "./TimelineView";

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

export function ExecutionPanel({
  activationId, personnel, runOfShow, leads, issues,
}: {
  activationId: string;
  personnel: ActivationPersonnel[];
  runOfShow: ActivationRunOfShow[];
  leads: ActivationLeadCapture[];
  issues: ActivationIssue[];
}) {
  const store = useAppStore();
  const [section, setSection] = useState<"timeline" | "clock" | "leads" | "issues">("timeline");
  const [showCaptureLead, setShowCaptureLead] = useState(false);
  const [showReportIssue, setShowReportIssue] = useState(false);

  // Lead capture form
  const [leadFirst, setLeadFirst] = useState("");
  const [leadLast, setLeadLast] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadIG, setLeadIG] = useState("");
  const [leadX, setLeadX] = useState("");
  const [leadSource, setLeadSource] = useState<LeadSource>("walk_in");
  const [leadConsent, setLeadConsent] = useState(false);

  // Issue form
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDesc, setIssueDesc] = useState("");
  const [issueCat, setIssueCat] = useState<IssueCategory>("other");
  const [issueSev, setIssueSev] = useState<IssueSeverity>("medium");

  const handleCapture = () => {
    if (!leadFirst.trim()) return;
    store.captureLead({
      activationId, capturedBy: "you", firstName: leadFirst.trim(), lastName: leadLast.trim(),
      email: leadEmail.trim(), phone: leadPhone.trim(), instagramHandle: leadIG.trim(), xHandle: leadX.trim(),
      source: leadSource, consentGiven: leadConsent, consentTimestamp: leadConsent ? new Date().toISOString() : null,
      consentText: "I consent to being contacted about Brand X products and promotions.",
      notes: "", tags: [],
    });
    setLeadFirst(""); setLeadLast(""); setLeadEmail(""); setLeadPhone("");
    setLeadIG(""); setLeadX(""); setLeadSource("walk_in"); setLeadConsent(false);
    setShowCaptureLead(false);
  };

  const handleReportIssue = () => {
    if (!issueTitle.trim()) return;
    store.addIssue({
      activationId, reportedBy: "you", reportedByPersonnelId: null,
      category: issueCat, severity: issueSev, status: "open",
      title: issueTitle.trim(), description: issueDesc.trim(),
      resolution: "", resolvedBy: null, resolvedAt: null, escalatedTo: null, photos: [],
    });
    setIssueTitle(""); setIssueDesc(""); setIssueCat("other"); setIssueSev("medium");
    setShowReportIssue(false);
  };

  const sectionButtons = [
    { key: "timeline" as const, label: "Run of Show", icon: Clock },
    { key: "clock" as const, label: "Personnel", icon: UserCheck },
    { key: "leads" as const, label: `Leads (${leads.length})`, icon: AtSign },
    { key: "issues" as const, label: `Issues (${issues.length})`, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-[var(--color-text-primary)]">Execution — Day of Event</h3>

      {/* Section toggle */}
      <div className="flex gap-1 bg-[var(--color-background)] rounded-lg p-1 overflow-x-auto">
        {sectionButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setSection(btn.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              section === btn.key
                ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <btn.icon size={14} /> {btn.label}
          </button>
        ))}
      </div>

      {/* Run of Show */}
      {section === "timeline" && (
        <TimelineView activationId={activationId} runOfShow={runOfShow} />
      )}

      {/* Personnel Clock In/Out */}
      {section === "clock" && (
        <div className="space-y-2">
          {personnel.length === 0 ? (
            <p className="text-center py-8 text-[var(--color-text-muted)]">No personnel assigned.</p>
          ) : (
            personnel.map((p) => {
              const clockConf = personnelClockConfig[p.clockStatus];
              return (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-secondary-light)] flex items-center justify-center text-xs font-bold text-[var(--color-secondary)]">
                    {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[var(--color-text-primary)]">{p.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{p.role}
                      {p.clockInTime && ` — In: ${formatDateTime(p.clockInTime)}`}
                      {p.totalHoursWorked !== null && ` — ${p.totalHoursWorked.toFixed(1)}h`}
                    </p>
                  </div>
                  <Badge style={{ backgroundColor: clockConf.bg, color: clockConf.color }} size="sm">{clockConf.label}</Badge>
                  <div className="flex gap-1">
                    {p.clockStatus === "not_started" && (
                      <Button variant="primary" size="sm" onClick={() => store.clockIn(p.id)}><Play size={12} className="mr-1" />Clock In</Button>
                    )}
                    {p.clockStatus === "clocked_in" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => store.startBreak(p.id)}><Pause size={12} className="mr-1" />Break</Button>
                        <Button variant="danger" size="sm" onClick={() => store.clockOut(p.id)}><Square size={12} className="mr-1" />Out</Button>
                      </>
                    )}
                    {p.clockStatus === "on_break" && (
                      <Button variant="primary" size="sm" onClick={() => store.endBreak(p.id)}><Play size={12} className="mr-1" />Resume</Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {/* Product Knowledge Status */}
          <div className="mt-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <h4 className="font-semibold text-sm text-[var(--color-text-primary)] mb-2">Product Knowledge</h4>
            {personnel.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-[var(--color-text-primary)]">{p.name}</span>
                {p.productKnowledgeVerified ? (
                  <Badge variant="success" size="sm">Verified ({p.productKnowledgeScore}%)</Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => store.verifyProductKnowledge(p.id, 85)}>
                    <UserCheck size={12} className="mr-1" />Verify
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lead Capture */}
      {section === "leads" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setShowCaptureLead(true)}>
              <Plus size={14} className="mr-1" /> Capture Lead
            </Button>
          </div>
          {leads.length === 0 ? (
            <p className="text-center py-8 text-[var(--color-text-muted)]">No leads captured yet. Start capturing during the event.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Name</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Contact</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Social</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Source</th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Consent</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-b border-[var(--color-border)]">
                      <td className="py-2 px-3 text-[var(--color-text-primary)] font-medium">{l.firstName} {l.lastName}</td>
                      <td className="py-2 px-3 text-[var(--color-text-muted)]">
                        {l.email && <span className="flex items-center gap-1"><Mail size={11} />{l.email}</span>}
                        {l.phone && <span className="flex items-center gap-1"><Phone size={11} />{l.phone}</span>}
                      </td>
                      <td className="py-2 px-3 text-[var(--color-text-muted)] text-xs">
                        {l.instagramHandle && <span>@{l.instagramHandle} </span>}
                        {l.xHandle && <span>𝕏 @{l.xHandle}</span>}
                      </td>
                      <td className="py-2 px-3"><Badge size="sm">{l.source.replace(/_/g, " ")}</Badge></td>
                      <td className="py-2 px-3 text-center">{l.consentGiven ? <CheckCircle size={14} className="text-green-500 mx-auto" /> : <span className="text-red-400">—</span>}</td>
                      <td className="py-2 px-3 text-xs text-[var(--color-text-muted)]">{relativeDate(l.capturedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Issues */}
      {section === "issues" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button variant="danger" size="sm" onClick={() => setShowReportIssue(true)}>
              <AlertTriangle size={14} className="mr-1" /> Report Issue
            </Button>
          </div>
          {issues.length === 0 ? (
            <p className="text-center py-8 text-[var(--color-text-muted)]">No issues reported. Let&apos;s keep it that way.</p>
          ) : (
            <div className="space-y-2">
              {issues.map((issue) => {
                const sevConf = issueSeverityConfig[issue.severity];
                const statConf = issueStatusConfig[issue.status];
                return (
                  <div key={issue.id} className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge style={{ backgroundColor: sevConf.bg, color: sevConf.color }} size="sm">{sevConf.label}</Badge>
                      <Badge style={{ backgroundColor: statConf.bg, color: statConf.color }} size="sm">{statConf.label}</Badge>
                      <span className="font-medium text-sm text-[var(--color-text-primary)]">{issue.title}</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">{issue.description}</p>
                    {issue.status === "open" && (
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" onClick={() => store.escalateIssue(issue.id, "Jake Rivera")}>Escalate</Button>
                        <Button variant="primary" size="sm" onClick={() => store.resolveIssue(issue.id, "Resolved on-site", "you")}>Resolve</Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Capture Lead Modal */}
      {showCaptureLead && (
        <Modal open={true} title="Capture Lead" onClose={() => setShowCaptureLead(false)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">First Name</label>
                <input className={inputClass} value={leadFirst} onChange={(e) => setLeadFirst(e.target.value)} placeholder="Jane" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Last Name</label>
                <input className={inputClass} value={leadLast} onChange={(e) => setLeadLast(e.target.value)} placeholder="Doe" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Email</label>
                <input className={inputClass} type="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Phone</label>
                <input className={inputClass} type="tel" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Instagram Handle</label>
                <input className={inputClass} value={leadIG} onChange={(e) => setLeadIG(e.target.value)} placeholder="janedoe" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">X Handle</label>
                <input className={inputClass} value={leadX} onChange={(e) => setLeadX(e.target.value)} placeholder="janedoe" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Source</label>
              <select className={inputClass} value={leadSource} onChange={(e) => setLeadSource(e.target.value as LeadSource)}>
                <option value="walk_in">Walk-in</option>
                <option value="instagram">Instagram</option>
                <option value="x">X (Twitter)</option>
                <option value="qr_code">QR Code</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="other">Other</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={leadConsent} onChange={(e) => setLeadConsent(e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm text-[var(--color-text-primary)]">Person consents to being contacted about Brand X products and promotions</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowCaptureLead(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleCapture} disabled={!leadFirst.trim()}>Capture Lead</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Report Issue Modal */}
      {showReportIssue && (
        <Modal open={true} title="Report Issue" onClose={() => setShowReportIssue(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Title</label>
              <input className={inputClass} value={issueTitle} onChange={(e) => setIssueTitle(e.target.value)} placeholder="Product shortage at station 2" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Description</label>
              <textarea className={inputClass + " h-20"} value={issueDesc} onChange={(e) => setIssueDesc(e.target.value)} placeholder="Describe the issue..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Category</label>
                <select className={inputClass} value={issueCat} onChange={(e) => setIssueCat(e.target.value as IssueCategory)}>
                  <option value="product">Product</option>
                  <option value="personnel">Personnel</option>
                  <option value="venue">Venue</option>
                  <option value="equipment">Equipment</option>
                  <option value="safety">Safety</option>
                  <option value="compliance">Compliance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Severity</label>
                <select className={inputClass} value={issueSev} onChange={(e) => setIssueSev(e.target.value as IssueSeverity)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowReportIssue(false)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleReportIssue} disabled={!issueTitle.trim()}>Report Issue</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
