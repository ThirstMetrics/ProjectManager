"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, CheckSquare, Calendar, FileArchive, Bell, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/theme/ThemeProvider";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Files", href: "/files", icon: FileArchive },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const allProjects = useAppStore((s) => s.projects);

  // Default collapsed on mobile (<1024px), expanded on desktop
  useEffect(() => {
    setCollapsed(window.innerWidth < 1024);
  }, []);
  const projects = useMemo(() => allProjects.filter((p) => p.status === "active"), [allProjects]);
  const { theme } = useTheme();

  return (
    <aside
      className={cn("h-screen flex flex-col transition-all duration-300 relative shrink-0", collapsed ? "w-[68px]" : "w-[260px]")}
      style={{ backgroundColor: "var(--color-sidebar)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/favicon.svg" alt="" className="w-8 h-8 shrink-0" />
        {!collapsed && <span className="text-white font-bold text-lg truncate">{theme.brand.name}</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 no-underline",
                active
                  ? "text-[var(--color-sidebar-text-active)]"
                  : "text-[var(--color-sidebar-text)] hover:text-[var(--color-sidebar-text-active)]"
              )}
              style={{ backgroundColor: active ? "var(--color-sidebar-active)" : undefined }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = "var(--color-sidebar-hover)"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Projects */}
      {!collapsed && (
        <div className="px-3 pb-4">
          <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: "var(--color-sidebar-text)", opacity: 0.6 }}>
            Projects
          </p>
          {projects.slice(0, 5).map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm no-underline transition-colors"
              style={{ color: "var(--color-sidebar-text)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-sidebar-hover)"; e.currentTarget.style.color = "var(--color-sidebar-text-active)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-sidebar-text)"; }}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="truncate">{p.name}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors z-10 cursor-pointer"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
