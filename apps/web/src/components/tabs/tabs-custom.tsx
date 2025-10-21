"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import {
  FolderOpen,
  FileText,
  CheckSquare,
  Calendar,
  BarChart3,
  User,
  Rocket,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

interface TabItem {
  id: string;
  label: string;
  badge?: string;
  content?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string; // Add href for URL-based navigation
}

interface TabsCustomProps {
  tabs: TabItem[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  variant?: "default" | "underline" | "pills";
  autoAssignIcons?: boolean;
  useUrlNavigation?: boolean; // Add flag for URL-based navigation
  queryParamName?: string; // Custom query parameter name (default: "contentType")
  containerMaxWidth?: string; // Custom max width for container (default: "max-w-4xl")
}

// Helper function to get default icons based on tab ID
const getDefaultIcon = (
  tabId: string,
): React.ComponentType<{ className?: string }> | undefined => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    // Project related
    projects: FolderOpen,
    project: FolderOpen,
    info: FolderOpen,

    // Content related
    contents: FileText,
    content: FileText,
    activity: FileText,
    posts: FileText,
    articles: FileText,

    // Task related
    tasks: CheckSquare,
    task: CheckSquare,
    todo: CheckSquare,
    checklist: CheckSquare,

    // Calendar related
    calendar: Calendar,
    schedule: Calendar,
    events: Calendar,

    // Stats related
    stats: BarChart3,
    analytics: BarChart3,
    reports: BarChart3,
    dashboard: BarChart3,

    // User related
    profile: User,
    user: User,
    account: User,
    settings: User,

    // Status related
    published: Rocket,
    draft: FileText,
    completed: CheckCircle2,
    overdue: AlertTriangle,
  };

  return iconMap[tabId.toLowerCase()];
};

const TabsCustom = ({
  tabs,
  defaultValue,
  onValueChange,
  className,
  variant = "underline",
  autoAssignIcons = true,
  useUrlNavigation = false,
  queryParamName = "contentType",
  containerMaxWidth = "max-w-4xl",
}: TabsCustomProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [contentTypeParam, setContentTypeParam] = useQueryState(queryParamName);

  // Get current active tab based on URL
  const getCurrentTab = () => {
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
  };

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

  const getTabsListClass = () => {
    switch (variant) {
      case "underline":
        return "h-auto p-0 bg-transparent justify-start border-0";
      case "pills":
        return "h-auto p-1 bg-muted";
      default:
        return "h-auto p-0 bg-transparent justify-start border-0";
    }
  };

  const getTabsTriggerClass = () => {
    switch (variant) {
      case "underline":
        return cn(
          "px-0 text-xs font-normal border-b-2 border-transparent",
          "border-t-0 border-l-0 border-r-0 shadow-none",
          "data-[state=active]:border-b-[#f7a641] data-[state=active]:text-[#4a2e1a]",
          "data-[state=active]:border-t-0 data-[state=active]:border-l-0 data-[state=active]:border-r-0",
          "data-[state=active]:shadow-none",
          "dark:data-[state=active]:border-b-[#4a2e1a] dark:data-[state=active]:text-[#f8e9b0]",
          "dark:data-[state=active]:border-t-0 dark:data-[state=active]:border-l-0 dark:data-[state=active]:border-r-0",
          "dark:data-[state=active]:shadow-none",
          "text-muted-foreground hover:text-foreground",
          "rounded-none transition-colors whitespace-nowrap",
        );
      case "pills":
        return cn(
          "text-xs font-normal rounded-md",
          "data-[state=active]:bg-[#f7a641] data-[state=active]:text-[#4a2e1a]",
          "dark:data-[state=active]:bg-[#4a2e1a] dark:data-[state=active]:text-[#f8e9b0]",
          "text-muted-foreground hover:text-foreground",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          "transition-colors whitespace-nowrap",
        );
      default:
        return cn("text-xs", "transition-colors");
    }
  };

  return (
    <Tabs
      value={
        useUrlNavigation ? getCurrentTab() : contentTypeParam || defaultValue
      }
      onValueChange={handleTabChange}
      className={cn("flex flex-col min-h-0", className)}
    >
      {/* Tabs Navigation with full-width border */}
      <div className="border-b bg-background">
        <div
          className={cn("container mx-auto px-4 sm:px-6", containerMaxWidth)}
        >
          <div className="overflow-x-auto">
            <TabsList
              className={cn(
                getTabsListClass(),
                "flex-nowrap overflow-x-auto gap-1",
              )}
            >
              {tabs.map((tab) => {
                const IconComponent =
                  tab.icon ||
                  (autoAssignIcons ? getDefaultIcon(tab.id) : undefined);
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={getTabsTriggerClass()}
                  >
                    <div className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-1.5">
                      {IconComponent && <IconComponent className="h-3 w-3" />}
                      <span className="text-xs">{tab.label}</span>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>
      </div>

      {/* Tabs Content with scroll */}
      {tabs.some((tab) => tab.content) && (
        <ScrollArea className="flex-1">
          <div
            className={cn("container mx-auto px-4 sm:px-6", containerMaxWidth)}
          >
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-4">
                {tab.content}
              </TabsContent>
            ))}
          </div>
        </ScrollArea>
      )}
    </Tabs>
  );
};

export default TabsCustom;
