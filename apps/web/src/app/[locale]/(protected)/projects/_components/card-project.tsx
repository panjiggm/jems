"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Clock, FileText, Calendar1, Folder } from "lucide-react";
import {
  format,
  formatDistanceToNowStrict,
  isToday,
  isTomorrow,
  isYesterday,
} from "date-fns";
import { id, enUS } from "date-fns/locale";
import { useTranslations } from "@/hooks/use-translations";
import { useRouter, usePathname, useParams } from "next/navigation";
import { CardHeader } from "@/components/ui/card";
import { Id } from "@packages/backend/convex/_generated/dataModel";

interface Project {
  _id: Id<"projects">;
  _creationTime: number;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  contentCount?: number;
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const {
    _id,
    title,
    description,
    startDate,
    endDate,
    createdAt,
    contentCount,
  } = project;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { t, locale } = useTranslations();

  const getYearFromContext = () => {
    if (params?.year) {
      return params.year as string;
    }

    const yearMatch = pathname.match(/\/projects\/(\d{4})/);
    if (yearMatch) {
      return yearMatch[1];
    }

    if (startDate) {
      return new Date(startDate).getFullYear().toString();
    }
    if (endDate) {
      return new Date(endDate).getFullYear().toString();
    }

    return new Date().getFullYear().toString();
  };

  const handleViewDetails = () => {
    const year = getYearFromContext();
    router.push(
      `/${locale}/projects/${year}/${_id}?contentType=campaign&view=list`,
    );
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
      const localeConfig = locale === "id" ? { locale: id } : { locale: enUS };
      return format(date, formatString, localeConfig);
    }
  };

  return (
    <Card
      className="shadow-none border rounded-lg hover:shadow-sm cursor-pointer transition-shadow"
      onClick={handleViewDetails}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-muted-foreground" />
          <CardTitle>{title}</CardTitle>
        </div>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="px-6">
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center text-xs text-accent-foreground/90">
            {startDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {t("projects.start")}: {formatDate(startDate)}
                </span>
              </div>
            )}
            {endDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {t("projects.end")}: {formatDate(endDate)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-1.5">
            {/* Creation date */}
            <div className="flex items-center gap-1 text-xs text-accent-foreground/90">
              <Calendar1 className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">
                {formatDistanceToNowStrict(new Date(createdAt), {
                  addSuffix: true,
                  locale: locale === "id" ? id : enUS,
                })}
              </span>
            </div>

            {/* Content count */}
            {contentCount !== undefined && (
              <div className="flex items-center gap-1 text-xs text-accent-foreground/90">
                <FileText className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {contentCount}{" "}
                  {contentCount === 1
                    ? t("projects.activity.entities.content")
                    : t("projects.stats.labels.contents")}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
