"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { PlatformBadge } from "../platform-badge";
import { useRouter, useParams } from "next/navigation";
import { ContentCampaignStatus, Platform } from "@/types/status";
import { cn } from "@/lib/utils";
import { Film } from "lucide-react";

interface CampaignContent {
  _id: Id<"contentCampaigns">;
  _creationTime: number;
  userId: string;
  projectId: Id<"projects">;
  title: string;
  slug?: string;
  sow?: string;
  platform: Platform;
  type: "barter" | "paid";
  status: ContentCampaignStatus;
  statusHistory: Array<{
    status: string;
    timestamp: number;
    publishedAt?: string;
    note?: string;
  }>;
  notes?: string;
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

interface CampaignContentCardProps {
  content: CampaignContent;
}

const typeConfig: Record<
  "barter" | "paid",
  { label: string; color: string; dotColor: string }
> = {
  barter: {
    label: "Barter",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dotColor: "bg-indigo-500",
  },
  paid: {
    label: "Paid",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
  },
};

export function CampaignContentCard({ content }: CampaignContentCardProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const handleNavigate = () => {
    const identifier = content.slug || content._id;
    router.push(`/${locale}/campaigns/${identifier}`);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const typeInfo = typeConfig[content.type];
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

      {/* Type Badge - Hidden on mobile */}
      <div className="hidden sm:flex flex-shrink-0">
        <Badge
          variant="outline"
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium hover:opacity-80 transition-opacity",
            typeInfo.color,
          )}
        >
          <div className={cn("w-4 h-4 rounded-full", typeInfo.dotColor)} />
          <span className="leading-none">{typeInfo.label}</span>
        </Badge>
      </div>

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
