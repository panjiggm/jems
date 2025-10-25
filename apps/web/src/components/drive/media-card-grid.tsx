"use client";

import * as React from "react";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import { MediaCard } from "./media-card";
import { useTranslations } from "@/hooks/use-translations";

type MediaItem = {
  storageId: Id<"_storage">;
  filename: string;
  size: number;
  contentType: string;
  extension: string;
  durationMs?: number;
  width?: number;
  height?: number;
  uploadedAt: number;
};

interface ContentWithMedia {
  contentId: string;
  contentType: "campaign" | "routine";
  title: string;
  slug?: string | null;
  platform: string;
  mediaFiles: MediaItem[];
  projectId: string;
  projectTitle: string;
  updatedAt: number;
}

interface MediaCardGridProps {
  contents: ContentWithMedia[];
}

// Flattened media item with content context
type FlatMediaItem = MediaItem & {
  contentId: string;
  contentTypeEnum: "campaign" | "routine";
  contentTitle: string;
  projectTitle: string;
};

export function MediaCardGrid({ contents }: MediaCardGridProps) {
  const { t } = useTranslations();

  // Flatten the data structure
  const flattenedData = React.useMemo(() => {
    const flattened: FlatMediaItem[] = [];
    contents.forEach((content) => {
      content.mediaFiles.forEach((media) => {
        flattened.push({
          ...media,
          contentId: content.contentId,
          contentTypeEnum: content.contentType,
          contentTitle: content.title,
          projectTitle: content.projectTitle,
        });
      });
    });
    // Sort by upload date descending
    return flattened.sort((a, b) => b.uploadedAt - a.uploadedAt);
  }, [contents]);

  if (flattenedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-sm text-muted-foreground">
          {t("drive.allFiles.noFilesFound")}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {t("drive.allFiles.uploadFilesToGetStarted")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {flattenedData.map((media) => (
        <MediaCard key={media.storageId} media={media} />
      ))}
    </div>
  );
}
