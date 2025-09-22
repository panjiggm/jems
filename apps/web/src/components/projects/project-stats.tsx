"use client";

import React from "react";
import { usePathname } from "next/navigation";
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
  Clock,
  CheckCircle2,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "../ui/badge";

interface ProjectStatsProps {
  projectId?: string;
  contentId?: string;
  taskId?: string;
}

const ProjectStats: React.FC<ProjectStatsProps> = ({
  projectId,
  contentId,
  taskId,
}) => {
  const pathname = usePathname();

  // Fetch user profile
  const profile = useQuery(api.queries.profile.getProfile);

  // Determine which stats to fetch based on URL pattern
  const isProjectsList = pathname.includes("/projects") && !projectId;
  const isProjectDetail = projectId && !contentId;
  const isContentDetail = projectId && contentId && !taskId;
  const isTaskDetail = projectId && contentId && taskId;

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
  const individualProjectStats = useQuery(
    api.queries.projects.getStats,
    isProjectDetail && projectId ? {} : "skip",
  );

  const individualContentStats = useQuery(
    api.queries.contents.getStats,
    isContentDetail && projectId ? { projectId: projectId as any } : "skip",
  );

  const individualTaskStats = useQuery(
    api.queries.tasks.getStats,
    isContentDetail && projectId ? { projectId: projectId as any } : "skip",
  );

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
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

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
          label: "Projects",
          value: dashboardStats.summary.totalProjects,
          icon: FolderOpen,
        },
        {
          label: "Contents",
          value: dashboardStats.summary.totalContents,
          icon: FileText,
        },
        {
          label: "Tasks",
          value: dashboardStats.summary.totalTasks,
          icon: CheckSquare,
        },
        {
          label: "Overdue",
          value: dashboardStats.summary.totalOverdue,
          tone: "critical",
          icon: AlertTriangle,
        },
      ];
    } else if (isProjectDetail && projectStats) {
      items = [
        {
          label: "Contents",
          value: projectStats.summary.totalContents,
          icon: FileText,
        },
        {
          label: "Tasks",
          value: projectStats.summary.totalTasks,
          icon: CheckSquare,
        },
        {
          label: "Published",
          value: projectStats.contents.byStatus.published,
          icon: Rocket,
        },
        {
          label: "Completion",
          value: `${projectStats.health.taskCompletionRate}%`,
          icon: BarChart3,
        },
      ];
    } else if (isContentDetail && contentStats) {
      items = [
        {
          label: "Tasks",
          value: contentStats.summary.totalTasks,
          icon: CheckSquare,
        },
        {
          label: "Completed",
          value: contentStats.summary.completedTasks,
          icon: CheckCircle2,
        },
        {
          label: "Overdue",
          value: contentStats.summary.overdueTasks,
          tone: "critical",
          icon: AlertTriangle,
        },
        {
          label: "Progress",
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
        title: "Dashboard Overview",
        subtitle: "All your projects, contents, and tasks",
      };
    }
    if (isProjectDetail && projectStats) {
      return {
        title: projectStats.project.title,
        subtitle: `Created ${format(new Date(projectStats.project.createdAt), "MMM dd, yyyy")}`,
      };
    }
    if (isContentDetail && contentStats) {
      return {
        title: contentStats.content.title,
        subtitle: `Platform: ${contentStats.content.platform} • Status: ${contentStats.content.status}`,
      };
    }
    return {
      title: userName,
      subtitle: "Content Creator",
    };
  };

  const titleInfo = getTitleInfo();

  return (
    <div className="p-6 border-b">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar_url} alt={userName} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-background border-2 border-background rounded-full flex items-center justify-center">
            <User className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-lg">{titleInfo.title}</h2>
          <p className="text-sm text-muted-foreground">{titleInfo.subtitle}</p>
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Additional Info for specific routes */}
      {isProjectDetail && projectStats && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">{projectStats.project.type}</Badge>
          {projectStats.health.overdueItems > 0 && (
            <Badge variant="destructive">
              {projectStats.health.overdueItems} Overdue
            </Badge>
          )}
          {projectStats.health.upcomingItems > 0 && (
            <Badge variant="secondary">
              {projectStats.health.upcomingItems} Upcoming
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
              Due {format(new Date(contentStats.content.dueDate), "MMM dd")}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectStats;
