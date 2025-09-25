"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { PlatformBadge } from "./platform-badge";
import { PriorityBadge } from "./priority-badge";

interface Content {
  _id: Id<"contents">;
  _creationTime: number;
  userId: string;
  projectId: Id<"projects">;
  title: string;
  platform:
    | "tiktok"
    | "instagram"
    | "youtube"
    | "x"
    | "facebook"
    | "threads"
    | "other";
  status: "draft" | "in_progress" | "scheduled" | "published";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  scheduledAt?: string;
  publishedAt?: string;
  notes?: string;
  assetIds?: string[];
  aiMetadata?: any;
  createdAt: number;
  updatedAt: number;
}

interface ContentCardProps {
  content: Content;
  projectId: Id<"projects">;
  userId: string;
}

export function ContentCard({ content, projectId, userId }: ContentCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPriority = (content: Content) => {
    // Simple priority logic based on due date and status
    if (!content.dueDate) return "low";

    const dueDate = new Date(content.dueDate);
    const today = new Date();
    const diffDays = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) return "high"; // Overdue
    if (diffDays <= 3) return "high"; // Due soon
    if (diffDays <= 7) return "medium";
    return "low";
  };

  const priority = getPriority(content);

  return (
    <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      {/* Checkbox */}
      <Checkbox className="flex-shrink-0" />

      {/* Content Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h5 className="font-medium text-sm truncate">{content.title}</h5>
          <PlatformBadge platform={content.platform} />
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span>📅</span>
            {formatDate(content.dueDate)}
          </span>
          <span className="flex items-center gap-1">
            <span>👥</span>
            <span>AL, DT</span>
            <Avatar className="h-4 w-4">
              <AvatarImage src="/images/avatar.png" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </span>
        </div>
      </div>

      {/* Priority Badge */}
      <div className="flex-shrink-0">
        <PriorityBadge priority={priority} />
      </div>

      {/* Actions */}
      <div className="flex-shrink-0">
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
