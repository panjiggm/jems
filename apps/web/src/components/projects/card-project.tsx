"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Bell, ArrowRight } from "lucide-react";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { Project } from "./types";
import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
} from "date-fns";
import { id } from "date-fns/locale";
import { useTranslations } from "@/hooks/use-translations";
import { ButtonPrimary } from "../ui/button-primary";

interface ProjectCardProps {
  project: Project;
  onViewDetails?: (projectId: Id<"projects">) => void;
}

export function ProjectCard({ project, onViewDetails }: ProjectCardProps) {
  const { t, locale } = useTranslations();

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(project._id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (isToday(date)) {
      return t("projects.dates.today");
    } else if (isTomorrow(date)) {
      return t("projects.dates.tomorrow");
    } else if (isYesterday(date)) {
      return t("projects.dates.yesterday");
    } else {
      // Use locale-specific date formatting
      const formatString = locale === "id" ? "dd MMM yyyy" : "MMM dd, yyyy";
      const localeConfig = locale === "id" ? { locale: id } : {};
      return format(date, formatString, localeConfig);
    }
  };

  const formatProjectType = (type: string) => {
    return t(`projects.types.${type}`);
  };

  return (
    <Card className="shadow-none border rounded-lg hover:shadow-sm transition-shadow pb-4">
      <CardContent className="px-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-bold text-sm leading-tight">{project.title}</h4>
            <Badge
              variant="secondary"
              className="text-xs ml-2 flex-shrink-0 capitalize"
            >
              {formatProjectType(project.type)}
            </Badge>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {project.description}
            </p>
          )}
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            {project.startDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {t("projects.start")}: {formatDate(project.startDate)}
                </span>
              </div>
            )}
            {project.endDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {t("projects.end")}: {formatDate(project.endDate)}
                </span>
              </div>
            )}
          </div>

          {/* Creation date */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <User className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">
              {t("projects.created")}{" "}
              {formatDistanceToNow(new Date(project.createdAt), {
                addSuffix: true,
                locale: locale === "id" ? id : undefined,
              })}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t">
            <ButtonPrimary
              tone="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={handleViewDetails}
            >
              {t("projects.viewDetails")}
              <ArrowRight className="h-4 w-4" />
            </ButtonPrimary>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
