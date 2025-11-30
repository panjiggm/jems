"use client";

import React from "react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@packages/backend/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Edit3,
  Trash2,
  RotateCcw,
  CheckCircle,
  Rocket,
  Calendar,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "@/hooks/use-translations";

interface RecentActivityProps {
  projectId?: string;
  limit?: number;
}

// Helper function to get action icon and color
const getActionIcon = (action: string, entityType: string) => {
  switch (action) {
    case "created":
      return {
        icon: Sparkles,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      };
    case "updated":
      return {
        icon: Edit3,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      };
    case "deleted":
      return {
        icon: Trash2,
        color: "text-red-600",
        bgColor: "bg-red-50",
      };
    case "status_changed":
      return {
        icon: RotateCcw,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      };
    case "completed":
      return {
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
      };
    case "published":
      return {
        icon: Rocket,
        color: "text-green-600",
        bgColor: "bg-green-50",
      };
    case "scheduled":
      return {
        icon: Calendar,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      };
    default:
      return {
        icon: FileText,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
      };
  }
};

// Helper function to format time
const formatActivityTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const activityDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  if (activityDate.getTime() === today.getTime()) {
    return `Today ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;
  } else {
    return formatDistanceToNow(date, { addSuffix: true });
  }
};

const RecentActivity: React.FC<RecentActivityProps> = ({
  projectId,
  limit = 10,
}) => {
  const { t } = useTranslations();

  // Fetch recent activities
  const activities = useQuery(
    api.queries.projectActivities.getRecentActivities,
    {
      projectId: projectId as any,
      limit,
    },
  );

  if (activities === undefined) {
    return (
      <div className="p-6">
        <h3 className="font-medium text-sm text-muted-foreground mb-4">
          {t("projects.activity.title")}
        </h3>
        <div className="space-y-0">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse relative">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                {i < 2 && <div className="w-px h-8 bg-gray-200 mt-2"></div>}
              </div>
              <div className="flex-1 pb-6">
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="p-6">
        <h3 className="font-medium text-sm text-muted-foreground mb-4">
          {t("projects.activity.title")}
        </h3>
        <div className="text-center py-8">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {t("projects.activity.noActivity")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="font-medium text-sm text-muted-foreground mb-4">
        {t("projects.activity.title")}
      </h3>
      <div className="space-y-0">
        {activities.map((activity, index) => {
          const {
            icon: IconComponent,
            color,
            bgColor,
          } = getActionIcon(activity.action, activity.entityType);
          const isLast = index === activities.length - 1;

          return (
            <div key={activity._id} className="flex gap-3 group relative">
              {/* Activity Icon with connecting line */}
              <div className="flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full border flex items-center justify-center text-sm ${bgColor} relative z-10`}
                >
                  <IconComponent className={`h-4 w-4 ${color}`} />
                </div>
                {/* Connecting line */}
                {!isLast && <div className="w-px h-8 bg-border mt-2"></div>}
              </div>

              <div className="flex-1 min-w-0 pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="text-gray-700 text-xs">
                        {activity.description ||
                          `${t(`projects.activity.actions.${activity.action}`)} ${t(`projects.activity.entities.${activity.entityType}`)}`}
                      </span>
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {formatActivityTime(activity.timestamp)}
                    </p>

                    {/* Status badges for specific actions */}
                    {activity.action === "status_changed" &&
                      activity.metadata && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {activity.metadata.oldValue} →{" "}
                            {activity.metadata.newValue}
                          </Badge>
                        </div>
                      )}

                    {activity.action === "published" && (
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600">
                          {t("projects.activity.statuses.published")}
                        </span>
                      </div>
                    )}

                    {activity.action === "completed" && (
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600">
                          {t("projects.activity.statuses.completed")}
                        </span>
                      </div>
                    )}

                    {activity.action === "scheduled" &&
                      activity.metadata?.scheduledAt && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {t("projects.activity.statuses.scheduledFor")}{" "}
                            {new Date(
                              activity.metadata.scheduledAt,
                            ).toLocaleDateString()}
                          </Badge>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View all activities link */}
      {activities.length >= limit && (
        <div className="pt-4 border-t mt-4">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t("projects.activity.viewAll")} →
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
