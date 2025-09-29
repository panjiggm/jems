"use client";

import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { FilterState } from "../search-filter-content";
import { StatusSection } from "./index";

interface ListViewProps {
  projectId?: Id<"projects">;
  userId?: string;
  filters: FilterState;
}

export default function ListView({
  projectId,
  userId,
  filters,
}: ListViewProps) {
  const contents = useQuery(
    api.queries.contents.getByProject,
    projectId
      ? {
          projectId,
          search: filters.search || undefined,
          status: filters.status.length > 0 ? filters.status : undefined,
          priority: filters.priority.length > 0 ? filters.priority : undefined,
          platform: filters.platform.length > 0 ? filters.platform : undefined,
        }
      : "skip",
  );

  if (!projectId || !userId) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">List View</h3>
        <p className="text-muted-foreground">
          Please select a project to view contents in list format.
        </p>
      </div>
    );
  }

  if (!contents) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Group contents by phase
  const contentsByPhase = contents.reduce(
    (acc, content) => {
      if (!acc[content.phase]) {
        acc[content.phase] = [];
      }
      acc[content.phase].push(content);
      return acc;
    },
    {} as Record<string, typeof contents>,
  );

  const phaseConfig = [
    {
      key: "plan",
      title: "Plan",
      color: "bg-gray-200",
      count: contentsByPhase.plan?.length || 0,
    },
    {
      key: "production",
      title: "Production",
      color: "bg-blue-200",
      count: contentsByPhase.production?.length || 0,
    },
    {
      key: "review",
      title: "Review",
      color: "bg-yellow-200",
      count: contentsByPhase.review?.length || 0,
    },
    {
      key: "published",
      title: "Published",
      color: "bg-green-200",
      count: contentsByPhase.published?.length || 0,
    },
    {
      key: "done",
      title: "Done",
      color: "bg-purple-200",
      count: contentsByPhase.done?.length || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {phaseConfig.map((phase) => (
          <StatusSection
            key={phase.key}
            title={phase.title}
            color={phase.color}
            count={phase.count}
            contents={contentsByPhase[phase.key] || []}
            projectId={projectId}
            userId={userId}
          />
        ))}
      </div>
    </div>
  );
}
