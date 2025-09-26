import { Id } from "@packages/backend/convex/_generated/dataModel";

export interface Project {
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
