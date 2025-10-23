"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@packages/backend/convex/_generated/api";
import { DriveHeader } from "@/components/drive/drive-header";
import { ContentCard } from "@/components/drive/content-card";
import { MediaListTable } from "@/components/drive/media-list-grouped";
import { UploadDialog } from "@/components/drive/upload-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryState } from "nuqs";

export default function DrivePage() {
  const params = useParams();
  const locale = params.locale as string;
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);

  // Fetch all media grouped by content
  const mediaGrouped = useQuery(api.queries.media.getAllMediaGrouped, {
    search: search || undefined,
  });

  // Fetch stats for total file count
  const stats = useQuery(api.queries.media.getMediaStats, {});

  if (!mediaGrouped || !stats) {
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
          totalFiles={stats.totalFiles}
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
