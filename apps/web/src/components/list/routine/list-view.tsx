"use client";

import { useQuery } from "convex-helpers/react/cache";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { FilterState } from "../../project/search-filter-content";
import { StatusSection } from "../status-section";
import { RoutineContentCard } from "./content-card";
import { ContentRoutineStatus, Platform } from "@/types/status";

// Routine content type
interface RoutineContent {
  _id: Id<"contentRoutines">;
  _creationTime: number;
  userId: string;
  projectId: Id<"projects">;
  title: string;
  notes?: string;
  platform: Platform;
  status: ContentRoutineStatus;
  statusHistory: Array<{
    status: string;
    timestamp: number;
    scheduledAt?: string;
    publishedAt?: string;
    note?: string;
  }>;
  createdAt: number;
  updatedAt: number;
}

interface RoutineListViewProps {
  projectId?: Id<"projects">;
  userId?: string;
  filters: FilterState;
}

export default function RoutineListView({
  projectId,
  userId,
  filters,
}: RoutineListViewProps) {
  // Fetch routines
  const routines = useQuery(
    api.queries.contentRoutines.getByProject,
    projectId
      ? {
          projectId,
          search: filters.search || undefined,
          status: filters.status.length > 0 ? filters.status : undefined,
          platform: filters.platform.length > 0 ? filters.platform : undefined,
        }
      : "skip",
  );

  if (!projectId || !userId) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Routine List View</h3>
        <p className="text-muted-foreground">
          Please select a project to view routines in list format.
        </p>
      </div>
    );
  }

  if (!routines) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Group routines by status
  const routinesByStatus = routines.reduce(
    (acc, routine) => {
      if (!acc[routine.status]) {
        acc[routine.status] = [];
      }
      acc[routine.status].push(routine);
      return acc;
    },
    {} as Record<string, RoutineContent[]>,
  );

  // Routine status config
  const routineStatusConfig = [
    {
      key: "plan",
      title: "Plan",
      color: "bg-blue-200",
      count: routinesByStatus.plan?.length || 0,
    },
    {
      key: "in_progress",
      title: "In Progress",
      color: "bg-yellow-200",
      count: routinesByStatus.in_progress?.length || 0,
    },
    {
      key: "scheduled",
      title: "Scheduled",
      color: "bg-purple-200",
      count: routinesByStatus.scheduled?.length || 0,
    },
    {
      key: "published",
      title: "Published",
      color: "bg-green-200",
      count: routinesByStatus.published?.length || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {routineStatusConfig.map((status) => (
          <StatusSection
            key={status.key}
            title={status.title}
            color={status.color}
            count={status.count}
            contents={routinesByStatus[status.key] || []}
            projectId={projectId}
            userId={userId}
            contentType="routine"
            renderContent={(content) => (
              <RoutineContentCard
                key={content._id}
                content={content}
                projectId={projectId}
                userId={userId}
              />
            )}
          />
        ))}
      </div>
    </div>
  );
}
