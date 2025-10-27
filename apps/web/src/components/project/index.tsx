"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
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
  const [currentView] = useQueryState("view", { defaultValue: "list" });
  const [contentType] = useQueryState("contentType", {
    defaultValue: "campaign",
  });
  const { openDialog } = useContentDialogStore();
  const { t } = useTranslations();
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
    campaignTypes: [],
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

  // Render the appropriate view based on current view
  const renderView = () => {
    switch (currentView) {
      case "list":
        return (
          <ListView
            projectId={projectId}
            userId={userId}
            filters={filters}
            contentType={contentType as "campaign" | "routine"}
          />
        );
      case "kanban":
        return (
          <KanbanView
            projectId={projectId}
            userId={userId}
            filters={filters}
            contentType={contentType as "campaign" | "routine"}
          />
        );
      case "table":
        return (
          <TableView
            projectId={projectId}
            userId={userId}
            filters={filters}
            contentType={contentType as "campaign" | "routine"}
          />
        );
      case "calendar":
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">
              {t("project.viewMessages.calendar.title")}
            </h3>
            <p className="text-muted-foreground">
              {t("project.viewMessages.calendar.description")}
            </p>
          </div>
        );
      default:
        return (
          <ListView
            projectId={projectId}
            userId={userId}
            filters={filters}
            contentType={contentType as "campaign" | "routine"}
          />
        );
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header with Create Content Button and Search/Filter */}
      <div className="space-y-3">
        {/* Mobile Layout - Inline with search */}
        <div className="flex md:hidden items-center gap-2">
          <div className="flex-1">
            <SearchFilterContent
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>
          <ButtonPrimary
            size="xs"
            onClick={handleCreateContent}
            disabled={!projectId}
            className="shrink-0"
          >
            <Plus className="h-3 w-3" />
          </ButtonPrimary>
        </div>

        {/* Desktop Layout - Separate rows */}
        <div className="hidden md:flex md:items-center md:justify-between gap-3">
          <div className="flex-1">
            <SearchFilterContent
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>
          <ButtonPrimary
            size="xs"
            onClick={handleCreateContent}
            disabled={!projectId}
            className="shrink-0"
          >
            <Plus className="h-3 w-3 mr-1" />
            {t("projects.createContent")}
          </ButtonPrimary>
        </div>
      </div>

      {/* View Content */}
      <div className="mt-4">{renderView()}</div>
    </div>
  );
}
