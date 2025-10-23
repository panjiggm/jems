"use client";

import * as React from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, Check } from "lucide-react";
import { toast } from "sonner";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const contentList = useQuery(api.queries.media.getContentList, {});
  const generateUploadUrl = useAction(api.actions.storage.generateUploadUrl);
  const attachCampaignMedia = useMutation(
    api.mutations.media.attachCampaignMedia,
  );
  const attachRoutineMedia = useMutation(
    api.mutations.media.attachRoutineMedia,
  );

  const [selectedContent, setSelectedContent] = React.useState<string>("");
  const [selectedFiles, setSelectedFiles] = React.useState<FileList | null>(
    null,
  );
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<{
    current: number;
    total: number;
    percentage: number;
    fileName: string;
  } | null>(null);
  const [uploadComplete, setUploadComplete] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSelectedContent("");
      setSelectedFiles(null);
      setIsUploading(false);
      setUploadProgress(null);
      setUploadComplete(false);
    }
  }, [open]);

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

      xhr.open("POST", uploadUrl);
      xhr.setRequestHeader("Content-Type", mimeType);
      xhr.send(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedContent || !selectedFiles) {
      toast.error("Please select content and files");
      return;
    }

    setIsUploading(true);
    setUploadProgress(null);

    try {
      const content = contentList?.find((c) => c.id === selectedContent);
      if (!content) throw new Error("Content not found");

      for (const file of Array.from(selectedFiles)) {
        // Get upload URL
        const { uploadUrl } = await generateUploadUrl({});

        // Upload file with progress
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

        // Extract metadata
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

        const media = {
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

        // Attach to content
        if (content.type === "campaign") {
          await attachCampaignMedia({
            campaignId: content.id as Id<"contentCampaigns">,
            file: media,
          });
        } else {
          await attachRoutineMedia({
            routineId: content.id as Id<"contentRoutines">,
            file: media,
          });
        }
      }

      setUploadComplete(true);
      toast.success("Upload completed");

      // Close dialog after a brief delay
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Upload failed: ${errorMessage}`);
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const selectedContentItem = contentList?.find(
    (c) => c.id === selectedContent,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Select a campaign or routine to upload files to
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Content Selection */}
          <div className="space-y-2">
            <Label htmlFor="content-select">Content</Label>
            <Select
              value={selectedContent}
              onValueChange={setSelectedContent}
              disabled={isUploading}
            >
              <SelectTrigger id="content-select">
                <SelectValue placeholder="Select campaign or routine" />
              </SelectTrigger>
              <SelectContent>
                {contentList?.map((content) => (
                  <SelectItem key={content.id} value={content.id}>
                    <div className="flex items-center gap-2">
                      <span className="capitalize text-xs text-muted-foreground">
                        [{content.type}]
                      </span>
                      <span>{content.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedContentItem && (
              <p className="text-xs text-muted-foreground">
                {selectedContentItem.projectTitle} •{" "}
                {selectedContentItem.mediaCount} existing files
              </p>
            )}
          </div>

          {/* File Selection */}
          <div className="space-y-2">
            <Label htmlFor="file-input">Files</Label>
            <input
              ref={fileInputRef}
              id="file-input"
              type="file"
              multiple
              onChange={(e) => setSelectedFiles(e.target.files)}
              className="hidden"
              accept="image/*,video/*"
              disabled={isUploading}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full"
            >
              {selectedFiles
                ? `${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""} selected`
                : "Choose files"}
            </Button>
            {selectedFiles && (
              <p className="text-xs text-muted-foreground">
                {Array.from(selectedFiles)
                  .map((f) => f.name)
                  .join(", ")}
              </p>
            )}
          </div>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium truncate flex-1 mr-2">
                  {uploadProgress.fileName}
                </span>
                <span className="font-semibold text-primary">
                  {uploadProgress.percentage}%
                </span>
              </div>
              <Progress value={uploadProgress.percentage} className="h-2" />
            </div>
          )}

          {/* Success Message */}
          {uploadComplete && (
            <div className="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
              <Check className="h-4 w-4" />
              <span>Upload completed successfully!</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={
              !selectedContent ||
              !selectedFiles ||
              isUploading ||
              uploadComplete
            }
          >
            {isUploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
