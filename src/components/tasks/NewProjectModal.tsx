"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProjectType } from "@/lib/types";
import themeConfig from "@/theme/theme.config";

const colors = ["#6366f1", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#14b8a6"];

export function NewProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addProject = useAppStore((s) => s.addProject);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProjectType>("general");
  const [color, setColor] = useState(colors[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    const typeInfo = themeConfig.projectTypes.find((t) => t.value === type);
    addProject({
      name: name.trim(),
      description,
      type,
      color,
      icon: typeInfo?.icon || "Folders",
      status: "active",
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : null,
    });
    setName(""); setDescription(""); setType("general"); setColor(colors[0]); setEndDate("");
    onClose();
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

  return (
    <Modal open={open} onClose={onClose} title="New Project">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Name *</label>
          <input className={inputClass} placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Description</label>
          <textarea className={`${inputClass} min-h-[60px] resize-y`} placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as ProjectType)} className={inputClass}>
            {themeConfig.projectTypes.map((pt) => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Color</label>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button key={c} onClick={() => setColor(c)} className="w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110" style={{ backgroundColor: c, outline: color === c ? `3px solid ${c}` : "2px solid transparent", outlineOffset: "2px" }} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Start Date</label>
            <input type="date" className={inputClass} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">End Date</label>
            <input type="date" className={inputClass} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>Create Project</Button>
        </div>
      </div>
    </Modal>
  );
}
