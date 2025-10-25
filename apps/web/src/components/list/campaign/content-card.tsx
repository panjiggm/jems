"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { PlatformBadge } from "../platform-badge";
import { useRouter, useParams } from "next/navigation";
import { ContentCampaignStatus, Platform } from "@/types/status";

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
  createdAt: number;
  updatedAt: number;
}

interface CampaignContentCardProps {
  content: CampaignContent;
  projectId: Id<"projects">;
  userId: string;
}

export function CampaignContentCard({
  content,
  projectId,
  userId,
}: CampaignContentCardProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const handleNavigate = () => {
    // If no slug, fallback to using ID
    const identifier = content.slug || content._id;
    router.push(`/${locale}/campaigns/${identifier}`);
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
      <div className="flex-1 min-w-0 cursor-pointer" onClick={handleNavigate}>
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
    </div>
  );
}
