import ProjectsComponent from "@/components/projects";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Holobiont | Projects",
  description: "Projects management and tracking",
};

export default function ProjectYearPage() {
  return <ProjectsComponent />;
}
