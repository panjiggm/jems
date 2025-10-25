"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TabItem {
  id: string;
  label: string;
  badge?: string;
  content?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
}

interface TabsWithOverflowProps {
  tabs: TabItem[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  variant?: "default" | "underline" | "pills";
  autoAssignIcons?: boolean;
  useUrlNavigation?: boolean;
  queryParamName?: string;
}

const TabsWithOverflow = ({
  tabs,
  defaultValue,
  onValueChange,
  className,
  variant = "underline",
  autoAssignIcons = true,
  useUrlNavigation = false,
  queryParamName = "contentType",
}: TabsWithOverflowProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [contentTypeParam, setContentTypeParam] = useQueryState(queryParamName);
  const [visibleTabs, setVisibleTabs] = useState<TabItem[]>(tabs);
  const [overflowTabs, setOverflowTabs] = useState<TabItem[]>([]);
  const [screenSize, setScreenSize] = useState<"xs" | "sm" | "md+">("md+");

  // Get current active tab based on URL
  const getCurrentTab = useCallback(() => {
    if (!useUrlNavigation) return defaultValue;

    // Check contentType query param first
    if (contentTypeParam) {
      const tab = tabs.find((t) => t.id === contentTypeParam);
      if (tab) return tab.id;
    }

    // Then check if current path matches any tab href
    const sortedTabs = [...tabs].sort(
      (a, b) => (b.href?.length || 0) - (a.href?.length || 0),
    );

    const currentTab = sortedTabs.find((tab) => {
      if (!tab.href) return false;

      if (pathname === tab.href) return true;

      const nextChar = pathname[tab.href.length];
      return (
        pathname.startsWith(tab.href) &&
        (nextChar === "/" || nextChar === undefined)
      );
    });

    return currentTab?.id || defaultValue;
  }, [useUrlNavigation, defaultValue, contentTypeParam, tabs, pathname]);

  const handleTabChange = (value: string) => {
    if (useUrlNavigation) {
      const tab = tabs.find((t) => t.id === value);
      if (tab?.href) {
        router.push(tab.href);
      } else {
        setContentTypeParam(value);
      }
    } else {
      setContentTypeParam(value);
      onValueChange?.(value);
    }
  };

  // Detect screen size and calculate overflow based on breakpoints
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // xs: < 640px (Tailwind sm breakpoint)
        setScreenSize("xs");
      } else if (width < 768) {
        // sm: 640px - 767px (Tailwind md breakpoint)
        setScreenSize("sm");
      } else {
        // md+: >= 768px
        setScreenSize("md+");
      }
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);

    return () => {
      window.removeEventListener("resize", updateScreenSize);
    };
  }, []);

  /**
   * Calculate visible and overflow tabs based on screen size and active tab
   *
   * Smart reordering: If the active tab would be hidden in the dropdown,
   * automatically move it to the last visible position and push another tab
   * into the dropdown instead. This ensures users always see their active view.
   *
   * Example flow (2 visible tabs on mobile):
   * 1. Initial: [Table, Kanban] visible, [List, Calendar] in dropdown
   * 2. User selects "List" from dropdown
   * 3. Result: [Table, List (active)] visible, [Kanban, Calendar] in dropdown
   */
  useEffect(() => {
    let maxVisibleTabs: number;

    switch (screenSize) {
      case "xs":
        maxVisibleTabs = 2; // Mobile: 2 tabs visible
        break;
      case "sm":
        maxVisibleTabs = 3; // Tablet: 3 tabs visible
        break;
      case "md+":
      default:
        maxVisibleTabs = tabs.length; // Desktop: all tabs visible
        break;
    }

    if (maxVisibleTabs >= tabs.length) {
      // All tabs fit, no dropdown needed
      setVisibleTabs(tabs);
      setOverflowTabs([]);
    } else {
      // Get current active tab value
      const activeTabId = useUrlNavigation
        ? getCurrentTab()
        : contentTypeParam || defaultValue;

      // Find active tab index in original tabs array
      const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTabId);

      // Create a copy for reordering
      let reorderedTabs = [...tabs];

      // Smart reordering: If active tab would be hidden in dropdown
      if (activeTabIndex >= 0 && activeTabIndex >= maxVisibleTabs) {
        // Remove active tab from its original position
        const [activeTab] = reorderedTabs.splice(activeTabIndex, 1);

        // Insert active tab at the last visible position (replace the tab that would be there)
        reorderedTabs.splice(maxVisibleTabs - 1, 0, activeTab);
      }

      // Split into visible and overflow based on reordered array
      setVisibleTabs(reorderedTabs.slice(0, maxVisibleTabs));
      setOverflowTabs(reorderedTabs.slice(maxVisibleTabs));
    }
  }, [
    screenSize,
    tabs,
    contentTypeParam,
    useUrlNavigation,
    defaultValue,
    getCurrentTab,
  ]);

  const getTabsTriggerClass = (isActive: boolean) => {
    switch (variant) {
      case "underline":
        return cn(
          "px-2 py-1.5 text-xs font-normal border-b-2 transition-colors whitespace-nowrap",
          "rounded-none",
          isActive
            ? "border-[#f7a641] text-[#4a2e1a] dark:border-[#4a2e1a] dark:text-[#f8e9b0]"
            : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 hover:rounded-md",
        );
      case "pills":
        return cn(
          "px-2 py-1.5 text-xs font-normal rounded-md transition-colors whitespace-nowrap",
          isActive
            ? "bg-[#f7a641] text-[#4a2e1a] dark:bg-[#4a2e1a] dark:text-[#f8e9b0]"
            : "text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800",
        );
      default:
        return cn("px-2 py-1.5 text-xs transition-colors whitespace-nowrap");
    }
  };

  const currentValue = useUrlNavigation
    ? getCurrentTab()
    : contentTypeParam || defaultValue;

  const renderTab = (tab: TabItem) => {
    const isActive = currentValue === tab.id;
    const IconComponent = tab.icon;

    return (
      <button
        key={tab.id}
        onClick={() => handleTabChange(tab.id)}
        className={cn(
          "flex items-center gap-1.5",
          getTabsTriggerClass(isActive),
        )}
      >
        {IconComponent && <IconComponent className="h-3 w-3" />}
        <span>{tab.label}</span>
      </button>
    );
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Visible tabs */}
      {visibleTabs.map((tab) => renderTab(tab))}

      {/* Overflow dropdown */}
      {overflowTabs.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 h-auto gap-1 shrink-0"
            >
              {overflowTabs.length} more...
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {overflowTabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = currentValue === tab.id;
              return (
                <DropdownMenuItem
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "cursor-pointer text-xs",
                    isActive &&
                      "bg-[#f7a641]/10 text-[#4a2e1a] dark:bg-[#4a2e1a]/20 dark:text-[#f8e9b0]",
                  )}
                >
                  {IconComponent && <IconComponent className="h-3 w-3 mr-2" />}
                  {tab.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default TabsWithOverflow;
