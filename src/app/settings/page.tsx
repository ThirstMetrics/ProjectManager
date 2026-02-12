"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useState } from "react";
import { BrandingSettings } from "@/components/settings/BrandingSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { cn } from "@/lib/utils";
import { Palette, Bell, FolderKanban } from "lucide-react";

const tabs = [
  { id: "branding", label: "Branding", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const;

type TabId = typeof tabs[number]["id"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("branding");

  return (
    <AppShell title="Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
                activeTab === tab.id
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "branding" && <BrandingSettings />}
        {activeTab === "notifications" && <NotificationSettings />}
      </div>
    </AppShell>
  );
}
