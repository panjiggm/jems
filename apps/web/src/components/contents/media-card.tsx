"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FileVideo,
  FileImage,
  FileAudio,
  File,
  Download,
  Trash2,
} from "lucide-react";
import type { Id } from "@packages/backend/convex/_generated/dataModel";

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

interface MediaCardProps {
  media: MediaItem;
  onView: (storageId: Id<"_storage">) => void;
  onDelete: (storageId: Id<"_storage">) => void;
}

function getFileIcon(contentType: string, extension: string) {
  if (contentType.startsWith("image/")) {
    return <FileImage className="h-8 w-8" />;
  }
  if (contentType.startsWith("video/")) {
    return <FileVideo className="h-8 w-8" />;
  }
  if (contentType.startsWith("audio/")) {
    return <FileAudio className="h-8 w-8" />;
  }
  if (
    ["pdf", "doc", "docx", "txt"].includes(extension) ||
    contentType.includes("document") ||
    contentType.includes("text")
  ) {
    return <FileText className="h-8 w-8" />;
  }
  return <File className="h-8 w-8" />;
}

function getFileTypeColor(contentType: string): string {
  if (contentType.startsWith("image/")) return "text-blue-500";
  if (contentType.startsWith("video/")) return "text-purple-500";
  if (contentType.startsWith("audio/")) return "text-green-500";
  if (contentType.includes("pdf")) return "text-red-500";
  if (contentType.includes("document")) return "text-blue-600";
  return "text-gray-500";
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

export function MediaCard({ media, onView, onDelete }: MediaCardProps) {
  const iconColor = getFileTypeColor(media.contentType);

  return (
    <div className="group relative flex flex-col rounded-lg border bg-card p-4 transition-all hover:shadow-md">
      {/* File Icon */}
      <div className={`mb-3 flex items-center justify-center ${iconColor}`}>
        {getFileIcon(media.contentType, media.extension)}
      </div>

      {/* File Info */}
      <div className="mb-3 flex-1 space-y-2">
        <h4
          className="line-clamp-2 text-sm font-medium leading-tight"
          title={media.filename}
        >
          {media.filename}
        </h4>

        {/* File Details */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground" />
              {formatFileSize(media.size)}
            </span>
          </div>

          {/* Video/Image metadata */}
          {(media.durationMs !== undefined ||
            (media.width && media.height)) && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {media.durationMs !== undefined && (
                <Badge variant="secondary" className="text-[10px] h-5">
                  {Math.round(media.durationMs / 1000)}s
                </Badge>
              )}
              {media.width && media.height && (
                <Badge variant="secondary" className="text-[10px] h-5">
                  {media.width}×{media.height}
                </Badge>
              )}
            </div>
          )}

          {/* Upload date */}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDate(media.uploadedAt)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="xs"
          className="flex-1 text-xs"
          onClick={() => onView(media.storageId)}
        >
          <Download className="mr-1.5 h-3 w-3" />
          View
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(media.storageId)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
