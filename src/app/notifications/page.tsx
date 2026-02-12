"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Info, CheckCircle, AlertTriangle, AlertCircle, Trash2, CheckCheck } from "lucide-react";
import { relativeDate, cn } from "@/lib/utils";

const typeIcons = {
  info: { icon: Info, color: "var(--color-info)" },
  success: { icon: CheckCircle, color: "var(--color-success)" },
  warning: { icon: AlertTriangle, color: "var(--color-warning)" },
  danger: { icon: AlertCircle, color: "var(--color-danger)" },
};

export default function NotificationsPage() {
  const notifications = useAppStore((s) => s.notifications);
  const markRead = useAppStore((s) => s.markNotificationRead);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);
  const deleteNotification = useAppStore((s) => s.deleteNotification);

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppShell title="Notifications">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(["all", "unread", "read"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  filter === f
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                )}
              >
                {f === "all" ? "All" : f === "unread" ? `Unread (${unreadCount})` : "Read"}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              <CheckCheck size={16} /> Mark all read
            </Button>
          )}
        </div>

        {/* Notification list */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          {filtered.length === 0 && (
            <div className="py-16 text-center text-[var(--color-text-muted)]">
              <Info size={40} className="mx-auto mb-3 opacity-30" />
              <p>No notifications</p>
            </div>
          )}
          {filtered.map((n) => {
            const { icon: Icon, color } = typeIcons[n.type];
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer hover:bg-[var(--color-surface-hover)]",
                  !n.read && "bg-[var(--color-primary-light)]"
                )}
                onClick={() => markRead(n.id)}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: color + "18" }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-medium", !n.read ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]")}>
                      {n.title}
                    </p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{n.message}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-[var(--color-text-muted)]">{relativeDate(n.createdAt)}</span>
                    {n.channel.map((ch) => (
                      <span key={ch} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-border-light)] text-[var(--color-text-muted)]">{ch}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors shrink-0 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
