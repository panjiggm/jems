"use client";

import * as React from "react";
import { useQueryState } from "nuqs";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { DriveHeader } from "./drive-header";
import { ContentCard } from "./content-card";
import { MediaListTable } from "./media-list-grouped";
import { UploadDialog } from "./upload-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface DriveClientProps {
  locale: string;
  preloadedMediaGrouped: Preloaded<typeof api.queries.media.getAllMediaGrouped>;
}

export function DriveClient({
  locale,
  preloadedMediaGrouped,
}: DriveClientProps) {
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);

  // Use preloaded queries
  const mediaGrouped = usePreloadedQuery(preloadedMediaGrouped);

  if (!mediaGrouped) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with Search and Upload */}
        <DriveHeader
          searchValue={search}
          onSearchChange={setSearch}
          onUploadClick={() => setUploadDialogOpen(true)}
        />

        {/* Content Cards - Only show items with media */}
        {mediaGrouped.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-3">Content Library</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {mediaGrouped.map((content) => (
                <ContentCard
                  key={content.contentId}
                  locale={locale}
                  contentId={content.contentId}
                  contentType={content.contentType}
                  title={content.title}
                  slug={content.slug}
                  platform={content.platform}
                  mediaCount={content.mediaFiles.length}
                  projectTitle={content.projectTitle}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Media Files Table */}
        <div>
          <h2 className="text-sm font-semibold mb-3">All Files</h2>
          <MediaListTable contents={mediaGrouped} />
        </div>
      </div>

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </>
  );
}
