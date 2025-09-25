"use client";

import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { StatusSection } from "./status-section";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListViewProps {
  projectId?: Id<"projects">;
  userId?: string;
}

export default function ListView({ projectId, userId }: ListViewProps) {
  const contents = useQuery(
    api.queries.contents.getByProject,
    projectId ? { projectId } : "skip",
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

  // Group contents by status
  const contentsByStatus = contents.reduce(
    (acc, content) => {
      if (!acc[content.status]) {
        acc[content.status] = [];
      }
      acc[content.status].push(content);
      return acc;
    },
    {} as Record<string, typeof contents>,
  );

  const statusConfig = [
    {
      key: "draft",
      title: "To-do",
      color: "bg-gray-200",
      count: contentsByStatus.draft?.length || 0,
    },
    {
      key: "in_progress",
      title: "On Progress",
      color: "bg-blue-200",
      count: contentsByStatus.in_progress?.length || 0,
    },
    {
      key: "scheduled",
      title: "In Review",
      color: "bg-orange-200",
      count: contentsByStatus.scheduled?.length || 0,
    },
    {
      key: "published",
      title: "Published",
      color: "bg-green-200",
      count: contentsByStatus.published?.length || 0,
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Content List</h3>
        <Button className="h-9">
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      <div className="space-y-4">
        {statusConfig.map((status) => (
          <StatusSection
            key={status.key}
            title={status.title}
            color={status.color}
            count={status.count}
            contents={contentsByStatus[status.key] || []}
            projectId={projectId}
            userId={userId}
          />
        ))}
      </div>
    </div>
  );
}
