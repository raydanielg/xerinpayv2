"use client";

import * as React from "react";

import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";

import { AppSidebar } from "@/components/shell/app-sidebar";
import { ShellHeader } from "@/components/shell/shell-header";

export function PortalShell({
  variant,
  counters,
  children,
}: {
  variant: "merchant" | "admin";
  counters?: Record<string, number | undefined>;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar variant={variant} counters={counters} />
      <SidebarInset>
        <ShellHeader />
        <main className="flex-1 space-y-6 p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
