"use client";

import { useSession } from "next-auth/react";
import { useNotificationScheduler } from "@/hooks/useNotificationScheduler";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  // Only activate scheduler when logged in
  if (session?.user) {
    return <NotificationInner>{children}</NotificationInner>;
  }

  return <>{children}</>;
}

function NotificationInner({ children }: { children: React.ReactNode }) {
  useNotificationScheduler();
  return <>{children}</>;
}
