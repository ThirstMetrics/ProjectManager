"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { activationPhaseConfig, formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProductInventoryTable } from "@/components/activation/ProductInventoryTable";
import { BudgetOverview } from "@/components/activation/BudgetOverview";
import { DocumentList } from "@/components/activation/DocumentList";
import { ExecutionPanel } from "@/components/activation/ExecutionPanel";
import { ActivationReportPanel } from "@/components/activation/ActivationReportPanel";
import { ChatPanel } from "@/components/project/ChatPanel";

type ActivationTab = "overview" | "venue" | "people" | "products" | "budget" | "documents" | "execution" | "report" | "chat";

const tabs: { key: ActivationTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "venue", label: "Venue" },
  { key: "people", label: "People" },
  { key: "products", label: "Products" },
  { key: "budget", label: "Budget" },
  { key: "documents", label: "Documents" },
  { key: "execution", label: "Execution" },
  { key: "report", label: "Report" },
  { key: "chat", label: "Chat" },
];

export default function ActivationDashboardClient() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<ActivationTab>("overview");

  const allActivations = useAppStore((s) => s.activations);
  const allVenues = useAppStore((s) => s.activationVenues);
  const allStakeholders = useAppStore((s) => s.activationStakeholders);
  const allProducts = useAppStore((s) => s.activationProducts);
  const allPersonnel = useAppStore((s) => s.activationPersonnel);
  const allLeads = useAppStore((s) => s.activationLeads);
  const allBudgetItems = useAppStore((s) => s.activationBudgetItems);
  const allDocuments = useAppStore((s) => s.activationDocuments);
  const allChecklists = useAppStore((s) => s.activationChecklists);
  const allIssues = useAppStore((s) => s.activationIssues);
  const allMedia = useAppStore((s) => s.activationMedia);
  const allRunOfShow = useAppStore((s) => s.activationRunOfShow);
  const allReports = useAppStore((s) => s.activationReports);

  const activation = useMemo(() => allActivations.find((a) => a.id === id), [allActivations, id]);
  const venue = useMemo(() => allVenues.find((v) => v.activationId === id), [allVenues, id]);
  const stakeholders = useMemo(() => allStakeholders.filter((s) => s.activationId === id), [allStakeholders, id]);
  const products = useMemo(() => allProducts.filter((p) => p.activationId === id), [allProducts, id]);
  const personnel = useMemo(() => allPersonnel.filter((p) => p.activationId === id), [allPersonnel, id]);
  const leads = useMemo(() => allLeads.filter((l) => l.activationId === id), [allLeads, id]);
  const budgetItems = useMemo(() => allBudgetItems.filter((b) => b.activationId === id), [allBudgetItems, id]);
  const documents = useMemo(() => allDocuments.filter((d) => d.activationId === id), [allDocuments, id]);
  const checklists = useMemo(() => allChecklists.filter((c) => c.activationId === id), [allChecklists, id]);
  const issues = useMemo(() => allIssues.filter((i) => i.activationId === id), [allIssues, id]);
  const media = useMemo(() => allMedia.filter((m) => m.activationId === id), [allMedia, id]);
  const runOfShow = useMemo(() => allRunOfShow.filter((r) => r.activationId === id), [allRunOfShow, id]);
  const reports = useMemo(() => allReports.filter((r) => r.activationId === id), [allReports, id]);

  if (!activation) {
    return (
      <AppShell title="Activation">
        <div className="p-6 text-center text-[var(--color-text-muted)]">
          <p className="text-lg">Activation not found.</p>
          <Link href="/activations" className="text-[var(--color-primary)] mt-2 inline-block">Back to Activations</Link>
        </div>
      </AppShell>
    );
  }

  const phaseConf = activationPhaseConfig[activation.phase];
  const budgetPct = activation.budgetTotal > 0 ? Math.round((activation.budgetSpent / activation.budgetTotal) * 100) : 0;
  const checklistTotal = checklists.length;
  const checklistDone = checklists.filter((c) => c.completed).length;

  return (
    <AppShell title={activation?.name ?? "Activation"}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link href="/activations" className="mt-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: activation.color }} />
              <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase">{activation.brand}</span>
              <Badge style={{ backgroundColor: phaseConf.bg, color: phaseConf.color }} size="sm">{phaseConf.label}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">{activation.name}</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{activation.description}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[var(--color-border)] overflow-x-auto">
          <div className="flex gap-0 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap",
                  activeTab === tab.key
                    ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                    : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Stakeholders", value: stakeholders.length, color: "#6366f1" },
                { label: "Products", value: products.length, color: "#0ea5e9" },
                { label: "Budget Used", value: `${budgetPct}%`, color: "#f59e0b" },
                { label: "Leads", value: leads.length, color: "#22c55e" },
                { label: "Personnel", value: personnel.length, color: "#ec4899" },
                { label: "Checklist", value: checklistTotal > 0 ? `${Math.round((checklistDone / checklistTotal) * 100)}%` : "0%", color: "#8b5cf6" },
              ].map((tile) => (
                <div key={tile.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">{tile.label}</p>
                  <p className="text-2xl font-bold" style={{ color: tile.color }}>{tile.value}</p>
                </div>
              ))}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Key Dates</h3>
                <div className="space-y-2 text-sm">
                  {activation.setupDate && <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Setup</span><span className="text-[var(--color-text-primary)]">{formatDate(activation.setupDate)}</span></div>}
                  <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Event</span><span className="font-semibold text-[var(--color-text-primary)]">{formatDate(activation.eventDate)}</span></div>
                  {activation.eventEndDate && <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">End</span><span className="text-[var(--color-text-primary)]">{formatDate(activation.eventEndDate)}</span></div>}
                  {activation.teardownDate && <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Teardown</span><span className="text-[var(--color-text-primary)]">{formatDate(activation.teardownDate)}</span></div>}
                </div>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Budget Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Total Budget</span><span className="text-[var(--color-text-primary)]">{formatCurrency(activation.budgetTotal)}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Spent</span><span className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(activation.budgetSpent)}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Remaining</span><span className="text-[var(--color-text-primary)]">{formatCurrency(activation.budgetTotal - activation.budgetSpent)}</span></div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[var(--color-border)]">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(budgetPct, 100)}%`, backgroundColor: activation.color }} />
                </div>
              </div>
            </div>

            {/* Compliance Checklist Progress */}
            {checklistTotal > 0 && (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Checklist Progress</h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-3">{checklistDone} of {checklistTotal} items complete</p>
                <div className="space-y-2">
                  {checklists.slice(0, 6).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <span className={cn("w-4 h-4 rounded border flex items-center justify-center text-xs shrink-0", item.completed ? "bg-green-500 border-green-500 text-white" : "border-[var(--color-border)]")}>
                        {item.completed && "✓"}
                      </span>
                      <span className={cn(item.completed ? "line-through text-[var(--color-text-muted)]" : "text-[var(--color-text-primary)]")}>{item.title}</span>
                      {item.required && !item.completed && <Badge variant="danger" size="sm">Required</Badge>}
                    </div>
                  ))}
                  {checklistTotal > 6 && <p className="text-xs text-[var(--color-text-muted)]">+{checklistTotal - 6} more items</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "venue" && (
          <div className="text-sm text-[var(--color-text-muted)]">
            {venue ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{venue.name}</h3>
                    <p className="text-[var(--color-text-muted)]">{venue.address}, {venue.city}, {venue.state} {venue.zip}</p>
                  </div>
                  <Badge style={{ backgroundColor: "#dcfce7", color: "#22c55e" }} size="sm">{venue.status.replace(/_/g, " ")}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold mb-1">Contact</p><p className="text-[var(--color-text-primary)]">{venue.contactName} — {venue.contactEmail}</p></div>
                  <div><p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold mb-1">Capacity</p><p className="text-[var(--color-text-primary)]">{venue.capacity} guests</p></div>
                  <div><p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold mb-1">Type</p><p className="text-[var(--color-text-primary)] capitalize">{venue.venueType}</p></div>
                  <div><p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold mb-1">Booking Cost</p><p className="text-[var(--color-text-primary)]">{formatCurrency(venue.bookingCost)}</p></div>
                </div>
                {venue.walkthroughNotes && (
                  <div><p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold mb-1">Walkthrough Notes</p><p className="text-[var(--color-text-primary)] whitespace-pre-wrap">{venue.walkthroughNotes}</p></div>
                )}
                {venue.specialRequirements && (
                  <div><p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold mb-1">Special Requirements</p><p className="text-[var(--color-text-primary)]">{venue.specialRequirements}</p></div>
                )}
              </div>
            ) : (
              <p className="text-center py-12">No venue assigned yet.</p>
            )}
          </div>
        )}

        {activeTab === "people" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Stakeholders ({stakeholders.length})</h3>
              {stakeholders.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">No stakeholders added yet.</p>
              ) : (
                <div className="space-y-2">
                  {stakeholders.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-xs font-bold text-[var(--color-primary)]">
                        {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[var(--color-text-primary)] truncate">{s.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{s.company} — {s.role}</p>
                      </div>
                      <Badge size="sm" variant={s.type === "brand" ? "primary" : s.type === "venue" ? "success" : s.type === "vendor" ? "warning" : "default"}>
                        {s.type.replace(/_/g, " ")}
                      </Badge>
                      <Badge size="sm" style={{ backgroundColor: s.ndaStatus === "signed" ? "#dcfce7" : s.ndaStatus === "pending" ? "#fef3c7" : "#f1f5f9", color: s.ndaStatus === "signed" ? "#22c55e" : s.ndaStatus === "pending" ? "#f59e0b" : "#94a3b8" }}>
                        NDA: {s.ndaStatus.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Personnel ({personnel.length})</h3>
              {personnel.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">No personnel assigned yet.</p>
              ) : (
                <div className="space-y-2">
                  {personnel.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-secondary-light)] flex items-center justify-center text-xs font-bold text-[var(--color-secondary)]">
                        {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[var(--color-text-primary)] truncate">{p.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{p.role}</p>
                      </div>
                      <Badge size="sm" style={{ backgroundColor: p.productKnowledgeVerified ? "#dcfce7" : "#fee2e2", color: p.productKnowledgeVerified ? "#22c55e" : "#ef4444" }}>
                        {p.productKnowledgeVerified ? `Verified (${p.productKnowledgeScore}%)` : "Not verified"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <ProductInventoryTable activationId={activation.id} products={products} />
        )}
        {activeTab === "budget" && (
          <BudgetOverview activation={activation} budgetItems={budgetItems} />
        )}
        {activeTab === "documents" && (
          <DocumentList activationId={activation.id} documents={documents} stakeholders={stakeholders} />
        )}
        {activeTab === "execution" && (
          <ExecutionPanel activationId={activation.id} personnel={personnel} runOfShow={runOfShow} leads={leads} issues={issues} />
        )}
        {activeTab === "report" && (
          <ActivationReportPanel activation={activation} reports={reports} leads={leads} products={products} budgetItems={budgetItems} media={media} />
        )}
        {activeTab === "chat" && (
          <div className="h-[600px]">
            <ChatPanel projectId={activation.id} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
