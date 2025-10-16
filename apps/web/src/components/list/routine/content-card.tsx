"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { PlatformBadge } from "../platform-badge";
import { ContentDetailsDrawer } from "../../contents";
import { useState } from "react";
import { ContentRoutineStatus, Platform } from "@/types/status";

interface RoutineContent {
  _id: Id<"contentRoutines">;
  _creationTime: number;
  userId: string;
  projectId: Id<"projects">;
  title: string;
  notes?: string;
  platform: Platform;
  status: ContentRoutineStatus;
  statusHistory: Array<{
    status: string;
    timestamp: number;
    scheduledAt?: string;
    publishedAt?: string;
    note?: string;
  }>;
  createdAt: number;
  updatedAt: number;
}

interface RoutineContentCardProps {
  content: RoutineContent;
  projectId: Id<"projects">;
  userId: string;
}

export function RoutineContentCard({
  content,
  projectId,
  userId,
}: RoutineContentCardProps) {
  const [selectedContentId, setSelectedContentId] =
    useState<Id<"contentRoutines"> | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenDrawer = (contentId: Id<"contentRoutines">) => {
    setSelectedContentId(contentId);
    setDrawerOpen(true);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
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
            {formatDate(content.createdAt)}
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

      {/* No type badge for routines - they don't have barter/paid type */}

      <ContentDetailsDrawer
        contentId={selectedContentId}
        contentType="routine"
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
