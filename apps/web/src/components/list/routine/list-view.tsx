"use client";

import { useQuery } from "convex-helpers/react/cache";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { FilterState } from "@/app/[locale]/(protected)/projects/[year]/[projectId]/_components/search-filter-content";
import { RoutineContentCard } from "./content-card";
import { ContentRoutineStatus, Platform } from "@/types/status";
import { useTranslations } from "@/hooks/use-translations";
import { Target, PlayCircle, Calendar, Send } from "lucide-react";

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

  if (routines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground text-sm">
          {t("list.noContentInStatus").replace(
            "{type}",
            t("list.routinePlural"),
          )}
        </p>
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

  // Define status order and config
  const statusOrder: ContentRoutineStatus[] = [
    "plan",
    "in_progress",
    "scheduled",
    "published",
  ];

  const statusLabels: Record<ContentRoutineStatus, string> = {
    plan: "Plan",
    in_progress: "In Progress",
    scheduled: "Scheduled",
    published: "Published",
  };

  const statusIcons: Record<ContentRoutineStatus, any> = {
    plan: Target,
    in_progress: PlayCircle,
    scheduled: Calendar,
    published: Send,
  };

  const statusColors: Record<ContentRoutineStatus, string> = {
    plan: "text-blue-800",
    in_progress: "text-yellow-800",
    scheduled: "text-purple-800",
    published: "text-green-800",
  };

  return (
    <div className="w-full space-y-6">
      {statusOrder.map((status) => {
        const items = routinesByStatus[status] || [];
        if (items.length === 0) return null;

        const StatusIcon = statusIcons[status];
        const statusColor = statusColors[status];

        return (
          <div key={status} className="space-y-2">
            {/* Status Header */}
            <div className="flex items-center gap-2 px-2">
              <StatusIcon className={`h-3 w-3 ${statusColor}`} />
              <h3
                className={`text-xs font-medium tracking-wide ${statusColor}`}
              >
                {statusLabels[status]}
              </h3>
              <span className="text-xs text-muted-foreground">
                {items.length}
              </span>
            </div>

            {/* Items List */}
            <div className="border border-border rounded-lg overflow-hidden bg-card">
              {items.map((routine, index) => (
                <div key={routine._id}>
                  <RoutineContentCard content={routine} />
                  {index < items.length - 1 && (
                    <div className="border-b border-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
