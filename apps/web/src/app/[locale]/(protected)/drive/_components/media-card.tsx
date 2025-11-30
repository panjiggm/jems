"use client";

import * as React from "react";
import { useConvex, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import { format } from "date-fns";
import Image from "next/image";
import {
  MoreVertical,
  Eye,
  Download,
  Trash2,
  FileIcon,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MediaViewer } from "@/components/ui/media-viewer";
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
  contentId: string;
  contentTypeEnum: "campaign" | "routine";
  contentTitle: string;
  projectTitle: string;
};

interface MediaCardProps {
  media: MediaItem;
  allMedia?: MediaItem[]; // Optional: all media items for slideshow
}

export function MediaCard({ media, allMedia }: MediaCardProps) {
  const { t } = useTranslations();
  const convex = useConvex();
  const removeCampaignMedia = useMutation(
    api.mutations.media.removeCampaignMedia,
  );
  const removeRoutineMedia = useMutation(
    api.mutations.media.removeRoutineMedia,
  );

  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [viewerOpen, setViewerOpen] = React.useState(false);

  // If allMedia is provided, find the index of current media for slideshow
  const mediaList = allMedia || [media];
  const initialIndex = allMedia
    ? allMedia.findIndex((m) => m.storageId === media.storageId)
    : 0;

  // Load thumbnail
  React.useEffect(() => {
    const loadThumbnail = async () => {
      try {
        const result = await convex.query(api.queries.media.getFileUrl, {
          storageId: media.storageId,
        });
        if (result && result.url) {
          setThumbnailUrl(result.url);
        }
      } catch (err) {
        console.error("Failed to load thumbnail", err);
      }
    };
    loadThumbnail();
  }, [convex, media.storageId]);

  const handleView = () => {
    setViewerOpen(true);
  };

  const handleDownload = async () => {
    try {
      const result = await convex.query(api.queries.media.getFileUrl, {
        storageId: media.storageId,
      });
      if (!result || !result.url) {
        toast.error(
          result
            ? t("drive.errors.fileNotFound")
            : t("drive.errors.notAuthenticated"),
        );
        return;
      }
      const a = document.createElement("a");
      a.href = result.url;
      a.download = media.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(t("drive.errors.downloadStarted"));
    } catch (err) {
      console.error(err);
      toast.error(t("drive.errors.failedToDownloadFile"));
    }
  };

  const confirmDelete = async () => {
    try {
      if (media.contentTypeEnum === "campaign") {
        await removeCampaignMedia({
          campaignId: media.contentId as Id<"contentCampaigns">,
          storageId: media.storageId,
        });
      } else {
        await removeRoutineMedia({
          routineId: media.contentId as Id<"contentRoutines">,
          storageId: media.storageId,
        });
      }
      toast.success(t("drive.errors.mediaDeletedSuccessfully"));
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(t("drive.errors.failedToDeleteMedia"));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const isImage = media.contentType.startsWith("image/");
  const isVideo = media.contentType.startsWith("video/");

  return (
    <>
      <div className="group rounded-lg border border-border bg-card hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Thumbnail */}
        <div
          className="relative w-full h-40 bg-muted flex items-center justify-center cursor-pointer overflow-hidden"
          onClick={handleView}
        >
          {thumbnailUrl && (isImage || isVideo) ? (
            <>
              {isImage ? (
                <Image
                  src={thumbnailUrl}
                  alt={media.filename}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <video
                  src={thumbnailUrl}
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
              )}
            </>
          ) : (
            <FileIcon className="h-16 w-16 text-muted-foreground" />
          )}
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className="text-sm font-medium truncate"
                title={media.filename}
              >
                {media.filename}
              </h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">
                    {t("drive.media.moreOptions")}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="h-4 w-4" />
                  {t("drive.media.actions.view")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  {t("drive.media.actions.download")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  {t("drive.media.actions.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 mt-2 text-xs text-muted-foreground">
            <span>{format(new Date(media.uploadedAt), "MMM d, yyyy")}</span>
            <span>{formatFileSize(media.size)}</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>{t("drive.media.deleteDialog.title")}</DialogTitle>
            </div>
            <DialogDescription className="pt-3">
              {t("drive.media.deleteDialog.description")}{" "}
              <span className="font-semibold text-foreground">
                {media.filename}
              </span>
              ? {t("drive.media.deleteDialog.warning")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t("drive.media.deleteDialog.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("drive.media.deleteDialog.confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Viewer */}
      <MediaViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        media={mediaList.map((item) => ({
          storageId: item.storageId,
          filename: item.filename,
          size: item.size,
          contentType: item.contentType,
          extension: item.extension,
          durationMs: item.durationMs,
          width: item.width,
          height: item.height,
          uploadedAt: item.uploadedAt,
        }))}
        initialIndex={initialIndex}
        showNavigation={mediaList.length > 1}
      />
    </>
  );
}
