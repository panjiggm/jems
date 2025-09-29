"use client";

import React from "react";
import { Plus, Calendar, Kanban, Table, List } from "lucide-react";
import ProjectStats from "@/components/projects/project-stats";
import RecentActivity from "@/components/projects/recent-activity";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { CreateProjectDialog } from "@/components/projects/dialog-create-project";
import { useCreateProjectDialogStore } from "@/store/use-dialog-store";
import { useTranslations } from "@/hooks/use-translations";
import TabsCustom from "@/components/tabs/tabs-custom";
// import ProjectBreadcrumb from "@/components/projects/project-breadcrumb";
import { useParams, usePathname } from "next/navigation";
import { useContentDialogStore } from "@/store/use-dialog-content-store";
import { ContentDialog } from "@/components/contents/dialog-content";
import { TabsYear } from "@/components/tabs";
import ProjectBreadcrumb from "@/components/projects/project-breadcrumb";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const { openDialog } = useCreateProjectDialogStore();
  const { openDialog: openContentDialog } = useContentDialogStore();
  const { t } = useTranslations();

  // Determine current route type
  const getRouteInfo = () => {
    const segments = pathname.split("/").filter(Boolean);
    const isProjectsRoute = segments[1] === "projects";

    // Check if we're on /projects/[year]/[projectId] route
    const year =
      segments[2] && /^\d{4}$/.test(segments[2]) ? segments[2] : null;
    const projectId = year ? segments[3] : segments[2];
    const isProjectDetail =
      !!projectId &&
      projectId !== "contents" &&
      projectId !== "tasks" &&
      projectId !== "calendar";

    return {
      isProjectsRoute,
      year,
      projectId,
      isProjectDetail,
      isBaseRoute: pathname === `/${locale}/projects`,
      isYearRoute: year && !projectId,
      isProjectRoute: isProjectDetail,
    };
  };

  const routeInfo = getRouteInfo();

  const getProjectsTabs = () => {
    const basePath = routeInfo.year
      ? `/${locale}/projects/${routeInfo.year}/${routeInfo.projectId}`
      : `/${locale}/projects`;

    return [
      {
        id: "table",
        label: "Table",
        icon: Table,
        href: `${basePath}?view=table`,
      },
      {
        id: "kanban",
        label: "Kanban",
        icon: Kanban,
        href: `${basePath}?view=kanban`,
      },
      {
        id: "list",
        label: "List",
        icon: List,
        href: `${basePath}?view=list`,
      },
      {
        id: "calendar",
        label: "Calendar",
        icon: Calendar,
        href: `${basePath}?view=calendar`,
      },
    ];
  };

  const projectsTabs = getProjectsTabs();

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center justify-between w-full px-2">
            <ProjectBreadcrumb />
            {/* <div></div> */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ButtonPrimary size="sm" onClick={openDialog}>
                <Plus className="h-4 w-4 mr-2" />
                {t("projects.createProject")}
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="bg-white border-b">
            {/* Show TabsYear for base route and year route */}
            {(routeInfo.isBaseRoute || routeInfo.isYearRoute) && (
              <TabsYear useUrlNavigation={true} locale={locale} />
            )}

            {/* Show TabsCustom for project detail routes */}
            {routeInfo.isProjectRoute && (
              <TabsCustom
                tabs={projectsTabs}
                defaultValue="info"
                useUrlNavigation={true}
                className="font-black"
              />
            )}
          </div>

          {/* Content Area - This is where children will be rendered */}
          <div className="p-6 space-y-6">{children}</div>
        </div>

        {/* Left Sidebar - User Info */}
        <div className="w-full lg:w-80 bg-white border-l lg:min-h-screen">
          {/* User Header */}
          <ProjectStats />

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </div>

      {/* Create Project Dialog */}
      <CreateProjectDialog />
      <ContentDialog />
    </div>
  );
}
