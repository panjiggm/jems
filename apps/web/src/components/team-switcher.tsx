"use client";

import * as React from "react";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { Logo } from "./navbar/logo";

export function TeamSwitcher() {
  return (
    <SidebarMenu className="mb-4 pt-2">
      <SidebarMenuItem>
        <div className="flex items-center gap-2">
          <Logo />
          <div className="leading-5">
            <h2 className="font-black text-[#4a2e1a] dark:text-[#f8e9b0]">
              Hidden Jems
            </h2>
            <p className="text-xs font-bold text-muted-foreground">Free</p>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
