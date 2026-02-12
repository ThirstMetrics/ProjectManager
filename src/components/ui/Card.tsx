"use client";

import { cn } from "@/lib/utils";

export function Card({ children, className, onClick, hover }: {
  children: React.ReactNode; className?: string; onClick?: () => void; hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm transition-all duration-200",
        hover && "hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-5 py-4 border-b border-[var(--color-border)]", className)}>{children}</div>;
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}
