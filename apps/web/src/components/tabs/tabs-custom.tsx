"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
}: TabsCustomProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current active tab based on URL
  const getCurrentTab = () => {
    if (!useUrlNavigation) return defaultValue;

    // First check for view query parameter
    const viewParam = searchParams.get("view");
    if (viewParam) {
      const tab = tabs.find((t) => t.id === viewParam);
      if (tab) return tab.id;
    }

    // Fallback to href matching
    // Sort tabs by href length (longest first) to match more specific routes first
    const sortedTabs = [...tabs].sort(
      (a, b) => (b.href?.length || 0) - (a.href?.length || 0),
    );

    // Check which tab's href matches the current pathname
    const currentTab = sortedTabs.find((tab) => {
      if (!tab.href) return false;

      // Exact match
      if (pathname === tab.href) return true;

      // Check if pathname starts with tab.href and the next character is '/' or end of string
      // This prevents /projects from matching /projects/contents
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
      }
    } else {
      // For non-URL navigation, update the view query parameter
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set("view", value);
      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.push(`${pathname}${query}`);
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
          "px-8 py-3 text-sm font-bold border-b-2 border-transparent",
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
          "px-8 py-2 text-sm font-bold rounded-md",
          "data-[state=active]:bg-[#f7a641] data-[state=active]:text-[#4a2e1a]",
          "dark:data-[state=active]:bg-[#4a2e1a] dark:data-[state=active]:text-[#f8e9b0]",
          "text-muted-foreground hover:text-foreground",
          "transition-colors whitespace-nowrap",
        );
      default:
        return "px-4 py-3 text-sm font-bold";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Tabs
        value={useUrlNavigation ? getCurrentTab() : defaultValue}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="overflow-x-auto">
          <TabsList
            className={cn(
              getTabsListClass(),
              "flex-nowrap gap-1 overflow-x-auto",
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
                  <div className="flex items-center gap-2">
                    {IconComponent && <IconComponent className="h-4 w-4" />}
                    {tab.label}
                    {tab.badge && (
                      <Badge variant="secondary" className="ml-2 h-5 text-xs">
                        {tab.badge}
                      </Badge>
                    )}
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {tabs.some((tab) => tab.content) && (
          <>
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-4">
                {tab.content}
              </TabsContent>
            ))}
          </>
        )}
      </Tabs>
    </div>
  );
};

export default TabsCustom;
