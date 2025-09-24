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
  const projectId = segments[2];
  const contentId = segments[3];

  // Fetch project data if we have a projectId
  const project = useQuery(
    api.queries.projects.getByIdWithStats,
    projectId ? { projectId: projectId as any } : "skip",
  );

  // Fetch content data if we have a contentId
  const content = useQuery(
    api.queries.contents.getByIdWithStats,
    contentId ? { contentId: contentId as any } : "skip",
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

  // Add project level if we have projectId
  if (projectId && project) {
    breadcrumbItems.push({
      label: project.project.title,
      href: `/${locale}/projects/${projectId}`,
    });
  }

  // Add content level if we have contentId
  if (contentId && content) {
    breadcrumbItems.push({
      label: content.content.title,
      href: `/${locale}/projects/${projectId}/${contentId}`,
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
