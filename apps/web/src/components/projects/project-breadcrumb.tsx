"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@packages/backend/convex/_generated/api";
import { useTranslations } from "@/hooks/use-translations";
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

  // Extract segments from pathname
  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0];
  const isProjectsRoute = segments[1] === "projects";

  // New URL structure: /projects/[year]/[projectId]
  const year = segments[2] && /^\d{4}$/.test(segments[2]) ? segments[2] : null;
  const projectId = year ? segments[3] : segments[2];

  // Fetch project data if we have a projectId
  const project = useQuery(
    api.queries.projects.getByIdWithStats,
    projectId ? { projectId: projectId as any } : "skip",
  );

  // Don't render breadcrumb if not on projects route
  if (!isProjectsRoute) {
    return null;
  }

  const breadcrumbItems = [
    {
      label: t("projects.breadcrumb.allProjects"),
      href: `/${locale}/projects`,
    },
  ];

  // Add year level if we have year
  if (year) {
    breadcrumbItems.push({
      label: year,
      href: `/${locale}/projects/${year}`,
    });
  }

  // Add project level if we have projectId
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
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-1.5">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <Link
                    href={item.href}
                    className="flex items-center gap-1.5 hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default ProjectBreadcrumb;
