"use client";

import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div id="page-root" className="mx-auto max-w-lg px-4 pt-4 pb-20 page-enter">
      {children}
    </div>
  );
}
