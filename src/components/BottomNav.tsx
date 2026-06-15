"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  ChartLine,
  History,
  Home,
  Settings,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "今日", icon: Home },
  { href: "/history", label: "历史", icon: History },
  { href: "/stats", label: "统计", icon: ChartLine },
  { href: "/measurements", label: "围度", icon: Scale },
  { href: "/settings", label: "设置", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom bg-card/90 backdrop-blur-xl border-t border-separator/30">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors",
                isActive ? "text-accent" : "text-text-tertiary"
              )}
            >
              <Icon
                size={24}
                className={cn(
                  "transition-colors",
                  isActive ? "text-accent" : "text-text-tertiary"
                )}
                fill={isActive ? "currentColor" : "none"}
              />
              <span className="text-[10px] font-medium leading-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
