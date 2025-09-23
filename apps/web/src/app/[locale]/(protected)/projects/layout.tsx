"use client";

import React from "react";
import {
  Plus,
  FolderOpen,
  FileText,
  CheckSquare,
  Calendar,
} from "lucide-react";
import ProjectStats from "@/components/projects/project-stats";
import RecentActivity from "@/components/projects/recent-activity";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { CreateProjectDialog } from "@/components/projects/dialog-create-project";
import { useCreateProjectDialogStore } from "@/store/use-dialog-store";
import { useTranslations } from "@/hooks/use-translations";
import TabsCustom from "@/components/tabs-custom";
import ProjectBreadcrumb from "@/components/projects/project-breadcrumb";
import { useParams, usePathname } from "next/navigation";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const { openDialog } = useCreateProjectDialogStore();
  const { t } = useTranslations();

  const projectsTabs = [
    {
      id: "info",
      label: "Projects",
      icon: FolderOpen,
      href: `/${locale}/projects`,
    },
    {
      id: "activity",
      label: "Contents",
      icon: FileText,
      href: `/${locale}/projects/contents`,
    },
    {
      id: "content",
      label: "Tasks",
      icon: CheckSquare,
      href: `/${locale}/projects/tasks`,
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: Calendar,
      href: `/${locale}/projects/calendar`,
    },
  ];

  // Determine current tab and create button text
  const getCurrentTabAndButton = () => {
    if (pathname.includes("/projects/contents")) {
      return {
        tabId: "activity",
        buttonText: t("projects.createContent"),
        buttonAction: () => {
          // TODO: Open create content dialog
          console.log("Create content clicked");
        },
      };
    } else if (pathname.includes("/projects/tasks")) {
      return {
        tabId: "content",
        buttonText: t("projects.createTask"),
        buttonAction: () => {
          // TODO: Open create task dialog
          console.log("Create task clicked");
        },
      };
    } else {
      return {
        tabId: "info",
        buttonText: t("projects.createProject"),
        buttonAction: openDialog,
      };
    }
  };

  const { buttonText, buttonAction } = getCurrentTabAndButton();

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center justify-between w-full px-2">
            {/* <ProjectBreadcrumb /> */}
            <div></div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ButtonPrimary size="sm" onClick={buttonAction}>
                <Plus className="h-4 w-4 mr-2" />
                {buttonText}
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
            <TabsCustom
              tabs={projectsTabs}
              defaultValue="info"
              useUrlNavigation={true}
              className="font-black"
            />
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
    </div>
  );
}
