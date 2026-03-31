"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

// LEARNING: This is where you'd wrap the app with your integration platform's
// context provider (e.g., PrismaticProvider) to manage SDK state, authentication
// tokens, and embedded UI lifecycle across all pages.

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      className="h-screen overflow-hidden"
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      {children}
    </SidebarProvider>
  );
}
