"use client";

import React from "react";
import {
  Plus,
  Calendar,
  Kanban,
  Table,
  List,
  Sparkles,
  ArrowLeft,
  Edit2,
  Trash2,
} from "lucide-react";
import ProjectStats from "@/components/projects/project-stats";
import RecentActivity from "@/components/projects/recent-activity";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/components/projects/dialog-create-project";
import { EditProjectDialog } from "@/components/projects/dialog-edit-project";
import { DeleteProjectDialog } from "@/components/projects/dialog-delete-project";
import { TemplateProjectsDialog } from "@/components/projects/dialog-template-projects";
import {
  useCreateProjectDialogStore,
  useEditProjectDialogStore,
  useDeleteProjectDialogStore,
} from "@/store/use-dialog-store";
import { useTemplateDialogStore } from "@/store/use-dialog-template-store";
import { useTranslations } from "@/hooks/use-translations";
import TabsCustom from "@/components/tabs/tabs-custom";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ContentDialog } from "@/components/contents/dialog-content";
import { TabsYear } from "@/components/tabs";
import ProjectBreadcrumb from "@/components/projects/project-breadcrumb";
import { ButtonGroupDropdown } from "@/components/ui/button-group";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@packages/backend/convex/_generated/api";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const locale = params.locale as string;
  const { openDialog } = useCreateProjectDialogStore();
  const { openDialog: openTemplateDialog } = useTemplateDialogStore();
  const openEditDialog = useEditProjectDialogStore((state) => state.openDialog);
  const openDeleteDialog = useDeleteProjectDialogStore(
    (state) => state.openDialog,
  );
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

  // Fetch project data when on project detail route
  const projectStats = useQuery(
    api.queries.stats.getProjectStats,
    routeInfo.isProjectRoute && routeInfo.projectId
      ? { projectId: routeInfo.projectId as any }
      : "skip",
  );

  // Handlers for edit and delete
  const handleEditProject = () => {
    if (projectStats && routeInfo.projectId) {
      openEditDialog(routeInfo.projectId as any, {
        title: projectStats.project.title,
        description: projectStats.project.description,
        startDate: projectStats.project.startDate,
        endDate: projectStats.project.endDate,
      });
    }
  };

  const handleDeleteProject = () => {
    if (projectStats && routeInfo.projectId) {
      openDeleteDialog(routeInfo.projectId as any, projectStats.project.title);
    }
  };

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

  // Handle back navigation
  const handleBack = () => {
    if (routeInfo.isProjectRoute && routeInfo.year) {
      router.push(`/${locale}/projects/${routeInfo.year}`);
    } else if (routeInfo.isProjectRoute) {
      router.push(`/${locale}/projects`);
    } else if (routeInfo.isYearRoute) {
      router.push(`/${locale}/projects`);
    } else {
      router.back();
    }
  };

  // Show back button on mobile only if not on base projects route
  const showBackButton = !routeInfo.isBaseRoute;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            {/* Mobile: Back Button | Desktop: Breadcrumb */}
            <div className="flex-1 min-w-0">
              {/* Mobile Back Button */}
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="sm:hidden flex items-center gap-2 text-sm font-medium"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("common.back") || "Kembali"}
                </Button>
              )}

              {/* Desktop Breadcrumb */}
              <div className="hidden sm:block">
                <ProjectBreadcrumb />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Show Create + Template buttons for projects list and year list */}
              {(routeInfo.isBaseRoute || routeInfo.isYearRoute) && (
                <ButtonGroupDropdown
                  label={t("projects.createProject")}
                  onMainClick={openDialog}
                  options={[
                    {
                      label: t("projects.templates.button.useTemplate"),
                      description:
                        "Select a template to automatically create projects",
                      icon: <Sparkles />,
                      onClick: openTemplateDialog,
                    },
                  ]}
                />
              )}

              {/* Show Edit + Delete buttons for project detail */}
              {routeInfo.isProjectRoute && projectStats && (
                <>
                  {/* Desktop buttons with text */}
                  <div className="hidden sm:flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditProject}
                      className="h-9 px-3"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      {t("projects.editDialog.buttons.update")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteProject}
                      className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("projects.deleteDialog.buttons.delete")}
                    </Button>
                  </div>

                  {/* Mobile buttons - icon only */}
                  <div className="sm:hidden flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditProject}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteProject}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
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
      <EditProjectDialog />
      <DeleteProjectDialog />
      <TemplateProjectsDialog />
      <ContentDialog />
    </div>
  );
}
