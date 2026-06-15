import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { AuthProvider } from "@/components/AuthProvider";
import { NotificationProvider } from "@/components/NotificationProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WeightTrack - 体重管理",
  description: "优雅的体重追踪与管理工具",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WeightTrack",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-bg text-text-primary antialiased pb-20 safe-top">
        <AuthProvider>
          <NotificationProvider>
            <main className="mx-auto max-w-lg px-4 pt-4 pb-4 page-enter">
              {children}
            </main>
          </NotificationProvider>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
