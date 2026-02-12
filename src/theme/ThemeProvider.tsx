"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import themeConfig, { ThemeConfig } from "./theme.config";

interface ThemeContextValue {
  theme: ThemeConfig;
  updateTheme: (partial: Partial<ThemeConfig>) => void;
  updateColors: (colors: Partial<ThemeConfig["colors"]>) => void;
  updateBrand: (brand: Partial<ThemeConfig["brand"]>) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyThemeCSSVariables(theme: ThemeConfig) {
  const root = document.documentElement;
  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    root.style.setProperty(`--color-${cssKey}`, value);
  });
  // Fonts
  root.style.setProperty("--font-heading", theme.fonts.heading);
  root.style.setProperty("--font-body", theme.fonts.body);
  root.style.setProperty("--font-mono", theme.fonts.mono);
  // Border radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(themeConfig);

  useEffect(() => {
    applyThemeCSSVariables(theme);
  }, [theme]);

  const updateTheme = (partial: Partial<ThemeConfig>) => {
    setTheme((prev) => ({ ...prev, ...partial }));
  };

  const updateColors = (colors: Partial<ThemeConfig["colors"]>) => {
    setTheme((prev) => ({
      ...prev,
      colors: { ...prev.colors, ...colors },
    }));
  };

  const updateBrand = (brand: Partial<ThemeConfig["brand"]>) => {
    setTheme((prev) => ({
      ...prev,
      brand: { ...prev.brand, ...brand },
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, updateColors, updateBrand }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
