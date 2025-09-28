"use client";

import ProjectDetailsComponent from "@/components/project";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Id } from "@packages/backend/convex/_generated/dataModel";

export default function ProjectDetailsPage() {
  const params = useParams();
  const { user } = useUser();
  const projectId = params.projectId as Id<"projects">;
  const userId = user?.id;

  return <ProjectDetailsComponent projectId={projectId} userId={userId} />;
}
