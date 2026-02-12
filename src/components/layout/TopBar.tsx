"use client";

import { Search, Bell } from "lucide-react";
import { useAppStore } from "@/lib/store";
import Link from "next/link";

export function TopBar({ title }: { title: string }) {
  const unreadCount = useAppStore((s) => s.notifications.filter((n) => !n.read).length);

  return (
    <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-6 shrink-0">
      <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:flex">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 w-64 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition"
          />
        </div>

        {/* Notification bell */}
        <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors">
          <Bell size={20} className="text-[var(--color-text-secondary)]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[var(--color-danger)] text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "var(--color-primary)" }}>
          U
        </div>
      </div>
    </header>
  );
}
