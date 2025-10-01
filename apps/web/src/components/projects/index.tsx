"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ChevronDown, Search, X, Sparkles } from "lucide-react";
import { ButtonPrimary } from "../ui/button-primary";
import { useCreateProjectDialogStore } from "@/store/use-dialog-store";
import { useTemplateDialogStore } from "@/store/use-dialog-template-store";
import { ProjectCard } from "./card-project";
import { usePaginatedQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@packages/backend/convex/_generated/api";
import { useTranslations } from "@/hooks/use-translations";

export default function ProjectsComponent() {
  const { openDialog } = useCreateProjectDialogStore();
  const { openDialog: openTemplateDialog } = useTemplateDialogStore();
  const { t } = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const params = useParams();
  const pathname = usePathname();

  const year = useMemo(() => {
    if (params?.year) return parseInt(params.year as string);
    const yearMatch = pathname.match(/\/projects\/(\d{4})$/);
    if (yearMatch) return parseInt(yearMatch[1]);
    return undefined;
  }, [params?.year, pathname]);

  const queryArgs = useMemo(
    () => ({
      search: searchTerm || undefined,
      year: year || undefined,
    }),
    [searchTerm, year],
  );

  const options = useMemo(() => ({ initialNumItems: 12 }), []);

  const {
    results: projects,
    status,
    loadMore,
  } = usePaginatedQuery(api.queries.projects.list, queryArgs, options);

  const handleClearSearch = useCallback(() => setSearchTerm(""), []);

  return (
    <>
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={t("projects.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 bg-white"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
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
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" onClick={openTemplateDialog}>
                <Sparkles className="h-4 w-4 mr-2" />
                {t("projects.templates.button.useTemplate")}
              </Button>
              <ButtonPrimary onClick={openDialog}>
                <Plus className="h-4 w-4 mr-2" />
                {t("projects.createProject")}
              </ButtonPrimary>
            </div>
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
