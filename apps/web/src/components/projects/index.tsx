"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, User, Bell, ChevronDown } from "lucide-react";
import ProjectStats from "./project-stats";
import RecentActivity from "./recent-activity";
import ProjectTabs from "./tabs";
import { ButtonPrimary } from "../ui/button-primary";
import { CreateProjectDialog } from "./dialog-create-project";
import { useCreateProjectDialogStore } from "@/store/use-dialog-store";
import { usePaginatedQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@packages/backend/convex/_generated/api";

export default function ProjectsComponent() {
  const { openDialog } = useCreateProjectDialogStore();
  const {
    results: projects,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.queries.projects.list,
    { search: undefined },
    { initialNumItems: 12 },
  );

  return (
    <div className=" bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center justify-between w-full px-2">
            <div className="text-sm text-muted-foreground">
              Active Projects &gt; Summer Campaign
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ButtonPrimary size="sm" onClick={openDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1">
          {/* Tabs */}
          <ProjectTabs />

          {/* Content Area */}
          <div className="p-6 space-y-6">
            {/* Header with Create Project Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Projects</h2>
                {projects && (
                  <Badge variant="secondary" className="text-xs">
                    {projects.length}{" "}
                    {projects.length === 1 ? "project" : "projects"}
                  </Badge>
                )}
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {projects === undefined ? (
                // Loading state
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="shadow-none border rounded-lg">
                    <CardContent className="p-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-3"></div>
                        <div className="h-3 bg-gray-200 rounded mb-3"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : projects.length === 0 ? (
                // Empty state
                <div className="col-span-full text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    <Plus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <h3 className="text-lg font-medium">No projects yet</h3>
                    <p className="text-sm">
                      Create your first project to get started
                    </p>
                  </div>
                  <ButtonPrimary onClick={openDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </ButtonPrimary>
                </div>
              ) : (
                // Projects list
                projects.map((project) => (
                  <Card
                    key={project._id}
                    className="shadow-none border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm leading-tight">
                              {project.title}
                            </h4>
                            <Badge
                              variant="secondary"
                              className="text-xs ml-2 flex-shrink-0 capitalize"
                            >
                              {project.type}
                            </Badge>
                          </div>
                          {project.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                          <div className="space-y-2 text-xs text-muted-foreground">
                            {project.startDate && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">
                                  Start:{" "}
                                  {new Date(
                                    project.startDate,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {project.endDate && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">
                                  End:{" "}
                                  {new Date(
                                    project.endDate,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                Created{" "}
                                {new Date(
                                  project.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-center"
                            >
                              <Bell className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Load More Button */}
            {projects && projects.length > 0 && status !== "Exhausted" && (
              <div className="flex justify-center pt-6">
                <Button
                  variant="outline"
                  onClick={() => loadMore(5)}
                  disabled={status === "LoadingMore"}
                >
                  {status === "LoadingMore" ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Load More
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
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
