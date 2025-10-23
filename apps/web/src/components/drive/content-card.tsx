"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  Video,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentCardProps {
  locale: string;
  contentId: string;
  contentType: "campaign" | "routine";
  title: string;
  slug?: string | null;
  platform: string;
  mediaCount: number;
  projectTitle: string;
}

const platformIcons: Record<string, React.ComponentType<any>> = {
  tiktok: Video,
  instagram: Instagram,
  youtube: Youtube,
  x: MessageCircle,
  facebook: Facebook,
  threads: MessageCircle,
  other: FileText,
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

export function ContentCard({
  locale,
  contentId,
  contentType,
  title,
  slug,
  platform,
  mediaCount,
  projectTitle,
}: ContentCardProps) {
  const router = useRouter();
  const PlatformIcon = platformIcons[platform] || FileText;

  const handleClick = () => {
    const route = contentType === "campaign" ? "campaigns" : "routines";
    if (slug) {
      router.push(`/${locale}/${route}/${slug}`);
    }
  };

  return (
    <Card
      onClick={handleClick}
      className={cn(
        "cursor-pointer transition-all hover:shadow-md rounded-lg",
        "group relative overflow-hidden shadow-none border",
      )}
    >
      <CardContent className="px-4 py-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <PlatformIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {projectTitle}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs px-2 py-0.5">
            {mediaCount}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize">
            {platformLabels[platform] || platform}
          </span>
          <span>•</span>
          <span className="capitalize">{contentType}</span>
        </div>
      </CardContent>
    </Card>
  );
}
