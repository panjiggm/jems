"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { PlatformBadge } from "./platform-badge";
import { TypeBadge } from "./type-badge";
import { ContentDetailsDrawer } from "../contents";
import { useState } from "react";

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
  status:
    | "confirmed"
    | "shipped"
    | "received"
    | "shooting"
    | "drafting"
    | "editing"
    | "done"
    | "pending_payment"
    | "paid"
    | "canceled"
    | "ideation"
    | "scripting"
    | "scheduled"
    | "published"
    | "archived"
    | "planned"
    | "skipped";
  phase: "plan" | "production" | "review" | "published" | "done";
  type: "campaign" | "series" | "routine";
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
  const [selectedContentId, setSelectedContentId] =
    useState<Id<"contents"> | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenDrawer = (contentId: Id<"contents">) => {
    setSelectedContentId(contentId);
    setDrawerOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/100 transition-colors">
      {/* Checkbox */}
      <Checkbox className="flex-shrink-0" />

      {/* Content Info */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => handleOpenDrawer(content._id)}
      >
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

      {/* Priority Badge - Use priority from database */}
      <div className="flex-shrink-0">
        <TypeBadge type={content.type} />
      </div>

      {/* Actions */}
      {/* <div className="flex-shrink-0">
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </div> */}

      <ContentDetailsDrawer
        contentId={selectedContentId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onDeleted={() => {
          // Content is deleted, the query will automatically refetch
          // due to Convex's reactive queries
        }}
      />
    </div>
  );
}
