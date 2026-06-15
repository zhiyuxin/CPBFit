"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  ChartLine,
  History,
  Home,
  Settings,
  Utensils,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "今日", icon: Home },
  { href: "/diet", label: "饮食", icon: Utensils },
  { href: "/advisor", label: "AI", icon: MessageCircle },
  { href: "/history", label: "历史", icon: History },
  { href: "/stats", label: "统计", icon: ChartLine },
  { href: "/settings", label: "设置", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show nav on login page
  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom bg-card/85 backdrop-blur-xl border-t border-separator/30">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 pt-1 pb-1.5">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors btn-press",
                isActive ? "text-accent" : "text-text-tertiary"
              )}
            >
              {/* Active indicator line */}
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-accent" />
              )}
              <Icon
                size={24}
                className={cn(
                  "transition-all duration-200",
                  isActive
                    ? "text-accent scale-110"
                    : "text-text-tertiary"
                )}
                fill={isActive ? "currentColor" : "none"}
              />
              <span className="text-[10px] font-medium leading-tight tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
