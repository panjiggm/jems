"use client";

import React from "react";
import {
  Sparkles,
  ArrowLeft,
  Edit2,
  Trash2,
  MoreVertical,
  Megaphone,
  Repeat,
  Table,
  Kanban,
  List,
  Calendar,
} from "lucide-react";
import ProjectStats from "./_components/project-stats";
import RecentActivity from "./_components/recent-activity";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateProjectDialog } from "./_components/dialog-create-project";
import { EditProjectDialog } from "./_components/dialog-edit-project";
import { DeleteProjectDialog } from "./_components/dialog-delete-project";
import { TemplateProjectsDialog } from "./_components/dialog-template-projects";
import {
  useCreateProjectDialogStore,
  useEditProjectDialogStore,
  useDeleteProjectDialogStore,
} from "@/store/use-dialog-store";
import { useTemplateDialogStore } from "@/store/use-dialog-template-store";
import { useTranslations } from "@/hooks/use-translations";
import TabsWithOverflow from "@/components/tabs/tabs-with-overflow";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ContentDialog } from "@/components/contents/dialog-content";
import { TabsYear } from "@/components/tabs";
import ProjectBreadcrumb from "./_components/project-breadcrumb";
import { ButtonGroupDropdown } from "@/components/ui/button-group";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@packages/backend/convex/_generated/api";
import { useQueryState } from "nuqs";

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
  const [contentType, setContentType] = useQueryState("contentType", {
    defaultValue: "campaign",
  });

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

  const contentOptions = [
    { value: "campaign", label: "Campaigns", icon: Megaphone },
    { value: "routine", label: "Routines", icon: Repeat },
  ];

  const viewTabs = [
    { id: "list", label: "List", icon: List },
    { id: "kanban", label: "Kanban", icon: Kanban },
    { id: "table", label: "Table", icon: Table },
    { id: "calendar", label: "Calendar", icon: Calendar },
  ];

  const currentContentOption = contentOptions.find(
    (opt) => opt.value === contentType,
  );
  const CurrentContentIcon = currentContentOption?.icon || Megaphone;

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
    <div className="bg-muted/30 min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border">
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
                  {routeInfo.isProjectRoute && projectStats?.project?.title
                    ? projectStats.project.title
                    : t("common.back") || "Kembali"}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="xs">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={handleEditProject}
                      className="cursor-pointer text-xs"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      {t("projects.editDialog.buttons.update")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDeleteProject}
                      variant="destructive"
                      className="cursor-pointer text-xs"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      {t("projects.deleteDialog.buttons.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12">
        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:col-span-10 order-2 lg:order-1">
          {/* Tabs */}
          <div className="bg-card border-b border-border overflow-x-auto">
            {/* Show TabsYear for base route and year route */}
            <div className="flex items-center gap-2 px-3 sm:px-4">
              {(routeInfo.isBaseRoute || routeInfo.isYearRoute) && (
                <TabsYear useUrlNavigation={true} locale={locale} />
              )}
            </div>

            {/* Show Content Type Dropdown + Display tabs for project detail routes */}
            {routeInfo.isProjectRoute && (
              <div className="flex items-center gap-1 px-3 sm:px-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="xs" className="gap-1 text-xs">
                      <CurrentContentIcon className="h-3 w-3" />
                      <span>{currentContentOption?.label}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40">
                    <DropdownMenuRadioGroup
                      value={contentType}
                      onValueChange={setContentType}
                    >
                      {contentOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <DropdownMenuRadioItem
                            key={option.value}
                            value={option.value}
                            className="cursor-pointer text-xs pl-2 data-[state=checked]:bg-[#f7a641] data-[state=checked]:text-[#4a2e1a] dark:data-[state=checked]:bg-[#4a2e1a] dark:data-[state=checked]:text-[#f8e9b0] [&>span]:hidden"
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {option.label}
                          </DropdownMenuRadioItem>
                        );
                      })}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="h-6 w-px bg-border" />
                <TabsWithOverflow
                  tabs={viewTabs}
                  defaultValue="list"
                  useUrlNavigation={false}
                  queryParamName="view"
                  autoAssignIcons={false}
                  className="flex-1 min-w-0"
                />
              </div>
            )}
          </div>

          {/* Content Area - This is where children will be rendered */}
          <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-auto">
            {children}
          </div>
        </div>

        {/* Right Sidebar - Stats & Activity */}
        <div className="w-full lg:col-span-2 bg-card border-t border-border lg:border-t-0 lg:border-l order-1 lg:order-2">
          {/* User Header */}
          <div className="lg:sticky lg:top-14">
            <ProjectStats />

            {/* Recent Activity - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block min-h-screen">
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
