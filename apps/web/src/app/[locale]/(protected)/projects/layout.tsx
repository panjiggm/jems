"use client";

import React from "react";
import { Plus, Calendar, Kanban, Table, List, Sparkles } from "lucide-react";
import ProjectStats from "@/components/projects/project-stats";
import RecentActivity from "@/components/projects/recent-activity";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/components/projects/dialog-create-project";
import { TemplateProjectsDialog } from "@/components/projects/dialog-template-projects";
import { useCreateProjectDialogStore } from "@/store/use-dialog-store";
import { useTemplateDialogStore } from "@/store/use-dialog-template-store";
import { useTranslations } from "@/hooks/use-translations";
import TabsCustom from "@/components/tabs/tabs-custom";
import { useParams, usePathname } from "next/navigation";
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
  const { openDialog: openTemplateDialog } = useTemplateDialogStore();
  const { t } = useTranslations();

  // Determine current route type
  const getRouteInfo = () => {
    const segments = pathname.split("/").filter(Boolean);
    const isProjectsRoute = segments[1] === "projects";

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
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
            {/* Breadcrumb */}
            <div className="flex-1 min-w-0">
              <ProjectBreadcrumb />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Template Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={openTemplateDialog}
                className="flex-1 sm:flex-none"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden md:inline ml-2">
                  {t("projects.templates.button.useTemplate")}
                </span>
              </Button>

              {/* Create Project Button */}
              <ButtonPrimary
                size="sm"
                onClick={openDialog}
                className="flex-1 sm:flex-none"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline ml-2">
                  {t("projects.createProject")}
                </span>
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12">
        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:col-span-10 order-2 lg:order-1">
          {/* Tabs */}
          <div className="bg-white border-b overflow-x-auto">
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
          <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-auto">
            {children}
          </div>
        </div>

        {/* Right Sidebar - Stats & Activity */}
        <div className="w-full lg:col-span-2 bg-white border-t lg:border-t-0 lg:border-l order-1 lg:order-2">
          {/* User Header */}
          <div className="lg:sticky lg:top-14">
            <ProjectStats />

            {/* Recent Activity - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block">
              <RecentActivity />
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CreateProjectDialog />
      <TemplateProjectsDialog />
      <ContentDialog />
    </div>
  );
}
