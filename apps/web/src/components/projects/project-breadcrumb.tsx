"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@packages/backend/convex/_generated/api";
import { useTranslations } from "@/hooks/use-translations";
import { ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ProjectBreadcrumbProps {
  className?: string;
}

const ProjectBreadcrumb: React.FC<ProjectBreadcrumbProps> = ({ className }) => {
  const { t } = useTranslations();
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0];
  const isProjectsRoute = segments[1] === "projects";

  const year = segments[2] && /^\d{4}$/.test(segments[2]) ? segments[2] : null;
  const projectId = year ? segments[3] : segments[2];

  const project = useQuery(
    api.queries.projects.getByIdWithStats,
    projectId ? { projectId: projectId as any } : "skip",
  );

  if (!isProjectsRoute) {
    return null;
  }

  const breadcrumbItems = [
    {
      label: t("projects.breadcrumb.allProjects"),
      href: `/${locale}/projects`,
    },
  ];

  if (year) {
    breadcrumbItems.push({
      label: year,
      href: `/${locale}/projects/${year}`,
    });
  }

  if (projectId && project) {
    const projectHref = year
      ? `/${locale}/projects/${year}/${projectId}`
      : `/${locale}/projects/${projectId}`;

    breadcrumbItems.push({
      label: project.project.title,
      href: projectHref,
    });
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className="flex items-center gap-1">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium bg-primary/5 text-primary">
                    <span className="truncate max-w-[200px]">{item.label}</span>
                  </BreadcrumbPage>
                ) : (
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                  >
                    <span className="truncate max-w-[150px]">{item.label}</span>
                  </Link>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default ProjectBreadcrumb;
