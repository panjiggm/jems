"use client";

import React from "react";
import { usePathname, useParams } from "next/navigation";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@packages/backend/convex/_generated/api";
import {
  Calendar,
  FolderOpen,
  FileText,
  CheckSquare,
  AlertTriangle,
  Rocket,
  BarChart3,
  CheckCircle2,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { useTranslations } from "@/hooks/use-translations";

interface ProjectStatsProps {
  projectId?: string;
  contentId?: string;
  taskId?: string;
}

const ProjectStats: React.FC<ProjectStatsProps> = ({
  projectId: propProjectId,
  contentId: propContentId,
  taskId: propTaskId,
}) => {
  const { t } = useTranslations();
  const pathname = usePathname();
  const params = useParams();

  // Extract IDs from URL params if not provided as props
  const projectId = propProjectId || (params.projectId as string);
  const contentId = propContentId || (params.contentId as string);
  const taskId = propTaskId || (params.taskId as string);

  // Fetch user profile
  const profile = useQuery(api.queries.profile.getProfile);

  // Determine which stats to fetch based on URL pattern
  const isProjectsList = pathname.includes("/projects") && !projectId;
  const isProjectDetail = projectId && !contentId;
  const isContentDetail = projectId && contentId && !taskId;
  // const isTaskDetail = projectId && contentId && taskId;

  // Fetch dashboard stats (all projects, contents, tasks)
  const dashboardStats = useQuery(
    api.queries.stats.getDashboardStats,
    isProjectsList ? {} : "skip",
  );

  // Fetch project-specific stats
  const projectStats = useQuery(
    api.queries.stats.getProjectStats,
    isProjectDetail && projectId ? { projectId: projectId as any } : "skip",
  );

  // Fetch content-specific stats
  const contentStats = useQuery(
    api.queries.stats.getContentStats,
    isContentDetail && contentId ? { contentId: contentId as any } : "skip",
  );

  // Fetch individual stats for specific entities
  // const individualProjectStats = useQuery(
  //   api.queries.projects.getStats,
  //   isProjectDetail && projectId ? {} : "skip",
  // );

  // const individualContentStats = useQuery(
  //   api.queries.contents.getStats,
  //   isContentDetail && projectId ? { projectId: projectId as any } : "skip",
  // );

  // const individualTaskStats = useQuery(
  //   api.queries.tasks.getStats,
  //   isContentDetail && projectId ? { projectId: projectId as any } : "skip",
  // );

  // Loading state
  if (
    (isProjectsList && dashboardStats === undefined) ||
    (isProjectDetail && projectStats === undefined) ||
    (isContentDetail && contentStats === undefined)
  ) {
    return (
      <div className="p-6 border-b">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-gray-200"></div>
            <div>
              <div className="mb-2 h-6 w-40 rounded bg-gray-200"></div>
              <div className="h-4 w-32 rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="col-span-2 flex flex-col gap-2">
                <div className="h-3 w-20 rounded bg-gray-200"></div>
                <div className="h-7 w-16 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const userName = profile?.full_name || "User";

  // Render stats based on current route
  const renderStats = () => {
    type StatItem = {
      label: string;
      value: React.ReactNode;
      tone?: "critical";
      icon: React.ComponentType<{ className?: string }>;
    };

    let items: StatItem[] = [];

    if (isProjectsList && dashboardStats) {
      items = [
        {
          label: t("projects.stats.labels.projects"),
          value: dashboardStats.summary.totalProjects,
          icon: FolderOpen,
        },
        {
          label: t("projects.stats.labels.contents"),
          value: dashboardStats.summary.totalContents,
          icon: FileText,
        },
        {
          label: t("projects.stats.labels.tasks"),
          value: dashboardStats.summary.totalTasks,
          icon: CheckSquare,
        },
        {
          label: t("projects.stats.labels.overdue"),
          value: dashboardStats.summary.totalOverdue,
          tone: "critical",
          icon: AlertTriangle,
        },
      ];
    } else if (isProjectDetail && projectStats) {
      items = [
        {
          label: t("projects.stats.labels.contents"),
          value: projectStats.summary.totalContents,
          icon: FileText,
        },
        {
          label: t("projects.stats.labels.tasks"),
          value: projectStats.summary.totalTasks,
          icon: CheckSquare,
        },
        {
          label: t("projects.stats.labels.published"),
          value: projectStats.contents.byStatus.published,
          icon: Rocket,
        },
        {
          label: t("projects.stats.labels.completion"),
          value: `${projectStats.health.taskCompletionRate}%`,
          icon: BarChart3,
        },
      ];
    } else if (isContentDetail && contentStats) {
      items = [
        {
          label: t("projects.stats.labels.tasks"),
          value: contentStats.summary.totalTasks,
          icon: CheckSquare,
        },
        {
          label: t("projects.stats.labels.completed"),
          value: contentStats.summary.completedTasks,
          icon: CheckCircle2,
        },
        {
          label: t("projects.stats.labels.overdue"),
          value: contentStats.summary.overdueTasks,
          tone: "critical",
          icon: AlertTriangle,
        },
        {
          label: t("projects.stats.labels.progress"),
          value: `${contentStats.summary.completionRate}%`,
          icon: BarChart3,
        },
      ];
    }

    if (!items.length) {
      return null;
    }

    return (
      <div className="space-y-1.5">
        {items.map(({ label, value, tone, icon: IconComponent }) => (
          <div
            key={label}
            className="flex flex-row justify-between items-center"
          >
            <div className="flex items-center gap-2">
              <IconComponent className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-muted-foreground">
                {label}
              </h4>
            </div>
            <span
              className={`font-medium leading-tight ${
                tone === "critical" ? "text-red-500" : "text-gray-600"
              }`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Get title and subtitle based on current route
  const getTitleInfo = () => {
    if (isProjectsList) {
      return {
        title: t("projects.stats.dashboardOverview"),
        subtitle: t("projects.stats.dashboardSubtitle"),
      };
    }
    if (isProjectDetail && projectStats) {
      return {
        title: projectStats.project.title,
        subtitle: `${t("projects.stats.created")} ${format(new Date(projectStats.project.createdAt), "MMM dd, yyyy")}`,
      };
    }
    if (isContentDetail && contentStats) {
      return {
        title: contentStats.content.title,
        subtitle: `${t("projects.stats.platform")}: ${contentStats.content.platform} • ${t("projects.stats.status")}: ${contentStats.content.status}`,
      };
    }
    return {
      title: userName,
      subtitle: t("projects.stats.contentCreator"),
    };
  };

  const titleInfo = getTitleInfo();

  return (
    <div className="p-6 border-b">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative bg-orange-50 rounded-lg p-4 text-orange-400">
          {isProjectsList ? (
            <FolderOpen className="h-7 w-7" />
          ) : isProjectDetail && projectStats ? (
            <FolderOpen className="h-7 w-7" />
          ) : isContentDetail && contentStats ? (
            <FileText className="h-7 w-7" />
          ) : (
            <User className="h-7 w-7" />
          )}
        </div>
        <div>
          <h2 className="font-semibold text-md">{titleInfo.title}</h2>
          <p className="text-xs text-muted-foreground">{titleInfo.subtitle}</p>
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Additional Info for specific routes */}
      {isProjectDetail && projectStats && (
        <div className="mt-4 flex flex-wrap gap-2">
          {projectStats.health.overdueItems > 0 && (
            <Badge variant="destructive">
              {projectStats.health.overdueItems} {t("projects.stats.overdue")}
            </Badge>
          )}
          {projectStats.health.upcomingItems > 0 && (
            <Badge variant="secondary">
              {projectStats.health.upcomingItems} {t("projects.stats.upcoming")}
            </Badge>
          )}
        </div>
      )}

      {isContentDetail && contentStats && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">{contentStats.content.platform}</Badge>
          <Badge
            variant={
              contentStats.content.status === "published"
                ? "default"
                : "secondary"
            }
          >
            {contentStats.content.status}
          </Badge>
          {contentStats.content.dueDate && (
            <Badge variant="outline">
              <Calendar className="h-3 w-3 mr-1" />
              {t("projects.stats.due")}{" "}
              {format(new Date(contentStats.content.dueDate), "MMM dd")}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectStats;
