"use client";

import { SidebarLeft } from "@/components/sidebar-left";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/navbar/theme-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-14 shrink-0 items-center justify-between gap-2 border-b-2 border-[#f7a641]/20 px-3">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Badge className="bg-gradient-to-r from-[#f7a641] to-[#4a2e1a] text-white border-0 font-bold animate-pulse hover:animate-none">
              ✨ Alpha Version
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>
        <div>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
