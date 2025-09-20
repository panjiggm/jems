"use client";

import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/hooks/use-translations";
import { removeLocaleFromPathname } from "@/lib/i18n";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
  }[];
}) {
  const { t } = useTranslations();
  const pathname = usePathname();
  const currentPath = normalizePath(removeLocaleFromPathname(pathname));

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("common.navigation")}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const normalizedItemPath = item.url.startsWith("http")
            ? null
            : normalizePath(removeLocaleFromPathname(item.url));
          const isActive =
            typeof item.isActive === "boolean"
              ? item.isActive
              : normalizedItemPath
                ? resolveIsActive(currentPath, normalizedItemPath)
                : false;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive}>
                <Link href={item.url}>
                  <item.icon />
                  <span className="text-sm font-bold">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function normalizePath(path: string): string {
  const [pathname] = path.split(/[?#]/);
  if (!pathname) return "/";

  let nextPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (nextPath.length > 1 && nextPath.endsWith("/")) {
    nextPath = nextPath.slice(0, -1);
  }

  return nextPath || "/";
}

function resolveIsActive(
  currentPath: string,
  targetPath: string,
): boolean {
  if (targetPath === "/") {
    return currentPath === "/";
  }

  return (
    currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
  );
}
