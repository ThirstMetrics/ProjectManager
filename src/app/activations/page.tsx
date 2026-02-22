"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Zap, Plus } from "lucide-react";
import Link from "next/link";
import { formatDate, activationPhaseConfig } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { NewActivationModal } from "@/components/activation/NewActivationModal";

export default function ActivationsPage() {
  const allActivations = useAppStore((s) => s.activations);
  const activations = useMemo(() => allActivations, [allActivations]);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <AppShell title="Activations">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Activations</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Manage brand activations and event campaigns</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} className="mr-1.5" /> New Activation
          </Button>
        </div>

        {/* Grid */}
        {activations.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-text-muted)]">
            <Zap size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No activations yet</p>
            <p className="text-sm mt-1">Create your first brand activation to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activations.map((a) => {
              const phaseConf = activationPhaseConfig[a.phase];
              const budgetPct = a.budgetTotal > 0 ? Math.round((a.budgetSpent / a.budgetTotal) * 100) : 0;
              return (
                <Link
                  key={a.id}
                  href={`/activations/${a.id}`}
                  className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 no-underline transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                      <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase">{a.brand}</span>
                    </div>
                    <Badge style={{ backgroundColor: phaseConf.bg, color: phaseConf.color }} size="sm">
                      {phaseConf.label}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-2 line-clamp-2">{a.name}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mb-4 line-clamp-2">{a.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-[var(--color-text-muted)]">Event</p>
                      <p className="font-medium text-[var(--color-text-primary)]">{formatDate(a.eventDate)}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-text-muted)]">Budget</p>
                      <p className="font-medium text-[var(--color-text-primary)]">{budgetPct}% used</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-text-muted)]">Goal</p>
                      <p className="font-medium text-[var(--color-text-primary)]">{a.leadGoal} leads</p>
                    </div>
                  </div>
                  {/* Budget bar */}
                  <div className="mt-3 h-1.5 rounded-full bg-[var(--color-border)]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(budgetPct, 100)}%`, backgroundColor: a.color }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Create Activation Modal */}
        <NewActivationModal open={showCreate} onClose={() => setShowCreate(false)} />
      </div>
    </AppShell>
  );
}
