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
  User,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { useTranslations } from "@/hooks/use-translations";

interface ProjectStatsProps {
  projectId?: string;
  contentId?: string;
  year?: string;
}

const ProjectStats: React.FC<ProjectStatsProps> = ({
  projectId: propProjectId,
  contentId: propContentId,
  year: propYear,
}) => {
  const { t } = useTranslations();
  const pathname = usePathname();
  const params = useParams();

  // Extract IDs from URL params if not provided as props
  const projectId = propProjectId || (params.projectId as string);
  const contentId = propContentId || (params.contentId as string);
  const year = propYear || (params.year as string);

  // Fetch user profile
  const profile = useQuery(api.queries.profile.getProfile);

  // Determine which stats to fetch based on URL pattern
  const isProjectsList = pathname.includes("/projects") && !projectId && !year;
  const isYearList = pathname.includes("/projects") && year && !projectId;
  const isProjectDetail = projectId && !contentId;

  // Fetch dashboard stats (all projects, contents, tasks)
  const dashboardStats = useQuery(
    api.queries.stats.getDashboardStats,
    isProjectsList ? {} : "skip",
  );

  // Fetch year-specific stats
  const yearStats = useQuery(
    api.queries.stats.getYearStats,
    isYearList && year ? { year: parseInt(year) } : "skip",
  );

  // Fetch project-specific stats
  const projectStats = useQuery(
    api.queries.stats.getProjectStats,
    isProjectDetail && projectId ? { projectId: projectId as any } : "skip",
  );

  // Fetch project-year-specific stats
  const projectYearStats = useQuery(
    api.queries.stats.getProjectYearStats,
    isProjectDetail && projectId && year
      ? {
          projectId: projectId as any,
          year: parseInt(year),
        }
      : "skip",
  );

  // Loading state
  if (
    (isProjectsList && dashboardStats === undefined) ||
    (isYearList && yearStats === undefined) ||
    (isProjectDetail &&
      projectStats === undefined &&
      projectYearStats === undefined)
  ) {
    return (
      <div className="p-4 sm:p-6 border-b">
        <div className="animate-pulse">
          {/* Desktop Loading */}
          <div className="hidden sm:block">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-gray-200"></div>
              <div>
                <div className="mb-2 h-6 w-40 rounded bg-gray-200"></div>
                <div className="h-4 w-32 rounded bg-gray-200"></div>
              </div>
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-3 w-20 rounded bg-gray-200"></div>
                  <div className="h-4 w-12 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Loading */}
          <div className="sm:hidden">
            <div className="mb-3 h-4 w-32 rounded bg-gray-200"></div>
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
                  <div className="h-4 w-8 rounded bg-gray-200"></div>
                  <div className="h-2 w-12 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
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
    } else if (isYearList && yearStats) {
      items = [
        {
          label: t("projects.stats.labels.projects"),
          value: yearStats.summary.totalProjects,
          icon: FolderOpen,
        },
        {
          label: t("projects.stats.labels.contents"),
          value: yearStats.summary.totalContents,
          icon: FileText,
        },
        {
          label: t("projects.stats.labels.tasks"),
          value: yearStats.summary.totalTasks,
          icon: CheckSquare,
        },
        {
          label: t("projects.stats.labels.overdue"),
          value: yearStats.summary.totalOverdue,
          tone: "critical",
          icon: AlertTriangle,
        },
      ];
    } else if (isProjectDetail && (projectStats || projectYearStats)) {
      const stats = projectYearStats || projectStats;
      if (stats) {
        items = [
          {
            label: t("projects.stats.labels.contents"),
            value: stats.summary.totalContents,
            icon: FileText,
          },
          {
            label: t("projects.stats.labels.tasks"),
            value: stats.summary.totalTasks,
            icon: CheckSquare,
          },
          {
            label: t("projects.stats.labels.published"),
            value:
              stats.contents.campaigns.byStatus.published +
              stats.contents.routines.byStatus.published,
            icon: Rocket,
          },
          {
            label: t("projects.stats.labels.completion"),
            value: `${stats.health.taskCompletionRate}%`,
            icon: BarChart3,
          },
        ];
      }
    }

    if (!items.length) {
      return null;
    }

    return (
      <>
        {/* Desktop Layout - Vertical list with labels */}
        <div className="hidden sm:block space-y-1.5">
          {items.map(({ label, value, tone, icon: IconComponent }) => (
            <div
              key={label}
              className="flex flex-row justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <IconComponent className="h-3.5 w-3.5 text-muted-foreground" />
                <h4 className="text-xs font-medium text-muted-foreground">
                  {label}
                </h4>
              </div>
              <span
                className={`font-medium text-xs leading-tight ${
                  tone === "critical" ? "text-red-500" : "text-gray-600"
                }`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </>
    );
  };

  // Get title and subtitle based on current route
  const getTitleInfo = () => {
    if (isProjectsList) {
      const projectCount = dashboardStats?.summary.totalProjects || 0;
      const contentCount = dashboardStats?.summary.totalContents || 0;
      const taskCount = dashboardStats?.summary.totalTasks || 0;

      return {
        title: t("projects.stats.dashboardOverview"),
        subtitle: `${projectCount} ${t("projects.stats.labels.projects").toLowerCase()}, ${contentCount} ${t("projects.stats.labels.contents").toLowerCase()}, ${taskCount} ${t("projects.stats.labels.tasks").toLowerCase()}`,
      };
    }
    if (isYearList && yearStats) {
      const projectCount = yearStats.summary.totalProjects;
      const contentCount = yearStats.summary.totalContents;
      const taskCount = yearStats.summary.totalTasks;

      return {
        title: `${t("projects.stats.yearOverview")} ${year}`,
        subtitle: `${projectCount} ${t("projects.stats.labels.projects").toLowerCase()}, ${contentCount} ${t("projects.stats.labels.contents").toLowerCase()}, ${taskCount} ${t("projects.stats.labels.tasks").toLowerCase()}`,
      };
    }
    if (isProjectDetail && (projectStats || projectYearStats)) {
      const stats = projectYearStats || projectStats;
      if (stats) {
        const contentCount = stats.summary.totalContents;
        const taskCount = stats.summary.totalTasks;
        const completionRate = stats.health.taskCompletionRate;

        return {
          title: stats.project.title,
          subtitle: `${contentCount} ${t("projects.stats.labels.contents").toLowerCase()}, ${taskCount} ${t("projects.stats.labels.tasks").toLowerCase()} • ${completionRate}% ${t("projects.stats.labels.completion").toLowerCase()}`,
        };
      }
    }
    return {
      title: userName,
      subtitle: t("projects.stats.contentCreator"),
    };
  };

  const titleInfo = getTitleInfo();

  return (
    <div className="hidden sm:block p-4 sm:p-6 border-b">
      {/* Header - Hidden on mobile */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-orange-50 rounded-lg p-4 text-orange-400">
          {isProjectsList ? (
            <FolderOpen className="h-7 w-7" />
          ) : isYearList ? (
            <Calendar className="h-7 w-7" />
          ) : isProjectDetail && (projectStats || projectYearStats) ? (
            <FolderOpen className="h-7 w-7" />
          ) : (
            <User className="h-7 w-7" />
          )}
        </div>
        <div>
          <h2 className="font-semibold text-sm">{titleInfo.title}</h2>
          <p className="text-xs text-muted-foreground">{titleInfo.subtitle}</p>
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Additional Info for specific routes */}
      {isProjectDetail && (projectStats || projectYearStats) && (
        <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
          {(() => {
            const stats = projectYearStats || projectStats;
            if (stats) {
              return (
                <>
                  {stats.health.overdueItems > 0 && (
                    <Badge
                      variant="destructive"
                      className="text-[10px] sm:text-xs px-2 py-0.5"
                    >
                      {stats.health.overdueItems} {t("projects.stats.overdue")}
                    </Badge>
                  )}
                  {stats.health.upcomingItems > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] sm:text-xs px-2 py-0.5"
                    >
                      {stats.health.upcomingItems}{" "}
                      {t("projects.stats.upcoming")}
                    </Badge>
                  )}
                </>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
};

export default ProjectStats;
