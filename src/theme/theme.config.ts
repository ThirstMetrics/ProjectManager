// ============================================================
// THEME CONFIGURATION - White-Label / Branding Control Center
// ============================================================
// Change these values to instantly re-brand the entire app.
// One prompt, one file – every color, logo, and font updates globally.
// ============================================================

export interface ThemeConfig {
  brand: {
    name: string;
    logo: string;          // path or URL
    logoSmall: string;     // icon-sized version
    favicon: string;
    tagline: string;
  };
  colors: {
    primary: string;       // main accent  (buttons, links, active states)
    primaryHover: string;
    primaryLight: string;  // lighter tint for backgrounds / badges
    secondary: string;     // secondary accent
    secondaryHover: string;
    secondaryLight: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    // Surfaces
    background: string;
    surface: string;
    surfaceHover: string;
    sidebar: string;
    sidebarHover: string;
    sidebarActive: string;
    sidebarText: string;
    sidebarTextActive: string;
    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textOnPrimary: string; // text color on primary-colored backgrounds
    // Borders
    border: string;
    borderLight: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  projectTypes: {
    label: string;
    value: string;
    icon: string;
    color: string;
  }[];
}

const themeConfig: ThemeConfig = {
  brand: {
    name: "TaskFlow Pro",
    logo: "/logo.svg",
    logoSmall: "/logo-small.svg",
    favicon: "/favicon.svg",
    tagline: "Manage Everything. Beautifully.",
  },
  colors: {
    primary: "#0d7377",        // ThirstMetrics teal
    primaryHover: "#0a5f63",
    primaryLight: "#e6f5f5",
    secondary: "#22d3e6",      // Cyan accent
    secondaryHover: "#0e9aab",
    secondaryLight: "#e6fcfc",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6",
    background: "#f8fafa",
    surface: "#ffffff",
    surfaceHover: "#f1f5f5",
    sidebar: "#042829",        // ThirstMetrics dark teal
    sidebarHover: "#063a3c",
    sidebarActive: "#0a5f63",
    sidebarText: "#80cccc",
    sidebarTextActive: "#ffffff",
    textPrimary: "#1e293b",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
    textOnPrimary: "#ffffff",
    border: "#e2e8f0",
    borderLight: "#f1f5f9",
  },
  fonts: {
    heading: "'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
  projectTypes: [
    { label: "Software Development", value: "software", icon: "Code2", color: "#6366f1" },
    { label: "Beverage Activation", value: "beverage", icon: "Wine", color: "#f59e0b" },
    { label: "Marketing Campaign", value: "marketing", icon: "Megaphone", color: "#ec4899" },
    { label: "Event Planning", value: "event", icon: "CalendarDays", color: "#0ea5e9" },
    { label: "General", value: "general", icon: "Folders", color: "#22c55e" },
  ],
};

export default themeConfig;
