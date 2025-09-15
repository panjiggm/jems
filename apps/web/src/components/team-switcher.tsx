"use client";

import * as React from "react";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { useTranslations } from "@/hooks/use-translations";
import { Logo2 } from "./navbar/logo2";

export function TeamSwitcher() {
  const { t } = useTranslations();
  return (
    <SidebarMenu className="mb-4 pt-2">
      <SidebarMenuItem>
        <div className="flex items-center gap-2">
          <Logo2 />
          <div className="leading-5">
            <h2 className="font-black text-[#4a2e1a] dark:text-[#f8e9b0]">
              {t("nav.title")}
            </h2>
            <p className="text-xs font-bold text-muted-foreground">
              {t("common.free")}
            </p>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
