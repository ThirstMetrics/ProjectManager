"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { ActivationPhase, ActivationStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

const brandColors = ["#0d7377", "#6366f1", "#e11d48", "#0ea5e9", "#f59e0b", "#22c55e", "#8b5cf6", "#ec4899"];

export function NewActivationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addActivation } = useAppStore();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(brandColors[0]);
  const [eventDate, setEventDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [setupDate, setSetupDate] = useState("");
  const [teardownDate, setTeardownDate] = useState("");
  const [budgetTotal, setBudgetTotal] = useState("");
  const [leadGoal, setLeadGoal] = useState("");
  const [sampleGoal, setSampleGoal] = useState("");
  const [interactionGoal, setInteractionGoal] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !brand.trim() || !eventDate) return;
    addActivation({
      name: name.trim(),
      brand: brand.trim(),
      description: description.trim(),
      color,
      icon: "",
      phase: "planning" as ActivationPhase,
      status: "draft" as ActivationStatus,
      eventDate,
      eventEndDate: eventEndDate || null,
      setupDate: setupDate || null,
      teardownDate: teardownDate || null,
      venueId: null,
      budgetTotal: Math.round(parseFloat(budgetTotal || "0") * 100),
      budgetSpent: 0,
      leadGoal: parseInt(leadGoal) || 0,
      sampleGoal: parseInt(sampleGoal) || 0,
      interactionGoal: parseInt(interactionGoal) || 0,
      tags: [],
      createdBy: "you",
    });
    onClose();
  };

  return (
    <Modal open={open} title="New Activation" onClose={onClose}>
      <div className="space-y-4">
        {/* Name & Brand */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Activation Name</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Valentine's Champagne Soirée" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Brand</label>
            <input className={inputClass} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="PepsiCo" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Description</label>
          <textarea className={inputClass + " h-16 resize-none"} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Premium champagne tasting event targeting high-end consumers..." />
        </div>

        {/* Color */}
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Brand Color</label>
          <div className="flex gap-2">
            {brandColors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  border: color === c ? "3px solid var(--color-text-primary)" : "3px solid transparent",
                }}
              />
            ))}
          </div>
        </div>

        {/* Dates */}
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2 block">Dates</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Setup</label>
              <input className={inputClass} type="date" value={setupDate} onChange={(e) => setSetupDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Event Start *</label>
              <input className={inputClass} type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Event End</label>
              <input className={inputClass} type="date" value={eventEndDate} onChange={(e) => setEventEndDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Teardown</label>
              <input className={inputClass} type="date" value={teardownDate} onChange={(e) => setTeardownDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Budget & Goals */}
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2 block">Budget & Goals</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Total Budget ($)</label>
              <input className={inputClass} type="number" step="0.01" value={budgetTotal} onChange={(e) => setBudgetTotal(e.target.value)} placeholder="25,000" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Lead Goal</label>
              <input className={inputClass} type="number" value={leadGoal} onChange={(e) => setLeadGoal(e.target.value)} placeholder="200" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Sample Goal</label>
              <input className={inputClass} type="number" value={sampleGoal} onChange={(e) => setSampleGoal(e.target.value)} placeholder="500" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Interaction Goal</label>
              <input className={inputClass} type="number" value={interactionGoal} onChange={(e) => setInteractionGoal(e.target.value)} placeholder="1000" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!name.trim() || !brand.trim() || !eventDate}>
            Create Activation
          </Button>
        </div>
      </div>
    </Modal>
  );
}
