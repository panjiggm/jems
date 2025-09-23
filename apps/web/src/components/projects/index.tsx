"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronDown } from "lucide-react";
import { ButtonPrimary } from "../ui/button-primary";
import { useCreateProjectDialogStore } from "@/store/use-dialog-store";
import { ProjectCard } from "./card-project";
import { usePaginatedQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@packages/backend/convex/_generated/api";
import { useTranslations } from "@/hooks/use-translations";

export default function ProjectsComponent() {
  const { openDialog } = useCreateProjectDialogStore();
  const { t } = useTranslations();
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
    <>
      {/* Header with Create Project Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{t("projects.title")}</h2>
          {projects && (
            <Badge variant="secondary" className="text-xs">
              {projects.length}{" "}
              {projects.length === 1
                ? t("projects.project")
                : t("projects.projects")}
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
              <h3 className="text-lg font-medium">
                {t("projects.noProjects")}
              </h3>
              <p className="text-sm">{t("projects.noProjectsDescription")}</p>
            </div>
            <ButtonPrimary onClick={openDialog}>
              <Plus className="h-4 w-4 mr-2" />
              {t("projects.createProject")}
            </ButtonPrimary>
          </div>
        ) : (
          // Projects list
          projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
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
                {t("projects.loading")}
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                {t("projects.loadMore")}
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}
