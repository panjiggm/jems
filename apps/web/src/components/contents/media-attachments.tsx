"use client";

import * as React from "react";
import { useAction, useMutation, useConvex } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { MediaCard } from "@/components/contents/media-card";
import { useTranslations } from "@/hooks/use-translations";

type MediaItem = {
  storageId: Id<"_storage">;
  filename: string;
  size: number; // bytes
  contentType: string;
  extension: string;
  durationMs?: number;
  width?: number;
  height?: number;
  uploadedAt: number;
};

interface MediaAttachmentsProps {
  contentType: "campaign" | "routine";
  contentId: Id<"contentCampaigns"> | Id<"contentRoutines">;
  mediaFiles?: MediaItem[] | null;
}

async function extractVideoMetadata(file: File): Promise<{
  durationMs?: number;
  width?: number;
  height?: number;
}> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const durationMs = isFinite(video.duration)
        ? Math.round(video.duration * 1000)
        : undefined;
      const width = (video.videoWidth || undefined) as number | undefined;
      const height = (video.videoHeight || undefined) as number | undefined;
      URL.revokeObjectURL(video.src);
      resolve({ durationMs, width, height });
    };
    video.onerror = () => resolve({});
    video.src = URL.createObjectURL(file);
  });
}

async function extractImageMetadata(file: File): Promise<{
  width?: number;
  height?: number;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => resolve({});
    img.src = URL.createObjectURL(file);
  });
}

export function MediaAttachments({
  contentType,
  contentId,
  mediaFiles,
}: MediaAttachmentsProps) {
  const { t } = useTranslations();
  const convex = useConvex();
  const generateUploadUrl = useAction(api.actions.storage.generateUploadUrl);
  const attachCampaignMedia = useMutation(
    api.mutations.media.attachCampaignMedia,
  );
  const removeCampaignMedia = useMutation(
    api.mutations.media.removeCampaignMedia,
  );
  const attachRoutineMedia = useMutation(
    api.mutations.media.attachRoutineMedia,
  );
  const removeRoutineMedia = useMutation(
    api.mutations.media.removeRoutineMedia,
  );

  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<{
    current: number;
    total: number;
    percentage: number;
    fileName: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [mediaToDelete, setMediaToDelete] = React.useState<{
    storageId: Id<"_storage">;
    filename: string;
  } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Helper function to upload file with progress tracking
  const uploadFileWithProgress = (
    uploadUrl: string,
    file: File,
    mimeType: string,
  ): Promise<Id<"_storage">> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded / e.total) * 100);
          setUploadProgress({
            current: e.loaded,
            total: e.total,
            percentage,
            fileName: file.name,
          });
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.storageId);
          } catch (err) {
            reject(new Error("Failed to parse upload response"));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload aborted"));
      });

      xhr.open("POST", uploadUrl);
      xhr.setRequestHeader("Content-Type", mimeType);
      xhr.send(file);
    });
  };

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(null);

    try {
      console.log(
        `[MediaAttachments] Starting upload for ${contentType}:`,
        contentId,
      );

      for (const file of Array.from(files)) {
        // 1) get upload URL
        const { uploadUrl } = await generateUploadUrl({});

        // 2) upload file bytes with progress tracking
        const mimeType = file.type || "application/octet-stream";
        const storageId = await uploadFileWithProgress(
          uploadUrl,
          file,
          mimeType,
        );

        const filename = file.name;
        const size = file.size;
        const extension = filename.includes(".")
          ? filename.split(".").pop()!.toLowerCase()
          : "";

        // 3) extract optional metadata
        let durationMs: number | undefined;
        let width: number | undefined;
        let height: number | undefined;
        if (mimeType.startsWith("video/")) {
          const meta = await extractVideoMetadata(file);
          durationMs = meta.durationMs;
          width = meta.width;
          height = meta.height;
        } else if (mimeType.startsWith("image/")) {
          const meta = await extractImageMetadata(file);
          width = meta.width;
          height = meta.height;
        }

        const media: MediaItem = {
          storageId,
          filename,
          size,
          contentType: mimeType,
          extension,
          durationMs,
          width,
          height,
          uploadedAt: Date.now(),
        };

        // 4) attach to content
        console.log(
          `[MediaAttachments] Attaching ${file.name} to ${contentType}`,
        );

        if (contentType === "campaign") {
          await attachCampaignMedia({
            campaignId: contentId as Id<"contentCampaigns">,
            file: media,
          });
        } else if (contentType === "routine") {
          await attachRoutineMedia({
            routineId: contentId as Id<"contentRoutines">,
            file: media,
          });
        } else {
          throw new Error(`Unknown content type: ${contentType}`);
        }

        console.log(`[MediaAttachments] Successfully attached ${file.name}`);
      }
      toast.success("Upload completed");
    } catch (err) {
      console.error("[MediaAttachments] Upload error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to upload media: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const onSelectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await processFiles(e.target.files);
    // Reset input value to allow re-uploading same file name
    e.target.value = "";
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    await processFiles(e.dataTransfer.files);
  };

  const onClickUploadBox = () => {
    fileInputRef.current?.click();
  };

  const openDeleteDialog = (storageId: Id<"_storage">, filename: string) => {
    setMediaToDelete({ storageId, filename });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!mediaToDelete) return;

    try {
      if (contentType === "campaign") {
        await removeCampaignMedia({
          campaignId: contentId as Id<"contentCampaigns">,
          storageId: mediaToDelete.storageId,
        });
      } else {
        await removeRoutineMedia({
          routineId: contentId as Id<"contentRoutines">,
          storageId: mediaToDelete.storageId,
        });
      }
      toast.success("Media deleted successfully");
      setDeleteDialogOpen(false);
      setMediaToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete media");
    }
  };

  return (
    <div className="space-y-3 pb-4">
      {/* Drag & Drop Upload Box */}
      {!uploadProgress && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={onClickUploadBox}
          className={`
          relative flex flex-col items-center justify-center
          rounded-sm border-2 border-dashed p-6
          transition-colors cursor-pointer
          ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
          }
          ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={onSelectFiles}
            className="hidden"
            aria-label="Upload files"
            disabled={isUploading}
            accept="image/*,video/*"
          />
          <Upload className="mb-3 h-4 w-4 text-muted-foreground" />
          <p className="mb-0.5 text-xs font-medium">
            {isUploading
              ? t("contents.media.upload.uploading")
              : t("contents.media.upload.clickToUpload")}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {t("contents.media.upload.supportedFormats")}
          </p>
        </div>
      )}

      {/* Upload Progress Indicator */}
      {uploadProgress && (
        <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-xs">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{uploadProgress.fileName}</p>
            </div>
            <span className="font-semibold text-primary shrink-0">
              {uploadProgress.percentage}%
            </span>
          </div>
          <Progress value={uploadProgress.percentage} className="h-2" />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {(uploadProgress.current / (1024 * 1024)).toFixed(2)} MB
            </span>
            <span>{(uploadProgress.total / (1024 * 1024)).toFixed(2)} MB</span>
          </div>
        </div>
      )}

      {/* Media Grid */}
      {(!mediaFiles || mediaFiles.length === 0) && (
        <div className="flex items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-sm text-muted-foreground">
            {t("contents.detail.noMedia")}
          </p>
        </div>
      )}

      {mediaFiles && mediaFiles.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mediaFiles.map((media) => (
            <MediaCard
              key={media.storageId as unknown as string}
              media={media}
              allMedia={mediaFiles}
              onDelete={() => openDeleteDialog(media.storageId, media.filename)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>
                {t("contents.media.deleteDialog.title")}
              </DialogTitle>
            </div>
            <DialogDescription className="pt-3">
              {t("contents.media.deleteDialog.description")}{" "}
              <span className="font-semibold text-foreground">
                {mediaToDelete?.filename}
              </span>
              ? {t("contents.media.deleteDialog.warning")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t("contents.media.deleteDialog.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("contents.media.deleteDialog.confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
