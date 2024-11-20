"use client";

import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Suspense } from "react";


export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // load sidebar data here
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex shrink-0 justify-between gap-2 border-b bg-background p-4">
          <div className="flex shrink-0 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumbs />
          </div>
          <ModeToggle />
        </header>
        <div className="p-4">
          <Suspense fallback={<div>Loading...</div>}>
          {children}
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
