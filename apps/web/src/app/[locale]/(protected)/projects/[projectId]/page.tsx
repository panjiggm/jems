"use client";

import ProjectDetailsComponent from "@/components/project";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function ProjectDetailsPage() {
  const params = useParams();
  const { user } = useUser();
  const projectId = params.projectId as string;
  const userId = user?.id;

  return <ProjectDetailsComponent projectId={projectId} userId={userId} />;
}
