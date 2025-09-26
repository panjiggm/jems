"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, ArrowRight, FileText, Calendar1 } from "lucide-react";
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
import { useRouter } from "next/navigation";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const { t, locale } = useTranslations();

  const handleViewDetails = () => {
    router.push(`/projects/${project._id}`);
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

  return (
    <Card className="shadow-none border rounded-lg hover:shadow-sm transition-shadow pb-4">
      <CardContent className="px-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm leading-tight mb-2">
            {project.title}
          </h4>

          {project.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {project.description}
            </p>
          )}
          <div className="flex justify-between items-center text-xs text-accent-foreground/90">
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

          <div className="flex items-center justify-between mt-1.5">
            {/* Creation date */}
            <div className="flex items-center gap-1 text-xs text-accent-foreground/90">
              <Calendar1 className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">
                {t("projects.created")}{" "}
                {formatDistanceToNow(new Date(project.createdAt), {
                  addSuffix: true,
                  locale: locale === "id" ? id : undefined,
                })}
              </span>
            </div>

            {/* Content count */}
            {project.contentCount !== undefined && (
              <div className="flex items-center gap-1 text-xs text-accent-foreground/90">
                <FileText className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {project.contentCount}{" "}
                  {project.contentCount === 1
                    ? t("projects.activity.entities.content")
                    : t("projects.stats.labels.contents")}
                </span>
              </div>
            )}
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
