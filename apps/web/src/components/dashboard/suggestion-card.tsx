"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ButtonPrimary } from "../ui/button-primary";
import { 
  ArrowRightIcon, 
  XIcon,
  LightbulbIcon,
  TrendingUpIcon
} from "lucide-react";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface SuggestionCardProps {
  idea: {
    _id: Id<"contentIdeas">;
    title: string;
    description: string;
    platform?: string | null;
    status: string;
    source?: string;
    createdAt: number;
  };
  onConvertToCampaign?: (ideaId: Id<"contentIdeas">) => void;
  onConvertToRoutine?: (ideaId: Id<"contentIdeas">) => void;
  onDismiss?: (ideaId: Id<"contentIdeas">) => void;
}

const platformIcons: Record<string, string> = {
  tiktok: "🎵",
  instagram: "📷",
  youtube: "▶️",
  x: "🐦",
  facebook: "👥",
  threads: "🧵",
  other: "💡",
};

const platformLabels: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  facebook: "Facebook",
  threads: "Threads",
  other: "Other",
};

export function SuggestionCard({
  idea,
  onConvertToCampaign,
  onConvertToRoutine,
  onDismiss,
}: SuggestionCardProps) {
  const platform = idea.platform || "other";
  const platformIcon = platformIcons[platform] || platformIcons.other;
  const platformLabel = platformLabels[platform] || "Other";

  return (
    <Card className="border-2 border-[#f7a641]/30 hover:border-[#f7a641] transition-all group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{platformIcon}</span>
              <CardTitle className="text-base font-semibold line-clamp-2">
                {idea.title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {platformLabel}
              </Badge>
              {idea.source === "ai_suggestion" && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  AI Generated
                </Badge>
              )}
            </div>
          </div>
          {onDismiss && (
            <ButtonPrimary
              tone="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDismiss(idea._id)}
            >
              <XIcon className="h-4 w-4" />
            </ButtonPrimary>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-sm line-clamp-3">
          {idea.description}
        </CardDescription>
        
        {(onConvertToCampaign || onConvertToRoutine) && (
          <div className="flex gap-2 pt-2">
            {onConvertToCampaign && (
              <ButtonPrimary
                tone="outline"
                size="sm"
                onClick={() => onConvertToCampaign(idea._id)}
                className="flex-1 text-xs"
              >
                <ArrowRightIcon className="h-3 w-3 mr-1" />
                Campaign
              </ButtonPrimary>
            )}
            {onConvertToRoutine && (
              <ButtonPrimary
                tone="outline"
                size="sm"
                onClick={() => onConvertToRoutine(idea._id)}
                className="flex-1 text-xs"
              >
                <ArrowRightIcon className="h-3 w-3 mr-1" />
                Routine
              </ButtonPrimary>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

