"use client";

import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@packages/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Files,
  HardDrive,
  Video,
  Image,
  Clock,
  Megaphone,
  Repeat,
} from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function DriveStats() {
  const stats = useQuery(api.queries.media.getMediaStats, {});

  if (!stats) {
    return (
      <div className="p-3 sm:p-4 space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const videoPercentage =
    stats.totalFiles > 0
      ? Math.round((stats.videoCount / stats.totalFiles) * 100)
      : 0;
  const imagePercentage =
    stats.totalFiles > 0
      ? Math.round((stats.imageCount / stats.totalFiles) * 100)
      : 0;

  return (
    <div className="p-3 sm:p-4 space-y-3">
      {/* Total Files */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Files className="h-3.5 w-3.5" />
            Total Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalFiles}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.recentUploads} uploaded this week
          </p>
        </CardContent>
      </Card>

      {/* Total Storage */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <HardDrive className="h-3.5 w-3.5" />
            Storage Used
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatBytes(stats.totalStorage)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all content
          </p>
        </CardContent>
      </Card>

      {/* File Types */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            File Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              <Video className="h-3.5 w-3.5" />
              <span>Videos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">{stats.videoCount}</span>
              <span className="text-xs text-muted-foreground">
                ({videoPercentage}%)
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              <Image className="h-3.5 w-3.5" />
              <span>Images</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">{stats.imageCount}</span>
              <span className="text-xs text-muted-foreground">
                ({imagePercentage}%)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Content Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              <Megaphone className="h-3.5 w-3.5" />
              <span>Campaigns</span>
            </div>
            <span className="text-xs font-medium">{stats.campaignFiles}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              <Repeat className="h-3.5 w-3.5" />
              <span>Routines</span>
            </div>
            <span className="text-xs font-medium">{stats.routineFiles}</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recentUploads}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Files uploaded in last 7 days
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
