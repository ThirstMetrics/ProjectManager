"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { ActivationChecklist, ChecklistCategory } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { Plus, CheckSquare, AlertTriangle } from "lucide-react";

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

const categories: ChecklistCategory[] = ["compliance", "setup", "teardown", "safety", "branding", "product_knowledge"];

const categoryConfig: Record<ChecklistCategory, { label: string; color: string; bg: string }> = {
  compliance: { label: "Compliance", color: "#ef4444", bg: "#fee2e2" },
  setup: { label: "Setup", color: "#0ea5e9", bg: "#e0f2fe" },
  teardown: { label: "Teardown", color: "#f59e0b", bg: "#fef3c7" },
  safety: { label: "Safety", color: "#22c55e", bg: "#dcfce7" },
  branding: { label: "Branding", color: "#6366f1", bg: "#e0e7ff" },
  product_knowledge: { label: "Product Knowledge", color: "#8b5cf6", bg: "#ede9fe" },
};

export function ChecklistPanel({ activationId, checklists }: { activationId: string; checklists: ActivationChecklist[] }) {
  const { toggleChecklistItem, addChecklistItem } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);

  // Add form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ChecklistCategory>("compliance");
  const [required, setRequired] = useState(false);
  const [dueDate, setDueDate] = useState("");

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, ActivationChecklist[]> = {};
    for (const c of checklists) {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    }
    // Sort groups by category order, items by order field
    return Object.entries(groups)
      .sort(([a], [b]) => categories.indexOf(a as ChecklistCategory) - categories.indexOf(b as ChecklistCategory))
      .map(([cat, items]) => ({ category: cat as ChecklistCategory, items: items.sort((a, b) => a.order - b.order) }));
  }, [checklists]);

  const totalDone = checklists.filter((c) => c.completed).length;
  const totalRequired = checklists.filter((c) => c.required).length;
  const requiredDone = checklists.filter((c) => c.required && c.completed).length;
  const pct = checklists.length > 0 ? Math.round((totalDone / checklists.length) * 100) : 0;

  const handleAdd = () => {
    if (!title.trim()) return;
    addChecklistItem({
      activationId, category, title: title.trim(), description: description.trim(),
      required, completed: false, completedBy: null, completedAt: null,
      dueDate: dueDate || null, order: checklists.filter((c) => c.category === category).length,
    });
    setTitle(""); setDescription(""); setCategory("compliance"); setRequired(false); setDueDate("");
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)]">Compliance Checklist</h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            {totalDone}/{checklists.length} complete ({pct}%) — {requiredDone}/{totalRequired} required items done
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={14} className="mr-1" /> Add Item
        </Button>
      </div>

      {/* Overall progress bar */}
      <div className="space-y-1">
        <div className="h-2.5 rounded-full bg-[var(--color-border)]">
          <div className="h-full rounded-full transition-all bg-green-500" style={{ width: `${pct}%` }} />
        </div>
        {requiredDone < totalRequired && (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle size={12} />
            {totalRequired - requiredDone} required items still pending
          </div>
        )}
      </div>

      {/* Category progress chips */}
      <div className="flex gap-2 flex-wrap">
        {grouped.map(({ category: cat, items }) => {
          const conf = categoryConfig[cat];
          const done = items.filter((i) => i.completed).length;
          return (
            <span key={cat} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: conf.bg, color: conf.color }}>
              {conf.label}: {done}/{items.length}
            </span>
          );
        })}
      </div>

      {/* Checklist items grouped by category */}
      {checklists.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <CheckSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p>No checklist items yet</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(({ category: cat, items }) => {
            const conf = categoryConfig[cat];
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: conf.color }} />
                  <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase">{conf.label}</h4>
                </div>
                <div className="space-y-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors group"
                    >
                      <button
                        onClick={() => toggleChecklistItem(item.id, "you")}
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center text-xs shrink-0 cursor-pointer transition-colors",
                          item.completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                        )}
                      >
                        {item.completed && "✓"}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm", item.completed ? "line-through text-[var(--color-text-muted)]" : "text-[var(--color-text-primary)]")}>
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.required && !item.completed && <Badge variant="danger" size="sm">Required</Badge>}
                        {item.dueDate && (
                          <span className="text-xs text-[var(--color-text-muted)]">
                            Due {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {item.completed && item.completedBy && (
                          <span className="text-xs text-[var(--color-text-muted)]">by {item.completedBy}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Checklist Item Modal */}
      {showAdd && (
        <Modal open={true} title="Add Checklist Item" onClose={() => setShowAdd(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Title</label>
              <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Verify liquor license posted" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Description (optional)</label>
              <textarea className={inputClass + " h-16 resize-none"} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional details..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Category</label>
                <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as ChecklistCategory)}>
                  {categories.map((c) => <option key={c} value={c}>{categoryConfig[c].label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Due Date (optional)</label>
                <input className={inputClass} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
              <span className="text-sm text-[var(--color-text-primary)]">Required for compliance</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleAdd} disabled={!title.trim()}>Add Item</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
