"use client";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useState, useEffect } from "react";

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="w-8 h-8 rounded-lg animate-pulse" style={{ backgroundColor: "var(--color-primary)" }} />
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
