"use client";

import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  style?: CSSProperties;
}

export function GlassCard({ children, className, padding = true, style }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card",
        padding && "px-5 py-4",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
