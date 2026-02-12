"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NotificationChannel } from "@/lib/types";
import toast from "react-hot-toast";

const eventTypes = [
  { key: "taskAssigned", label: "Task Assigned" },
  { key: "taskCompleted", label: "Task Completed" },
  { key: "taskOverdue", label: "Task Overdue" },
  { key: "eventReminder", label: "Event Reminder" },
  { key: "fileUploaded", label: "File Uploaded" },
  { key: "projectUpdate", label: "Project Update" },
] as const;

const channels: NotificationChannel[] = ["screen", "email", "sms"];

export function NotificationSettings() {
  const prefs = useAppStore((s) => s.notificationPreferences);
  const updatePrefs = useAppStore((s) => s.updateNotificationPreferences);

  const toggleChannel = (eventKey: string, channel: NotificationChannel) => {
    const current = (prefs as unknown as Record<string, NotificationChannel[]>)[eventKey] || [];
    const updated = current.includes(channel) ? current.filter((c) => c !== channel) : [...current, channel];
    updatePrefs({ [eventKey]: updated } as unknown as Partial<typeof prefs>);
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

  return (
    <div className="space-y-6">
      {/* Global toggles */}
      <Card>
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h3 className="font-semibold text-[var(--color-text-primary)]">Notification Channels</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Enable or disable notification delivery methods</p>
        </div>
        <CardBody>
          <div className="space-y-4">
            <label className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">Screen Notifications</p>
                <p className="text-xs text-[var(--color-text-muted)]">In-app toast and bell notifications</p>
              </div>
              <input type="checkbox" checked={prefs.screen} onChange={(e) => updatePrefs({ screen: e.target.checked })} className="w-5 h-5 rounded cursor-pointer accent-[var(--color-primary)]" />
            </label>
            <label className="flex items-center justify-between py-2 border-t border-[var(--color-border)]">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">Email Notifications</p>
                <p className="text-xs text-[var(--color-text-muted)]">Receive notifications via email</p>
              </div>
              <input type="checkbox" checked={prefs.email} onChange={(e) => updatePrefs({ email: e.target.checked })} className="w-5 h-5 rounded cursor-pointer accent-[var(--color-primary)]" />
            </label>
            {prefs.email && (
              <div className="pl-4">
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Email Address</label>
                <input className={inputClass} type="email" placeholder="you@example.com" value={prefs.emailAddress} onChange={(e) => updatePrefs({ emailAddress: e.target.value })} />
              </div>
            )}
            <label className="flex items-center justify-between py-2 border-t border-[var(--color-border)]">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">SMS Notifications</p>
                <p className="text-xs text-[var(--color-text-muted)]">Receive text message alerts</p>
              </div>
              <input type="checkbox" checked={prefs.sms} onChange={(e) => updatePrefs({ sms: e.target.checked })} className="w-5 h-5 rounded cursor-pointer accent-[var(--color-primary)]" />
            </label>
            {prefs.sms && (
              <div className="pl-4">
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Phone Number</label>
                <input className={inputClass} type="tel" placeholder="+1 (555) 000-0000" value={prefs.phoneNumber} onChange={(e) => updatePrefs({ phoneNumber: e.target.value })} />
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Per-event matrix */}
      <Card>
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h3 className="font-semibold text-[var(--color-text-primary)]">Event Preferences</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Choose which events trigger notifications on each channel</p>
        </div>
        <CardBody>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-2 font-semibold text-[var(--color-text-secondary)]">Event</th>
                {channels.map((ch) => (
                  <th key={ch} className="text-center py-2 font-semibold text-[var(--color-text-secondary)] capitalize w-24">{ch}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eventTypes.map(({ key, label }) => {
                const current = (prefs as unknown as Record<string, NotificationChannel[]>)[key] || [];
                return (
                  <tr key={key} className="border-b border-[var(--color-border-light)]">
                    <td className="py-3 text-[var(--color-text-primary)]">{label}</td>
                    {channels.map((ch) => (
                      <td key={ch} className="text-center py-3">
                        <input
                          type="checkbox"
                          checked={current.includes(ch)}
                          onChange={() => toggleChannel(key, ch)}
                          className="w-4 h-4 rounded cursor-pointer accent-[var(--color-primary)]"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Notification preferences saved")}>Save Preferences</Button>
      </div>
    </div>
  );
}
