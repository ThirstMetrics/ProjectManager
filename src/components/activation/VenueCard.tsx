"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { ActivationVenue, VenueStatus } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { venueStatusConfig, formatCurrency } from "@/lib/utils";
import { MapPin, Phone, Mail, Users, ChevronRight, Edit3, Plus } from "lucide-react";

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

const venueStatusFlow: VenueStatus[] = ["identified", "contacted", "walkthrough_scheduled", "walkthrough_done", "booked"];

const venueTypes = ["hotel", "restaurant", "bar", "nightclub", "outdoor", "convention_center", "retail", "pop_up", "other"] as const;

export function VenueCard({ activationId, venue }: { activationId: string; venue: ActivationVenue | undefined }) {
  const { addVenue, updateVenue } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // Add/Edit form state
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("");
  const [formZip, setFormZip] = useState("");
  const [formContactName, setFormContactName] = useState("");
  const [formContactEmail, setFormContactEmail] = useState("");
  const [formContactPhone, setFormContactPhone] = useState("");
  const [formVenueType, setFormVenueType] = useState("hotel");
  const [formCapacity, setFormCapacity] = useState("");
  const [formBookingCost, setFormBookingCost] = useState("");
  const [formSpecialReqs, setFormSpecialReqs] = useState("");

  // Walkthrough form state
  const [wtDate, setWtDate] = useState("");
  const [wtNotes, setWtNotes] = useState("");

  const openEditForm = () => {
    if (!venue) return;
    setFormName(venue.name);
    setFormAddress(venue.address);
    setFormCity(venue.city);
    setFormState(venue.state);
    setFormZip(venue.zip);
    setFormContactName(venue.contactName);
    setFormContactEmail(venue.contactEmail);
    setFormContactPhone(venue.contactPhone);
    setFormVenueType(venue.venueType);
    setFormCapacity(String(venue.capacity));
    setFormBookingCost(String(venue.bookingCost / 100));
    setFormSpecialReqs(venue.specialRequirements);
    setShowEdit(true);
  };

  const openWalkthroughForm = () => {
    if (!venue) return;
    setWtDate(venue.walkthroughDate ?? "");
    setWtNotes(venue.walkthroughNotes);
    setShowWalkthrough(true);
  };

  const handleAdd = () => {
    if (!formName.trim()) return;
    addVenue({
      activationId, name: formName.trim(), address: formAddress.trim(),
      city: formCity.trim(), state: formState.trim(), zip: formZip.trim(),
      contactName: formContactName.trim(), contactEmail: formContactEmail.trim(),
      contactPhone: formContactPhone.trim(), venueType: formVenueType,
      capacity: parseInt(formCapacity) || 0, status: "identified",
      walkthroughDate: null, walkthroughNotes: "",
      bookingConfirmedAt: null, bookingCost: Math.round(parseFloat(formBookingCost || "0") * 100),
      specialRequirements: formSpecialReqs.trim(),
    });
    setShowAdd(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!venue || !formName.trim()) return;
    updateVenue(venue.id, {
      name: formName.trim(), address: formAddress.trim(),
      city: formCity.trim(), state: formState.trim(), zip: formZip.trim(),
      contactName: formContactName.trim(), contactEmail: formContactEmail.trim(),
      contactPhone: formContactPhone.trim(), venueType: formVenueType,
      capacity: parseInt(formCapacity) || 0,
      bookingCost: Math.round(parseFloat(formBookingCost || "0") * 100),
      specialRequirements: formSpecialReqs.trim(),
    });
    setShowEdit(false);
  };

  const handleWalkthrough = () => {
    if (!venue) return;
    const updates: Partial<ActivationVenue> = { walkthroughNotes: wtNotes.trim() };
    if (wtDate) updates.walkthroughDate = wtDate;
    if (venue.status === "contacted" || venue.status === "identified") {
      updates.status = wtDate ? "walkthrough_scheduled" : venue.status;
    }
    updateVenue(venue.id, updates);
    setShowWalkthrough(false);
  };

  const advanceStatus = () => {
    if (!venue) return;
    const idx = venueStatusFlow.indexOf(venue.status);
    if (idx >= 0 && idx < venueStatusFlow.length - 1) {
      const next = venueStatusFlow[idx + 1];
      const updates: Partial<ActivationVenue> = { status: next };
      if (next === "booked") updates.bookingConfirmedAt = new Date().toISOString();
      updateVenue(venue.id, updates);
    }
  };

  const resetForm = () => {
    setFormName(""); setFormAddress(""); setFormCity(""); setFormState(""); setFormZip("");
    setFormContactName(""); setFormContactEmail(""); setFormContactPhone("");
    setFormVenueType("hotel"); setFormCapacity(""); setFormBookingCost(""); setFormSpecialReqs("");
  };

  if (!venue) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[var(--color-text-primary)]">Venue</h3>
          <Button variant="primary" size="sm" onClick={() => { resetForm(); setShowAdd(true); }}>
            <Plus size={14} className="mr-1" /> Add Venue
          </Button>
        </div>
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <MapPin size={40} className="mx-auto mb-3 opacity-30" />
          <p>No venue assigned yet</p>
        </div>
        {showAdd && <VenueFormModal open={true} title="Add Venue" onClose={() => setShowAdd(false)} onSubmit={handleAdd} submitLabel="Add Venue"
          {...{ formName, setFormName, formAddress, setFormAddress, formCity, setFormCity, formState, setFormState, formZip, setFormZip, formContactName, setFormContactName, formContactEmail, setFormContactEmail, formContactPhone, setFormContactPhone, formVenueType, setFormVenueType, formCapacity, setFormCapacity, formBookingCost, setFormBookingCost, formSpecialReqs, setFormSpecialReqs }} />}
      </div>
    );
  }

  const conf = venueStatusConfig[venue.status];
  const currentIdx = venueStatusFlow.indexOf(venue.status);
  const canAdvance = currentIdx >= 0 && currentIdx < venueStatusFlow.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[var(--color-text-primary)]">Venue</h3>
        <Button variant="ghost" size="sm" onClick={openEditForm}>
          <Edit3 size={14} className="mr-1" /> Edit
        </Button>
      </div>

      {/* Status Pipeline */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {venueStatusFlow.map((status, i) => {
          const sc = venueStatusConfig[status];
          const isCurrent = status === venue.status;
          const isPast = i < currentIdx;
          return (
            <div key={status} className="flex items-center">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: isCurrent ? sc.bg : isPast ? sc.bg : "var(--color-background)",
                  color: isCurrent ? sc.color : isPast ? sc.color : "var(--color-text-muted)",
                  opacity: isCurrent || isPast ? 1 : 0.5,
                  border: isCurrent ? `2px solid ${sc.color}` : "2px solid transparent",
                }}>
                {sc.label}
              </div>
              {i < venueStatusFlow.length - 1 && <ChevronRight size={14} className="text-[var(--color-text-muted)] mx-0.5 shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* Venue Details Card */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{venue.name}</h3>
            <p className="text-sm text-[var(--color-text-muted)]">{venue.address}, {venue.city}, {venue.state} {venue.zip}</p>
          </div>
          <Badge style={{ backgroundColor: conf.bg, color: conf.color }} size="sm">{conf.label}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-start gap-2">
            <Mail size={14} className="text-[var(--color-text-muted)] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">Contact</p>
              <p className="text-sm text-[var(--color-text-primary)]">{venue.contactName}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{venue.contactEmail}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Phone size={14} className="text-[var(--color-text-muted)] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">Phone</p>
              <p className="text-sm text-[var(--color-text-primary)]">{venue.contactPhone || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users size={14} className="text-[var(--color-text-muted)] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">Capacity</p>
              <p className="text-sm text-[var(--color-text-primary)]">{venue.capacity} guests</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">Booking Cost</p>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{formatCurrency(venue.bookingCost)}</p>
            <p className="text-xs text-[var(--color-text-muted)] capitalize">{venue.venueType.replace(/_/g, " ")}</p>
          </div>
        </div>

        {/* Walkthrough Section */}
        <div className="border-t border-[var(--color-border)] pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">Walkthrough</p>
            <button onClick={openWalkthroughForm} className="text-xs text-[var(--color-primary)] hover:underline cursor-pointer">
              {venue.walkthroughDate ? "Update" : "Schedule"}
            </button>
          </div>
          {venue.walkthroughDate ? (
            <div className="space-y-1">
              <p className="text-sm text-[var(--color-text-primary)]">Scheduled: {new Date(venue.walkthroughDate).toLocaleDateString()}</p>
              {venue.walkthroughNotes && <p className="text-sm text-[var(--color-text-muted)] whitespace-pre-wrap">{venue.walkthroughNotes}</p>}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">No walkthrough scheduled</p>
          )}
        </div>

        {venue.specialRequirements && (
          <div className="border-t border-[var(--color-border)] pt-4">
            <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold mb-1">Special Requirements</p>
            <p className="text-sm text-[var(--color-text-primary)]">{venue.specialRequirements}</p>
          </div>
        )}

        {/* Actions */}
        {canAdvance && (
          <div className="border-t border-[var(--color-border)] pt-4 flex justify-end">
            <Button variant="primary" size="sm" onClick={advanceStatus}>
              Advance to {venueStatusConfig[venueStatusFlow[currentIdx + 1]].label}
            </Button>
          </div>
        )}
      </div>

      {/* Edit Venue Modal */}
      {showEdit && <VenueFormModal open={true} title="Edit Venue" onClose={() => setShowEdit(false)} onSubmit={handleEdit} submitLabel="Save Changes"
        {...{ formName, setFormName, formAddress, setFormAddress, formCity, setFormCity, formState, setFormState, formZip, setFormZip, formContactName, setFormContactName, formContactEmail, setFormContactEmail, formContactPhone, setFormContactPhone, formVenueType, setFormVenueType, formCapacity, setFormCapacity, formBookingCost, setFormBookingCost, formSpecialReqs, setFormSpecialReqs }} />}

      {/* Walkthrough Modal */}
      {showWalkthrough && (
        <Modal open={true} title="Schedule Walkthrough" onClose={() => setShowWalkthrough(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Date</label>
              <input className={inputClass} type="date" value={wtDate} onChange={(e) => setWtDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Notes</label>
              <textarea className={inputClass + " h-24 resize-none"} value={wtNotes} onChange={(e) => setWtNotes(e.target.value)} placeholder="Parking info, access codes, questions to ask..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowWalkthrough(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleWalkthrough}>Save</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* Shared venue form modal to avoid duplicating the form fields */
function VenueFormModal({ open, title, onClose, onSubmit, submitLabel,
  formName, setFormName, formAddress, setFormAddress, formCity, setFormCity, formState, setFormState, formZip, setFormZip,
  formContactName, setFormContactName, formContactEmail, setFormContactEmail, formContactPhone, setFormContactPhone,
  formVenueType, setFormVenueType, formCapacity, setFormCapacity, formBookingCost, setFormBookingCost, formSpecialReqs, setFormSpecialReqs,
}: {
  open: boolean; title: string; onClose: () => void; onSubmit: () => void; submitLabel: string;
  formName: string; setFormName: (v: string) => void;
  formAddress: string; setFormAddress: (v: string) => void;
  formCity: string; setFormCity: (v: string) => void;
  formState: string; setFormState: (v: string) => void;
  formZip: string; setFormZip: (v: string) => void;
  formContactName: string; setFormContactName: (v: string) => void;
  formContactEmail: string; setFormContactEmail: (v: string) => void;
  formContactPhone: string; setFormContactPhone: (v: string) => void;
  formVenueType: string; setFormVenueType: (v: string) => void;
  formCapacity: string; setFormCapacity: (v: string) => void;
  formBookingCost: string; setFormBookingCost: (v: string) => void;
  formSpecialReqs: string; setFormSpecialReqs: (v: string) => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Venue Name</label>
          <input className={inputClass} value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="The Grand Ballroom" />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Address</label>
          <input className={inputClass} value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="123 Main St" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">City</label>
            <input className={inputClass} value={formCity} onChange={(e) => setFormCity(e.target.value)} placeholder="Miami" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">State</label>
            <input className={inputClass} value={formState} onChange={(e) => setFormState(e.target.value)} placeholder="FL" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">ZIP</label>
            <input className={inputClass} value={formZip} onChange={(e) => setFormZip(e.target.value)} placeholder="33101" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Venue Type</label>
            <select className={inputClass} value={formVenueType} onChange={(e) => setFormVenueType(e.target.value)}>
              {venueTypes.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Capacity</label>
            <input className={inputClass} type="number" value={formCapacity} onChange={(e) => setFormCapacity(e.target.value)} placeholder="200" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Contact Name</label>
            <input className={inputClass} value={formContactName} onChange={(e) => setFormContactName(e.target.value)} placeholder="Jane Smith" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Email</label>
            <input className={inputClass} type="email" value={formContactEmail} onChange={(e) => setFormContactEmail(e.target.value)} placeholder="jane@venue.com" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Phone</label>
            <input className={inputClass} type="tel" value={formContactPhone} onChange={(e) => setFormContactPhone(e.target.value)} placeholder="(555) 123-4567" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Booking Cost ($)</label>
          <input className={inputClass} type="number" step="0.01" value={formBookingCost} onChange={(e) => setFormBookingCost(e.target.value)} placeholder="5000.00" />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Special Requirements</label>
          <textarea className={inputClass + " h-20 resize-none"} value={formSpecialReqs} onChange={(e) => setFormSpecialReqs(e.target.value)} placeholder="AV equipment, power outlets near bar area..." />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={onSubmit} disabled={!formName.trim()}>{submitLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}
