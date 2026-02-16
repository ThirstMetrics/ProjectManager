"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import {
  Activation, ActivationReport, ActivationLeadCapture,
  ActivationProduct, ActivationBudgetItem, ActivationMediaItem,
} from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, Target, DollarSign, Users, FileText } from "lucide-react";

export function ActivationReportPanel({
  activation, reports, leads, products, budgetItems, media,
}: {
  activation: Activation;
  reports: ActivationReport[];
  leads: ActivationLeadCapture[];
  products: ActivationProduct[];
  budgetItems: ActivationBudgetItem[];
  media: ActivationMediaItem[];
}) {
  const { generateReport } = useAppStore();

  // Live metrics
  const totalLeads = leads.length;
  const totalSamples = products.reduce((sum, p) => sum + p.quantityUsed, 0);
  const totalBudgetSpent = budgetItems.reduce((sum, b) => sum + (b.actualAmount ?? 0), 0);
  const costPerLead = totalLeads > 0 ? totalBudgetSpent / totalLeads : 0;
  const costPerSample = totalSamples > 0 ? totalBudgetSpent / totalSamples : 0;

  const leadGoalPct = activation.leadGoal > 0 ? Math.round((totalLeads / activation.leadGoal) * 100) : 0;
  const sampleGoalPct = activation.sampleGoal > 0 ? Math.round((totalSamples / activation.sampleGoal) * 100) : 0;
  const budgetUsedPct = activation.budgetTotal > 0 ? Math.round((totalBudgetSpent / activation.budgetTotal) * 100) : 0;

  const latestReport = reports.length > 0 ? reports[reports.length - 1] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)]">After-Action Report</h3>
          <p className="text-xs text-[var(--color-text-muted)]">{reports.length > 0 ? `${reports.length} report(s) generated` : "No reports generated yet"}</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => generateReport(activation.id)}>
          <FileText size={14} className="mr-1" /> Generate Report
        </Button>
      </div>

      {/* Live ROI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Leads Captured", value: totalLeads.toString(), sub: `${leadGoalPct}% of goal (${activation.leadGoal})`, icon: Users, color: "#22c55e" },
          { label: "Samples Distributed", value: totalSamples.toString(), sub: `${sampleGoalPct}% of goal (${activation.sampleGoal})`, icon: Target, color: "#0ea5e9" },
          { label: "Budget Spent", value: formatCurrency(totalBudgetSpent), sub: `${budgetUsedPct}% of ${formatCurrency(activation.budgetTotal)}`, icon: DollarSign, color: "#f59e0b" },
          { label: "Cost / Lead", value: formatCurrency(Math.round(costPerLead)), sub: totalLeads > 0 ? "active" : "no leads yet", icon: BarChart3, color: "#8b5cf6" },
          { label: "Cost / Sample", value: formatCurrency(Math.round(costPerSample)), sub: totalSamples > 0 ? "active" : "no samples yet", icon: BarChart3, color: "#ec4899" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <m.icon size={16} style={{ color: m.color }} />
              <span className="text-xs text-[var(--color-text-muted)]">{m.label}</span>
            </div>
            <p className="text-xl font-bold text-[var(--color-text-primary)]">{m.value}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Goal Progress */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
        <h4 className="font-semibold text-sm text-[var(--color-text-primary)]">Goal Progress</h4>
        {[
          { label: "Leads", current: totalLeads, goal: activation.leadGoal, color: "#22c55e" },
          { label: "Samples", current: totalSamples, goal: activation.sampleGoal, color: "#0ea5e9" },
          { label: "Interactions", current: 0, goal: activation.interactionGoal, color: "#f59e0b" },
        ].map((g) => {
          const pct = g.goal > 0 ? Math.min(Math.round((g.current / g.goal) * 100), 100) : 0;
          return (
            <div key={g.label} className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--color-text-muted)] w-24">{g.label}</span>
              <div className="flex-1 h-2.5 rounded-full bg-[var(--color-border)]">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: g.color }} />
              </div>
              <span className="text-xs font-medium text-[var(--color-text-primary)] w-24 text-right">{g.current} / {g.goal} ({pct}%)</span>
            </div>
          );
        })}
      </div>

      {/* Generated Report Display */}
      {latestReport && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
          <h4 className="font-semibold text-sm text-[var(--color-text-primary)]">{latestReport.title}</h4>
          <p className="text-sm text-[var(--color-text-muted)]">{latestReport.summary}</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">Total Leads</p>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{latestReport.totalLeads}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">Total Samples</p>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{latestReport.totalSamples}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">Budget Spent</p>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{formatCurrency(latestReport.totalBudgetSpent)}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><p className="text-xs text-[var(--color-text-muted)]">Cost/Lead</p><p className="font-semibold">{formatCurrency(latestReport.costPerLead)}</p></div>
            <div><p className="text-xs text-[var(--color-text-muted)]">Cost/Sample</p><p className="font-semibold">{formatCurrency(latestReport.costPerSample)}</p></div>
            <div><p className="text-xs text-[var(--color-text-muted)]">Cost/Interaction</p><p className="font-semibold">{formatCurrency(latestReport.costPerInteraction)}</p></div>
          </div>
        </div>
      )}

      {/* Media gallery summary */}
      {media.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h4 className="font-semibold text-sm text-[var(--color-text-primary)] mb-3">Media ({media.length})</h4>
          <p className="text-sm text-[var(--color-text-muted)]">{media.filter((m) => m.approved).length} approved, {media.filter((m) => !m.approved).length} pending review</p>
        </div>
      )}
    </div>
  );
}
