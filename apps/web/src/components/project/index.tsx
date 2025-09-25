"use client";

import { useState } from "react";
import TabsContents from "./tabs-contents";
import { FilterState } from "./search-filter-content";
import { Id } from "@packages/backend/convex/_generated/dataModel";

interface ProjectComponentProps {
  projectId?: Id<"projects">;
  userId?: string;
}

export default function ProjectComponent({
  projectId,
  userId,
}: ProjectComponentProps) {
  const [activeTab, setActiveTab] = useState("kanban");
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
    priority: [],
    platform: [],
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="w-full space-y-4">
      {/* Tabs Content */}
      <TabsContents
        projectId={projectId}
        userId={userId}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  );
}
