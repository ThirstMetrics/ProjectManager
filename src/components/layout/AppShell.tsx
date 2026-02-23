"use client";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const hydrate = useAppStore((s) => s.hydrate);
  const hydrated = useAppStore((s) => s._hydrated);
  const hydrating = useAppStore((s) => s._hydrating);

  useEffect(() => { hydrate(); }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg animate-pulse" style={{ backgroundColor: "var(--color-primary)" }} />
          {hydrating && (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: "var(--color-background)" }}>
          {children}
          <footer className="mt-8 pb-2 text-center">
            <p className="text-xs text-[var(--color-text-muted)]">
              Powered by{" "}
              <a href="https://thirstmetrics.com" target="_blank" rel="noopener noreferrer" className="font-semibold no-underline" style={{ color: "var(--color-primary)" }}>
                ThirstMetrics
              </a>
              {" "}&copy; 2026
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
