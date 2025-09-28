"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@packages/backend/convex/_generated/api";
import { Calendar, FolderOpen } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";

/**
 * Props for TabsYear component
 */
interface TabsYearProps {
  className?: string;
  variant?: "default" | "underline" | "pills";
  useUrlNavigation?: boolean;
  onYearChange?: (year: number) => void;
  currentYear?: number;
  locale?: string;
}

const TabsYear = ({
  className,
  variant = "underline",
  useUrlNavigation = true,
  onYearChange,
  currentYear,
  locale = "en",
}: TabsYearProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslations();

  const years = useQuery(api.queries.projects.listYear) || [];

  const getCurrentYear = () => {
    if (currentYear) return currentYear.toString();

    if (!useUrlNavigation) return "all";

    // Extract year from URL path: /locale/projects/2025
    const yearMatch = pathname.match(/\/projects\/(\d{4})$/);
    if (yearMatch) {
      return yearMatch[1];
    }

    return "all";
  };

  const handleYearChange = (year: string) => {
    if (useUrlNavigation) {
      if (year === "all") {
        router.push(`/${locale}/projects`);
      } else {
        router.push(`/${locale}/projects/${year}`);
      }
    } else {
      if (year === "all") {
        onYearChange?.("all" as any);
      } else {
        const yearNumber = parseInt(year);
        onYearChange?.(yearNumber);
      }
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
          "px-6 py-3 text-sm font-bold border-b-2 border-transparent",
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
          "px-6 py-2 text-sm font-bold rounded-md",
          "data-[state=active]:bg-[#f7a641] data-[state=active]:text-[#4a2e1a]",
          "dark:data-[state=active]:bg-[#4a2e1a] dark:data-[state=active]:text-[#f8e9b0]",
          "text-muted-foreground hover:text-foreground",
          "transition-colors whitespace-nowrap",
        );
      default:
        return "px-4 py-3 text-sm font-bold";
    }
  };

  // Don't render if no years data
  if (!years || years.length === 0) {
    return null;
  }

  const yearTabs = [
    {
      year: "all",
      label: t("projects.allYears"),
      projectCount: years.reduce((total, year) => total + year.projectCount, 0),
    },
    ...years.map(
      ({ year, projectCount }: { year: number; projectCount: number }) => ({
        year: year.toString(),
        label: year.toString(),
        projectCount,
      }),
    ),
  ];

  return (
    <div className={cn("w-full", className)}>
      <Tabs
        value={getCurrentYear()}
        onValueChange={handleYearChange}
        className="w-full"
      >
        <TabsList className={getTabsListClass()}>
          {yearTabs.map(({ year, label, projectCount }, index) => (
            <TabsTrigger
              key={year}
              value={year}
              className={getTabsTriggerClass()}
            >
              <div className="flex items-center gap-2">
                {index === 0 ? (
                  <FolderOpen className="h-4 w-4" />
                ) : (
                  <Calendar className="h-4 w-4" />
                )}
                <span>{label}</span>
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                  {projectCount}
                </span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TabsYear;
