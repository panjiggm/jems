"use client";

import * as React from "react";
import { useAction, useMutation, useConvex } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

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

  const onSelectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        // 1) get upload URL
        const { uploadUrl } = await generateUploadUrl({});

        // 2) upload file bytes
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!res.ok) throw new Error("Upload failed");
        const { storageId } = (await res.json()) as {
          storageId: Id<"_storage">;
        };

        const filename = file.name;
        const size = file.size;
        const contentType = file.type || "application/octet-stream";
        const extension = filename.includes(".")
          ? filename.split(".").pop()!.toLowerCase()
          : "";

        // 3) extract optional metadata
        let durationMs: number | undefined;
        let width: number | undefined;
        let height: number | undefined;
        if (contentType.startsWith("video/")) {
          const meta = await extractVideoMetadata(file);
          durationMs = meta.durationMs;
          width = meta.width;
          height = meta.height;
        } else if (contentType.startsWith("image/")) {
          const meta = await extractImageMetadata(file);
          width = meta.width;
          height = meta.height;
        }

        const media: MediaItem = {
          storageId,
          filename,
          size,
          contentType,
          extension,
          durationMs,
          width,
          height,
          uploadedAt: Date.now(),
        };

        // 4) attach to content
        if (contentType === "campaign") {
          await attachCampaignMedia({
            campaignId: contentId as Id<"contentCampaigns">,
            file: media,
          });
        } else {
          await attachRoutineMedia({
            routineId: contentId as Id<"contentRoutines">,
            file: media,
          });
        }
      }
      toast.success("Upload completed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload media");
    } finally {
      setIsUploading(false);
      // Reset input value to allow re-uploading same file name
      e.target.value = "";
    }
  };

  const handleView = async (storageId: Id<"_storage">) => {
    try {
      const { url } = await convex.query(api.queries.media.getFileUrl, {
        storageId,
      });
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      toast.error("Failed to open file");
    }
  };

  const handleDelete = async (storageId: Id<"_storage">) => {
    try {
      if (contentType === "campaign") {
        await removeCampaignMedia({
          campaignId: contentId as Id<"contentCampaigns">,
          storageId,
        });
      } else {
        await removeRoutineMedia({
          routineId: contentId as Id<"contentRoutines">,
          storageId,
        });
      }
      toast.success("Media deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete media");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Attachments</Label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            multiple
            onChange={onSelectFiles}
            aria-label="Upload files"
            disabled={isUploading}
          />
        </div>
      </div>
      <Separator />

      {(!mediaFiles || mediaFiles.length === 0) && (
        <p className="text-xs text-muted-foreground">No media attached.</p>
      )}

      {mediaFiles && mediaFiles.length > 0 && (
        <div className="space-y-2">
          {mediaFiles.map((m) => (
            <div
              key={m.storageId as unknown as string}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{m.filename}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{(m.size / (1024 * 1024)).toFixed(2)} MB</span>
                  <Badge variant="outline" className="text-2xs">
                    {m.contentType}
                  </Badge>
                  {m.durationMs !== undefined && (
                    <span>{Math.round((m.durationMs || 0) / 1000)}s</span>
                  )}
                  {m.width && m.height && (
                    <span>
                      {m.width}x{m.height}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(m.storageId)}
                >
                  View
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(m.storageId)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
