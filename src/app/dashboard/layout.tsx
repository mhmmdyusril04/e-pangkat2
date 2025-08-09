"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { SideNav } from "./side-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-screen flex-col gap-2 p-4 bg-blue-950">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <h2 className="text-lg font-bold text-white">Menu</h2>
          </div>
          <SideNav />
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-col h-screen">
        {/* Mobile header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 md:hidden">
          <Sheet>
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Buka/Tutup Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-4 bg-blue-950">
              <h2 className="text-lg font-bold text-white mb-4 border-b pb-4">
                Menu
              </h2>
              <SideNav />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold">Menu</h1>
        </header>

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">{children}</main>
      </div>
    </div>
  );
}
