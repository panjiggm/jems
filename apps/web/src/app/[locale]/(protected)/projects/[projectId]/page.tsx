import ProjectDetailsComponent from "@/components/project";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Holobiont | Project Details",
  description: "Project details",
};

export default function ProjectDetailsPage() {
  return <ProjectDetailsComponent />;
}
