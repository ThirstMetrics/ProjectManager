"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { ActivationBudgetItem, BudgetCategory, Activation } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { budgetCategoryConfig, budgetItemStatusConfig, formatCurrency } from "@/lib/utils";
import { DollarSign, Plus, Check, X } from "lucide-react";

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

const categories: BudgetCategory[] = ["venue", "staffing", "product", "materials", "shipping", "permits", "marketing", "photography", "decor", "catering", "miscellaneous"];

export function BudgetOverview({ activation, budgetItems }: { activation: Activation; budgetItems: ActivationBudgetItem[] }) {
  const { addBudgetItem, approveBudgetItem, rejectBudgetItem, updateBudgetItem } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);

  // Add form state
  const [category, setCategory] = useState<BudgetCategory>("venue");
  const [description, setDescription] = useState("");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");

  const handleAdd = () => {
    if (!description.trim()) return;
    addBudgetItem({
      activationId: activation.id, category, description: description.trim(), vendor: vendor.trim(),
      estimatedAmount: Math.round(parseFloat(amount || "0") * 100), actualAmount: null,
      status: "estimated", approvedBy: null, approvedAt: null, receiptUrl: "", notes: "",
    });
    setCategory("venue"); setDescription(""); setVendor(""); setAmount("");
    setShowAdd(false);
  };

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    return categories.map((cat) => {
      const items = budgetItems.filter((b) => b.category === cat);
      const total = items.reduce((sum, b) => sum + (b.actualAmount ?? b.estimatedAmount), 0);
      return { category: cat, count: items.length, total };
    }).filter((c) => c.count > 0);
  }, [budgetItems]);

  const totalEstimated = budgetItems.reduce((sum, b) => sum + b.estimatedAmount, 0);
  const totalActual = budgetItems.reduce((sum, b) => sum + (b.actualAmount ?? 0), 0);
  const totalPending = budgetItems.filter((b) => b.status === "pending_approval").length;
  const totalApproved = budgetItems.filter((b) => b.status === "approved" || b.status === "paid").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)]">Budget & Compliance</h3>
          <p className="text-xs text-[var(--color-text-muted)]">{budgetItems.length} line items — {totalPending} pending approval</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={14} className="mr-1" /> Add Line Item
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Budget", value: formatCurrency(activation.budgetTotal), color: "#6366f1" },
          { label: "Estimated Spend", value: formatCurrency(totalEstimated), color: "#0ea5e9" },
          { label: "Actual Paid", value: formatCurrency(totalActual), color: "#22c55e" },
          { label: "Remaining", value: formatCurrency(activation.budgetTotal - totalActual), color: activation.budgetTotal - totalActual > 0 ? "#22c55e" : "#ef4444" },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">{card.label}</p>
            <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h4 className="font-semibold text-sm text-[var(--color-text-primary)] mb-3">By Category</h4>
        <div className="space-y-2">
          {categoryBreakdown.map(({ category: cat, count, total }) => {
            const conf = budgetCategoryConfig[cat];
            const pct = totalEstimated > 0 ? Math.round((total / totalEstimated) * 100) : 0;
            return (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs font-medium w-24 text-[var(--color-text-muted)]">{conf.label}</span>
                <div className="flex-1 h-2 rounded-full bg-[var(--color-border)]">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: conf.color }} />
                </div>
                <span className="text-xs font-medium text-[var(--color-text-primary)] w-20 text-right">{formatCurrency(total)}</span>
                <span className="text-xs text-[var(--color-text-muted)] w-10 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Line items table */}
      {budgetItems.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <DollarSign size={40} className="mx-auto mb-3 opacity-30" />
          <p>No budget items yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Description</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Category</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Vendor</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Estimated</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Actual</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Status</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgetItems.map((b) => {
                const statusConf = budgetItemStatusConfig[b.status];
                const catConf = budgetCategoryConfig[b.category];
                return (
                  <tr key={b.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]">
                    <td className="py-2.5 px-3 text-[var(--color-text-primary)]">{b.description}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs font-medium" style={{ color: catConf.color }}>{catConf.label}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[var(--color-text-muted)]">{b.vendor || "—"}</td>
                    <td className="py-2.5 px-3 text-right text-[var(--color-text-primary)] font-mono">{formatCurrency(b.estimatedAmount)}</td>
                    <td className="py-2.5 px-3 text-right text-[var(--color-text-primary)] font-mono">{b.actualAmount !== null ? formatCurrency(b.actualAmount) : "—"}</td>
                    <td className="py-2.5 px-3">
                      <Badge style={{ backgroundColor: statusConf.bg, color: statusConf.color }} size="sm">{statusConf.label}</Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1">
                      {b.status === "estimated" && (
                        <button onClick={() => updateBudgetItem(b.id, { status: "pending_approval" })} className="text-xs text-[var(--color-primary)] hover:underline cursor-pointer">Submit</button>
                      )}
                      {b.status === "pending_approval" && (
                        <>
                          <button onClick={() => approveBudgetItem(b.id, "you")} className="text-xs text-green-600 hover:underline cursor-pointer"><Check size={13} className="inline" /> Approve</button>
                          <button onClick={() => rejectBudgetItem(b.id)} className="text-xs text-red-500 hover:underline cursor-pointer ml-2"><X size={13} className="inline" /> Reject</button>
                        </>
                      )}
                      {b.status === "approved" && (
                        <button onClick={() => updateBudgetItem(b.id, { status: "paid", actualAmount: b.estimatedAmount })} className="text-xs text-[var(--color-primary)] hover:underline cursor-pointer">Mark Paid</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Line Item Modal */}
      {showAdd && (
        <Modal open={true} title="Add Budget Line Item" onClose={() => setShowAdd(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Description</label>
              <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Event photography & videography" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Category</label>
                <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as BudgetCategory)}>
                  {categories.map((c) => <option key={c} value={c}>{budgetCategoryConfig[c].label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Vendor</label>
                <input className={inputClass} value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="PhotoPro Studios" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Estimated Amount ($)</label>
              <input className={inputClass} type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1,500.00" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleAdd} disabled={!description.trim()}>Add Item</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
