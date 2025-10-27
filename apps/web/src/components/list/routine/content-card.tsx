"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { PlatformBadge } from "../platform-badge";
import { useRouter, useParams } from "next/navigation";
import { ContentRoutineStatus, Platform } from "@/types/status";
import { Film } from "lucide-react";

interface RoutineContent {
  _id: Id<"contentRoutines">;
  _creationTime: number;
  userId: string;
  projectId: Id<"projects">;
  title: string;
  slug?: string;
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
  mediaFiles?: Array<{
    storageId: Id<"_storage">;
    filename: string;
    size: number;
    contentType: string;
    extension: string;
    uploadedAt: number;
  }>;
  createdAt: number;
  updatedAt: number;
}

interface RoutineContentCardProps {
  content: RoutineContent;
}

export function RoutineContentCard({ content }: RoutineContentCardProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const handleNavigate = () => {
    const identifier = content.slug || content._id;
    router.push(`/${locale}/routines/${identifier}`);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const mediaCount = content.mediaFiles?.length || 0;

  return (
    <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 hover:bg-muted/50 transition-colors group">
      {/* Checkbox */}
      <Checkbox className="flex-shrink-0" />

      {/* Title - Clickable */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={handleNavigate}>
        <h5 className="font-normal text-sm truncate group-hover:text-foreground">
          {content.title}
        </h5>
      </div>

      {/* Media Count - Always visible */}
      {mediaCount > 0 && (
        <div className="flex items-center gap-1 flex-shrink-0 text-muted-foreground">
          <Film className="h-3.5 w-3.5" />
          <span className="text-xs">{mediaCount}</span>
        </div>
      )}

      {/* Platform Badge */}
      <div className="flex-shrink-0">
        <PlatformBadge platform={content.platform} />
      </div>

      {/* Date - Hidden on mobile */}
      <div className="hidden md:flex flex-shrink-0 text-right">
        <span className="text-xs text-muted-foreground">
          {formatDate(content.createdAt)}
        </span>
      </div>
    </div>
  );
}
