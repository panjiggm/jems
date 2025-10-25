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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, Check, X } from "lucide-react";
import { toast } from "sonner";
import { ButtonPrimary } from "../ui/button-primary";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-translations";

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
  const { t } = useTranslations();
  const contentList = useQuery(api.queries.media.getContentList, {});
  const generateUploadUrl = useAction(api.actions.storage.generateUploadUrl);
  const attachCampaignMedia = useMutation(
    api.mutations.media.attachCampaignMedia,
  );
  const attachRoutineMedia = useMutation(
    api.mutations.media.attachRoutineMedia,
  );

  const [selectedContent, setSelectedContent] = React.useState<string>("");
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<{
    current: number;
    total: number;
    percentage: number;
    fileName: string;
  } | null>(null);
  const [uploadComplete, setUploadComplete] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSelectedContent("");
      setSelectedFiles([]);
      setIsUploading(false);
      setUploadProgress(null);
      setUploadComplete(false);
      setIsDragOver(false);
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
    if (!selectedContent || selectedFiles.length === 0) {
      toast.error(t("drive.errors.pleaseSelectContentAndFiles"));
      return;
    }

    setIsUploading(true);
    setUploadProgress(null);

    try {
      const content = contentList?.find((c) => c.id === selectedContent);
      if (!content) throw new Error(t("drive.errors.contentNotFound"));

      const fileArray = selectedFiles;
      toast.info(
        `${t("drive.upload.uploading")} ${fileArray.length} ${fileArray.length > 1 ? t("drive.upload.filesSelected") : "file"}...`,
      );

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        toast.loading(
          `${t("drive.upload.uploadProgress")} ${file.name} (${i + 1}/${fileArray.length})`,
          {
            id: "upload-progress",
          },
        );
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

        toast.success(`${file.name} ${t("drive.upload.uploadSuccess")}`, {
          id: "upload-progress",
        });
      }

      setUploadComplete(true);
      toast.success(`${t("drive.upload.allFilesUploaded")}`);

      // Close dialog after a brief delay
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      const errorMessage =
        err instanceof Error ? err.message : t("drive.errors.unknownError");
      toast.error(`${t("drive.upload.uploadFailed")} ${errorMessage}`, {
        id: "upload-progress",
      });
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      setIsDragOver(true);
    }
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
    if (!isUploading) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const onClickUploadBox = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
    toast.success(t("drive.upload.removeFile"));
  };

  const selectedContentItem = contentList?.find(
    (c) => c.id === selectedContent,
  );

  // Prevent closing dialog during upload
  const handleOpenChange = (newOpen: boolean) => {
    // If trying to close and uploading, show confirmation
    if (!newOpen && isUploading) {
      if (window.confirm(t("drive.upload.uploadInProgress"))) {
        // User confirmed, cancel upload and close
        setIsUploading(false);
        setUploadProgress(null);
        onOpenChange(false);
        toast.error(t("drive.upload.uploadCancelled"));
      }
      // If user cancelled confirmation, do nothing (keep dialog open)
      return;
    }
    // Normal close when not uploading
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-w-[95vw]"
        onInteractOutside={(e) => {
          // Prevent closing by clicking outside when uploading
          if (isUploading) {
            e.preventDefault();
            toast.warning(t("drive.upload.pleaseWaitForUpload"));
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing with ESC key when uploading
          if (isUploading) {
            e.preventDefault();
            toast.warning(t("drive.upload.pleaseWaitForUpload"));
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{t("drive.upload.title")}</DialogTitle>
          <DialogDescription>{t("drive.upload.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Content Selection */}
          <div className="space-y-2">
            <Label htmlFor="content-select">{t("drive.upload.content")}</Label>
            <Select
              value={selectedContent}
              onValueChange={setSelectedContent}
              disabled={isUploading}
            >
              <SelectTrigger id="content-select">
                <SelectValue
                  placeholder={t("drive.upload.contentPlaceholder")}
                />
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
                {selectedContentItem.mediaCount}{" "}
                {t("drive.upload.existingFiles")}
              </p>
            )}
          </div>

          {/* File Selection - Drag & Drop Box */}
          <div className="space-y-2">
            <Label htmlFor="file-input">{t("drive.upload.files")}</Label>
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={onClickUploadBox}
              className={`
                relative flex flex-col items-center justify-center
                rounded-lg border-2 border-dashed p-8
                transition-all cursor-pointer
                ${
                  isDragOver
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
                }
                ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <input
                ref={fileInputRef}
                id="file-input"
                type="file"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                accept="image/*,video/*"
                disabled={isUploading}
              />
              <Upload
                className={`mb-3 h-8 w-8 ${isDragOver ? "text-primary" : "text-muted-foreground"}`}
              />
              <p className="mb-1 text-sm font-medium text-center">
                {isUploading
                  ? t("drive.upload.uploading")
                  : selectedFiles.length > 0
                    ? `${selectedFiles.length} ${selectedFiles.length > 1 ? t("drive.upload.filesSelected") : "file"}`
                    : isDragOver
                      ? t("drive.upload.dropFilesHere")
                      : t("drive.upload.dragAndDrop")}
              </p>
              <p className="text-xs text-muted-foreground text-center">
                {t("drive.upload.supportedFormats")}
              </p>
            </div>
            {selectedFiles.length > 0 && !isUploading && (
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("drive.upload.selectedFiles")}
                </p>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-md border bg-muted/30 p-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-xs text-foreground break-words font-medium leading-relaxed">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleRemoveFile(idx)}
                        title={t("drive.upload.removeFile")}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {uploadProgress.fileName}
                  </p>
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
                <span>
                  {(uploadProgress.total / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadComplete && (
            <div className="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
              <Check className="h-4 w-4" />
              <span>{t("drive.upload.uploadComplete")}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <ButtonPrimary
            tone="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
            disabled={isUploading}
            title={isUploading ? t("drive.upload.pleaseWaitForUpload") : ""}
          >
            {isUploading
              ? t("drive.upload.uploading")
              : t("drive.upload.cancel")}
          </ButtonPrimary>
          <ButtonPrimary
            size="sm"
            onClick={handleUpload}
            disabled={
              !selectedContent ||
              selectedFiles.length === 0 ||
              isUploading ||
              uploadComplete
            }
          >
            {isUploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-pulse" />
                {t("drive.upload.uploading")}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {t("drive.upload.upload")}
              </>
            )}
          </ButtonPrimary>
        </div>
      </DialogContent>
    </Dialog>
  );
}
