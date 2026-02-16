"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { ActivationProduct, ProductInventoryStatus } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { productStatusConfig, formatCurrency } from "@/lib/utils";
import { Package, Plus, ClipboardCheck, Truck } from "lucide-react";

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

const statusSteps: ProductInventoryStatus[] = ["requested", "confirmed", "shipped", "delivered", "in_use", "reconciled"];

export function ProductInventoryTable({ activationId, products }: { activationId: string; products: ActivationProduct[] }) {
  const { addActivationProduct, updateActivationProduct, reconcileProduct } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [reconcileId, setReconcileId] = useState<string | null>(null);

  // Add product form state
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("beverage");
  const [qty, setQty] = useState("");
  const [unitCost, setUnitCost] = useState("");

  // Reconcile form state
  const [recUsed, setRecUsed] = useState("");
  const [recReturned, setRecReturned] = useState("");
  const [recDamaged, setRecDamaged] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    addActivationProduct({
      activationId, name: name.trim(), sku: sku.trim(), category,
      quantityRequested: parseInt(qty) || 0, quantityConfirmed: 0, quantityShipped: 0,
      quantityDelivered: 0, quantityUsed: 0, quantityReturned: 0, quantityDamaged: 0,
      unitCost: Math.round(parseFloat(unitCost || "0") * 100),
      status: "requested", shippingTrackingNumber: "", shippingCarrier: "",
      expectedDeliveryDate: null, deliveredAt: null, reconciledAt: null, reconciledBy: null, notes: "",
    });
    setName(""); setSku(""); setCategory("beverage"); setQty(""); setUnitCost("");
    setShowAdd(false);
  };

  const handleReconcile = () => {
    if (!reconcileId) return;
    reconcileProduct(reconcileId, parseInt(recUsed) || 0, parseInt(recReturned) || 0, parseInt(recDamaged) || 0, "you");
    setReconcileId(null); setRecUsed(""); setRecReturned(""); setRecDamaged("");
  };

  const advanceStatus = (product: ActivationProduct) => {
    const idx = statusSteps.indexOf(product.status);
    if (idx < statusSteps.length - 1 && statusSteps[idx + 1] !== "reconciled") {
      const next = statusSteps[idx + 1];
      const updates: Partial<ActivationProduct> = { status: next };
      if (next === "confirmed") updates.quantityConfirmed = product.quantityRequested;
      if (next === "shipped") updates.quantityShipped = product.quantityConfirmed;
      if (next === "delivered") { updates.quantityDelivered = product.quantityShipped; updates.deliveredAt = new Date().toISOString(); }
      if (next === "in_use") updates.quantityUsed = 0;
      updateActivationProduct(product.id, updates);
    }
  };

  const totalValue = products.reduce((sum, p) => sum + p.quantityRequested * p.unitCost, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)]">Products & Inventory</h3>
          <p className="text-xs text-[var(--color-text-muted)]">{products.length} products — {formatCurrency(totalValue)} total value</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={14} className="mr-1" /> Add Product
        </Button>
      </div>

      {/* Status summary */}
      <div className="flex gap-2 flex-wrap">
        {statusSteps.map((status) => {
          const count = products.filter((p) => p.status === status).length;
          const conf = productStatusConfig[status];
          return (
            <span key={status} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: conf.bg, color: conf.color }}>
              {conf.label}: {count}
            </span>
          );
        })}
      </div>

      {/* Products table */}
      {products.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p>No products added yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Product</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">SKU</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Req</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Conf</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Ship</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Dlvr</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Used</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Status</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const conf = productStatusConfig[p.status];
                return (
                  <tr key={p.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]">
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-[var(--color-text-primary)]">{p.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{p.category} — {formatCurrency(p.unitCost)}/unit</p>
                    </td>
                    <td className="py-2.5 px-3 text-[var(--color-text-muted)] font-mono text-xs">{p.sku || "—"}</td>
                    <td className="py-2.5 px-3 text-center text-[var(--color-text-primary)]">{p.quantityRequested}</td>
                    <td className="py-2.5 px-3 text-center text-[var(--color-text-primary)]">{p.quantityConfirmed || "—"}</td>
                    <td className="py-2.5 px-3 text-center text-[var(--color-text-primary)]">{p.quantityShipped || "—"}</td>
                    <td className="py-2.5 px-3 text-center text-[var(--color-text-primary)]">{p.quantityDelivered || "—"}</td>
                    <td className="py-2.5 px-3 text-center text-[var(--color-text-primary)]">{p.quantityUsed || "—"}</td>
                    <td className="py-2.5 px-3">
                      <Badge style={{ backgroundColor: conf.bg, color: conf.color }} size="sm">{conf.label}</Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1">
                      {p.status !== "reconciled" && p.status !== "in_use" && (
                        <button onClick={() => advanceStatus(p)} className="text-xs text-[var(--color-primary)] hover:underline cursor-pointer">
                          <Truck size={13} className="inline mr-0.5" />Advance
                        </button>
                      )}
                      {(p.status === "in_use" || p.status === "delivered") && (
                        <button onClick={() => { setReconcileId(p.id); setRecUsed(""); setRecReturned(""); setRecDamaged(""); }} className="text-xs text-[var(--color-primary)] hover:underline cursor-pointer">
                          <ClipboardCheck size={13} className="inline mr-0.5" />Reconcile
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {showAdd && (
        <Modal open={true} title="Add Product" onClose={() => setShowAdd(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Product Name</label>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Brand X Brut Champagne 750ml" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">SKU</label>
                <input className={inputClass} value={sku} onChange={(e) => setSku(e.target.value)} placeholder="BX-BRUT-750" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Category</label>
                <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="beverage">Beverage</option>
                  <option value="merchandise">Merchandise</option>
                  <option value="sample">Sample</option>
                  <option value="display">Display</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Quantity</label>
                <input className={inputClass} type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="120" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Unit Cost ($)</label>
                <input className={inputClass} type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="28.00" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleAdd} disabled={!name.trim()}>Add Product</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reconcile Modal */}
      {reconcileId && (
        <Modal open={true} title="Reconcile Product" onClose={() => setReconcileId(null)}>
          <div className="space-y-3">
            <p className="text-sm text-[var(--color-text-muted)]">Enter final quantities after the activation event.</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Used/Distributed</label>
                <input className={inputClass} type="number" value={recUsed} onChange={(e) => setRecUsed(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Returned</label>
                <input className={inputClass} type="number" value={recReturned} onChange={(e) => setRecReturned(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Damaged/Lost</label>
                <input className={inputClass} type="number" value={recDamaged} onChange={(e) => setRecDamaged(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setReconcileId(null)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleReconcile}>Reconcile</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
