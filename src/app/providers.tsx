"use client";

import { ThemeProvider } from "@/theme/ThemeProvider";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "var(--radius-lg)",
            background: "var(--color-surface)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-lg)",
            fontSize: "0.875rem",
          },
        }}
      />
    </ThemeProvider>
  );
}
