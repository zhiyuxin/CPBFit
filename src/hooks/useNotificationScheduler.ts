"use client";

import { useEffect, useRef } from "react";

interface NotificationSetting {
  id: string;
  enabled: boolean;
  hour: number;
  minute: number;
  title: string;
  body: string;
  repeatCount: number;
}

export function useNotificationScheduler() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Request permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkAndFire = async () => {
      try {
        const res = await fetch("/api/notifications");
        const settings: NotificationSetting[] = await res.json();

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        for (const setting of settings) {
          if (!setting.enabled) continue;

          const settingMinutes = setting.hour * 60 + setting.minute;

          // Fire if within this minute (currentMinutes === settingMinutes)
          if (currentMinutes === settingMinutes) {
            const todayKey = `${now.toDateString()}-${setting.id}`;

            if (!firedRef.current.has(todayKey) && "Notification" in window && Notification.permission === "granted") {
              firedRef.current.add(todayKey);

              // Show notification
              new Notification(setting.title || "WeightTrack", {
                body: setting.body,
                icon: "/icon-192.svg",
                tag: setting.id,
              });

              // If limited repeat count, decrement on server
              if (setting.repeatCount > 0) {
                const newCount = setting.repeatCount - 1;
                if (newCount <= 0) {
                  // Disable after last fire
                  await fetch("/api/notifications", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: setting.id, enabled: false, repeatCount: 0 }),
                  });
                } else {
                  await fetch("/api/notifications", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: setting.id, repeatCount: newCount }),
                  });
                }
              }
            }
          }
        }
      } catch {
        // Silently fail - notifications are best-effort
      }
    };

    // Check every 30 seconds
    checkAndFire();
    timerRef.current = setInterval(checkAndFire, 30000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
}
