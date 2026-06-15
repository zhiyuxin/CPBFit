"use client";

import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function GlassCard({ children, className, padding = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card",
        padding && "px-5 py-4",
        className
      )}
    >
      {children}
    </div>
  );
}
