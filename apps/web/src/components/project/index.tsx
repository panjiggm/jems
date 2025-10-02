"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import SearchFilterContent, { FilterState } from "./search-filter-content";
import KanbanView from "./views/kanban-view";
import TableView from "./views/table-view";
import ListView from "./views/list-view";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { useContentDialogStore } from "@/store/use-dialog-content-store";
import { useTranslations } from "@/hooks/use-translations";
import { Id } from "@packages/backend/convex/_generated/dataModel";

interface ProjectComponentProps {
  projectId?: Id<"projects">;
  userId?: string;
}

export default function ProjectComponent({
  projectId,
  userId,
}: ProjectComponentProps) {
  const searchParams = useSearchParams();
  const { openDialog } = useContentDialogStore();
  const { t } = useTranslations();
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
    phase: [],
    types: [],
    platform: [],
  });

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleCreateContent = () => {
    if (projectId) {
      openDialog(projectId);
    }
  };

  // Get current view from URL query parameter
  const currentView = searchParams.get("view") || "table";

  // Render the appropriate view based on current view
  const renderView = () => {
    switch (currentView) {
      case "table":
        return (
          <TableView projectId={projectId} userId={userId} filters={filters} />
        );
      case "kanban":
        return (
          <KanbanView projectId={projectId} userId={userId} filters={filters} />
        );
      case "list":
        return (
          <ListView projectId={projectId} userId={userId} filters={filters} />
        );
      case "calendar":
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
            <p className="text-muted-foreground">
              Calendar view coming soon...
            </p>
          </div>
        );
      default:
        return (
          <TableView projectId={projectId} userId={userId} filters={filters} />
        );
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header with Create Content Button and Search/Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Search/Filter - takes full width on mobile */}
        <div className="flex-1 w-full md:w-auto">
          <SearchFilterContent
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        {/* Create Content Button - full width on mobile, auto on desktop */}
        <ButtonPrimary
          size="sm"
          onClick={handleCreateContent}
          disabled={!projectId}
          className="w-full md:w-auto shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("projects.createContent")}
        </ButtonPrimary>
      </div>

      {/* View Content */}
      <div className="mt-4">{renderView()}</div>
    </div>
  );
}
