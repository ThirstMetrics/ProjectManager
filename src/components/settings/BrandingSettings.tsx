"use client";

import { useTheme } from "@/theme/ThemeProvider";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import themeConfig from "@/theme/theme.config";
import { RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

const colorGroups = [
  {
    title: "Primary Colors",
    keys: [
      { key: "primary", label: "Primary" },
      { key: "primaryHover", label: "Primary Hover" },
      { key: "primaryLight", label: "Primary Light" },
    ],
  },
  {
    title: "Secondary Colors",
    keys: [
      { key: "secondary", label: "Secondary" },
      { key: "secondaryHover", label: "Secondary Hover" },
      { key: "secondaryLight", label: "Secondary Light" },
    ],
  },
  {
    title: "Status Colors",
    keys: [
      { key: "success", label: "Success" },
      { key: "warning", label: "Warning" },
      { key: "danger", label: "Danger" },
      { key: "info", label: "Info" },
    ],
  },
  {
    title: "Surfaces",
    keys: [
      { key: "background", label: "Background" },
      { key: "surface", label: "Surface" },
      { key: "surfaceHover", label: "Surface Hover" },
    ],
  },
  {
    title: "Sidebar",
    keys: [
      { key: "sidebar", label: "Background" },
      { key: "sidebarHover", label: "Hover" },
      { key: "sidebarActive", label: "Active" },
      { key: "sidebarText", label: "Text" },
      { key: "sidebarTextActive", label: "Active Text" },
    ],
  },
  {
    title: "Text",
    keys: [
      { key: "textPrimary", label: "Primary" },
      { key: "textSecondary", label: "Secondary" },
      { key: "textMuted", label: "Muted" },
      { key: "textOnPrimary", label: "On Primary" },
    ],
  },
  {
    title: "Borders",
    keys: [
      { key: "border", label: "Border" },
      { key: "borderLight", label: "Border Light" },
    ],
  },
];

export function BrandingSettings() {
  const { theme, updateColors, updateBrand } = useTheme();

  const resetToDefaults = () => {
    updateColors(themeConfig.colors);
    updateBrand(themeConfig.brand);
    toast.success("Theme reset to defaults");
  };

  return (
    <div className="space-y-6">
      {/* Brand identity */}
      <Card>
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h3 className="font-semibold text-[var(--color-text-primary)]">Brand Identity</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Change the app name, logo, and tagline for white-label deployments</p>
        </div>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">App Name</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                value={theme.brand.name}
                onChange={(e) => updateBrand({ name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Tagline</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                value={theme.brand.tagline}
                onChange={(e) => updateBrand({ tagline: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">Logo URL</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                value={theme.brand.logo}
                onChange={(e) => updateBrand({ logo: e.target.value })}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Color groups */}
      {colorGroups.map((group) => (
        <Card key={group.title}>
          <div className="px-5 py-4 border-b border-[var(--color-border)]">
            <h3 className="font-semibold text-[var(--color-text-primary)]">{group.title}</h3>
          </div>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {group.keys.map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1 block">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(theme.colors as Record<string, string>)[key]}
                      onChange={(e) => updateColors({ [key]: e.target.value } as Partial<typeof theme.colors>)}
                      className="w-10 h-10 rounded-lg border border-[var(--color-border)] cursor-pointer"
                    />
                    <input
                      className="flex-1 px-2 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      value={(theme.colors as Record<string, string>)[key]}
                      onChange={(e) => updateColors({ [key]: e.target.value } as Partial<typeof theme.colors>)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ))}

      {/* Live preview */}
      <Card>
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h3 className="font-semibold text-[var(--color-text-primary)]">Live Preview</h3>
        </div>
        <CardBody>
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--color-background)" }}>
              <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>Primary text on background</p>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Secondary text</p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Muted text</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Reset */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={resetToDefaults}>
          <RotateCcw size={16} /> Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
