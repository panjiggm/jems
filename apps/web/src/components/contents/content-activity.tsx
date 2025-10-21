"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Send,
  Clock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentActivityProps {
  contentId: Id<"contentCampaigns"> | Id<"contentRoutines">;
  contentType: "content_campaign" | "content_routine";
  statusHistory?: Array<{
    status: string;
    timestamp: number;
    note?: string;
    scheduledAt?: string;
    publishedAt?: string;
  }>;
}

// Map action types to icons
const getActionIcon = (action: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    created: FileText,
    updated: Edit,
    deleted: Trash2,
    completed: CheckCircle2,
    status_changed: AlertCircle,
    scheduled: Calendar,
    published: Send,
    assigned: Clock,
  };
  return iconMap[action] || FileText;
};

// Map action types to colors
const getActionColor = (action: string) => {
  const colorMap: Record<string, string> = {
    created: "text-blue-600 dark:text-blue-400",
    updated: "text-amber-600 dark:text-amber-400",
    deleted: "text-red-600 dark:text-red-400",
    completed: "text-green-600 dark:text-green-400",
    status_changed: "text-purple-600 dark:text-purple-400",
    scheduled: "text-indigo-600 dark:text-indigo-400",
    published: "text-emerald-600 dark:text-emerald-400",
    assigned: "text-cyan-600 dark:text-cyan-400",
  };
  return colorMap[action] || "text-gray-600 dark:text-gray-400";
};

export function ContentActivity({
  contentId,
  contentType,
  statusHistory = [],
}: ContentActivityProps) {
  // Fetch activities for this content
  const activities = useQuery(
    api.queries.projectActivities.getEntityActivities,
    {
      entityType: contentType,
      entityId: contentId,
      limit: 50,
    },
  );

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // If less than 1 minute ago
    if (diffInMinutes < 1) {
      return "Just now";
    }
    // If less than 1 hour ago
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
    }
    // If less than 24 hours ago
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    }
    // If less than 7 days ago
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
    }

    // Otherwise show full date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFullTimestamp = (timestamp?: string | number) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (activities === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Check if we have any data to show
  const hasStatusHistory = statusHistory && statusHistory.length > 0;
  const hasActivities = activities && activities.length > 0;

  // Empty state - no activities and no status history
  if (!hasActivities && !hasStatusHistory) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <h3 className="text-sm font-medium text-foreground mb-1">
          No Activity Yet
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Activities such as updates, status changes, and other actions will
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status History Section */}
      {hasStatusHistory && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Status History
          </h3>
          <div className="space-y-2">
            {statusHistory.map((history, index) => (
              <div
                key={index}
                className="flex items-start gap-3 py-3 border-b border-border last:border-b-0"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex-shrink-0 text-purple-600 dark:text-purple-400">
                  <AlertCircle className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs capitalize">
                      {history.status.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(history.timestamp)}
                    </span>
                  </div>

                  {history.note && (
                    <p className="text-sm text-muted-foreground mb-1">
                      {history.note}
                    </p>
                  )}

                  {history.scheduledAt && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Scheduled: {formatFullTimestamp(history.scheduledAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activities Section */}
      {hasActivities && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Project Activities
          </h3>
          <div className="space-y-3">
            {activities.map((activity) => {
              const IconComponent = getActionIcon(activity.action);
              const iconColor = getActionColor(activity.action);

              return (
                <div
                  key={activity._id}
                  className="flex items-start gap-3 py-3 border-b border-border last:border-b-0"
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full bg-muted flex-shrink-0",
                      iconColor,
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {activity.action.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>

                    {activity.description && (
                      <p className="text-sm text-foreground mb-1">
                        {activity.description}
                      </p>
                    )}

                    {activity.metadata && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {typeof activity.metadata === "object" &&
                          Object.entries(activity.metadata).map(
                            ([key, value]) => (
                              <div key={key} className="flex gap-2">
                                <span className="font-medium capitalize">
                                  {key.replace(/_/g, " ")}:
                                </span>
                                <span>{String(value)}</span>
                              </div>
                            ),
                          )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
