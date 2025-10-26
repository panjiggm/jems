"use client";

import { useQuery } from "convex-helpers/react/cache";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { FilterState } from "../../project/search-filter-content";
import { StatusSection } from "../status-section";
import { RoutineContentCard } from "./content-card";
import { ContentRoutineStatus, Platform } from "@/types/status";
import { useTranslations } from "@/hooks/use-translations";

// Routine content type
interface RoutineContent {
  _id: Id<"contentRoutines">;
  _creationTime: number;
  userId: string;
  projectId: Id<"projects">;
  title: string;
  slug?: string;
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
  const { t } = useTranslations();

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
        <h3 className="text-lg font-semibold mb-2">{t("list.routineList")}</h3>
        <p className="text-muted-foreground">
          {t("list.selectProject")} {t("list.routinePlural")}{" "}
          {t("list.inFormat")} {t("list.listFormat")}.
        </p>
      </div>
    );
  }

  if (!routines) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">{t("list.loading")}</div>
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
      title: t("kanban.status.plan"),
      color: "bg-blue-200",
      count: routinesByStatus.plan?.length || 0,
    },
    {
      key: "in_progress",
      title: t("kanban.status.inProgress"),
      color: "bg-yellow-200",
      count: routinesByStatus.in_progress?.length || 0,
    },
    {
      key: "scheduled",
      title: t("kanban.status.scheduled"),
      color: "bg-purple-200",
      count: routinesByStatus.scheduled?.length || 0,
    },
    {
      key: "published",
      title: t("kanban.status.published"),
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
