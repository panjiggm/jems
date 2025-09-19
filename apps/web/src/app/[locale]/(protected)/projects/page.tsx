"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calendar, CalendarDays, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { ProjectStats } from "@/components/projects/project-stats";
import { ProjectGridSkeleton } from "@/components/projects/project-card-skeleton";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");

  const items = useQuery(api.queries.projects.list, {
    search: search || "",
  });

  //   const { items } = projectsQuery ?? { items: [] };
  const isLoading = items === undefined;

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleReset = () => {
    setSearch("");
  };

  const getProjectTypeColor = (type: string) => {
    switch (type) {
      case "campaign":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "series":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "routine":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case "campaign":
        return <Calendar className="h-4 w-4" />;
      case "series":
        return <CalendarDays className="h-4 w-4" />;
      case "routine":
        return <RotateCcw className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your content campaigns, series, and routines
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Project Stats */}
      <ProjectStats />

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {search && (
          <Button variant="outline" onClick={handleReset}>
            Clear
          </Button>
        )}
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <ProjectGridSkeleton />
      ) : items && items?.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((project) => (
              <Card
                key={project._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-2">
                      {project.title}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className={`ml-2 ${getProjectTypeColor(project.type)}`}
                    >
                      <span className="flex items-center gap-1">
                        {getProjectTypeIcon(project.type)}
                        {project.type}
                      </span>
                    </Badge>
                  </div>
                  {project.description && (
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.startDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(project.startDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                    )}
                    {project.endDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          {format(new Date(project.endDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        Created{" "}
                        {format(new Date(project.createdAt), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-muted p-3">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {search ? "No projects found" : "No projects yet"}
                </h3>
                <p className="text-muted-foreground">
                  {search
                    ? "Try adjusting your search terms"
                    : "Get started by creating your first project"}
                </p>
              </div>
              {!search && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
