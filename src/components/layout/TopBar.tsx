"use client";

import { Search, Bell, LogOut, User, ChevronDown } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { getInitials } from "@/lib/utils";

export function TopBar({ title }: { title: string }) {
  const unreadCount = useAppStore((s) => s.notifications.filter((n) => !n.read).length);
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image;

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

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          >
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt={userName} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {getInitials(userName)}
              </div>
            )}
            <span className="hidden md:block text-sm font-medium text-[var(--color-text-primary)]">
              {userName}
            </span>
            <ChevronDown size={14} className="hidden md:block text-[var(--color-text-muted)]" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-lg z-50"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                  {userName}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {userEmail}
                </p>
              </div>
              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm no-underline hover:bg-[var(--color-surface-hover)] transition-colors"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <User size={16} />
                  Profile & Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
                  style={{ color: "var(--color-danger)" }}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
