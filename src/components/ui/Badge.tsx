"use client";

import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  default: "bg-[var(--color-border-light)] text-[var(--color-text-secondary)]",
  primary: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
  success: "bg-[#dcfce7] text-[#16a34a]",
  warning: "bg-[#fef3c7] text-[#d97706]",
  danger: "bg-[#fee2e2] text-[#dc2626]",
  info: "bg-[#dbeafe] text-[#2563eb]",
};

const sizes: Record<string, string> = {
  sm: "px-1.5 py-px text-[10px]",
  md: "px-2 py-0.5 text-xs",
};

export function Badge({
  children, variant = "default", size = "md", style, className,
}: {
  children: React.ReactNode; variant?: keyof typeof variants; size?: "sm" | "md"; style?: React.CSSProperties; className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap",
        sizes[size],
        variants[variant] || variants.default,
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}
