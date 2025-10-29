"use client";

import * as React from "react";
import { useConvex } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  FileIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "@/hooks/use-translations";
import { format } from "date-fns";

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

interface MediaViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: MediaItem[];
  initialIndex?: number;
  showNavigation?: boolean;
}

export function MediaViewer({
  open,
  onOpenChange,
  media,
  initialIndex = 0,
  showNavigation = true,
}: MediaViewerProps) {
  const { t } = useTranslations();
  const convex = useConvex();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      startIndex: initialIndex,
      loop: false,
      dragFree: false,
      containScroll: "trimSnaps",
    },
    [WheelGesturesPlugin()],
  );

  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [mediaUrls, setMediaUrls] = React.useState<Map<string, string>>(
    new Map(),
  );
  const [loading, setLoading] = React.useState<Set<string>>(new Set());
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  const currentMedia = media[currentIndex];

  // Load media URLs
  React.useEffect(() => {
    if (!open) return;

    const loadMediaUrls = async () => {
      for (const item of media) {
        const key = item.storageId;
        if (!mediaUrls.has(key) && !loading.has(key)) {
          setLoading((prev) => new Set(prev).add(key));
          try {
            const result = await convex.query(api.queries.media.getFileUrl, {
              storageId: item.storageId,
            });
            if (result?.url) {
              setMediaUrls((prev) => new Map(prev).set(key, result.url));
            }
          } catch (err) {
            console.error("Failed to load media URL", err);
          } finally {
            setLoading((prev) => {
              const newSet = new Set(prev);
              newSet.delete(key);
              return newSet;
            });
          }
        }
      }
    };

    loadMediaUrls();
  }, [open, media, convex, mediaUrls, loading]);

  // Update current index when embla changes
  React.useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
      setZoom(1);
      setRotation(0);
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Reset zoom and rotation when dialog closes
  React.useEffect(() => {
    if (!open) {
      setZoom(1);
      setRotation(0);
    }
  }, [open]);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const canScrollPrev = emblaApi?.canScrollPrev() ?? false;
  const canScrollNext = emblaApi?.canScrollNext() ?? false;

  const handleDownload = async (media: MediaItem) => {
    const url = mediaUrls.get(media.storageId);
    if (!url) {
      toast.error(t("drive.errors.fileNotFound"));
      return;
    }

    try {
      const a = document.createElement("a");
      a.href = url;
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const isImage = (contentType: string) => contentType.startsWith("image/");
  const isVideo = (contentType: string) => contentType.startsWith("video/");
  const isAudio = (contentType: string) => contentType.startsWith("audio/");

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] sm:h-[85vh] md:h-[80vh] p-0 gap-0 my-6">
        {/* Header */}
        <DialogHeader className="px-3 sm:px-4 py-2 sm:py-3 border-b space-y-0 overflow-hidden">
          <div className="min-w-0">
            <DialogTitle className="text-xs sm:text-sm font-semibold truncate">
              {currentMedia?.filename || "Media Viewer"}
            </DialogTitle>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              {currentMedia && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mt-0.5 sm:mt-1 text-xs sm:text-[11px] text-muted-foreground">
                  <span className="whitespace-nowrap">
                    {formatFileSize(currentMedia.size)}
                  </span>
                  <span className="text-muted-foreground/50 hidden sm:inline">
                    •
                  </span>
                  <span className="whitespace-nowrap">
                    {format(new Date(currentMedia.uploadedAt), "MMM d, yyyy")}
                  </span>
                  {currentMedia.width && currentMedia.height && (
                    <>
                      <span className="text-muted-foreground/50 hidden sm:inline">
                        •
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0.5 h-5 sm:h-auto"
                      >
                        {currentMedia.width}×{currentMedia.height}
                      </Badge>
                    </>
                  )}
                  {currentMedia.durationMs && (
                    <>
                      <span className="text-muted-foreground/50 hidden sm:inline">
                        •
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0.5 h-5 sm:h-auto"
                      >
                        {Math.round(currentMedia.durationMs / 1000)}s
                      </Badge>
                    </>
                  )}

                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleDownload(currentMedia)}
                    className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                  >
                    <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              {currentMedia && isImage(currentMedia.contentType) && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                  >
                    <ZoomOut className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </Button>
                  <span className="text-xs sm:text-sm text-muted-foreground min-w-[2rem] sm:min-w-[2.5rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                  >
                    <ZoomIn className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRotate}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                  >
                    <RotateCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="relative flex-1 overflow-hidden bg-muted/20 touch-none">
          <div className="embla h-full" ref={emblaRef}>
            <div className="embla__container h-full flex">
              {media.map((item, index) => {
                const url = mediaUrls.get(item.storageId);
                const isLoading = loading.has(item.storageId);
                const isCurrent = index === currentIndex;

                return (
                  <div
                    key={item.storageId}
                    className="embla__slide flex-[0_0_100%] min-w-0 relative flex items-center justify-center p-2 sm:p-4 md:p-8"
                  >
                    {isLoading ? (
                      <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Loading...
                        </p>
                      </div>
                    ) : url ? (
                      <>
                        {isImage(item.contentType) ? (
                          <div
                            className="relative w-full h-full flex items-center justify-center overflow-hidden"
                            style={{
                              touchAction: zoom > 1 ? "pan-x pan-y" : "none",
                            }}
                          >
                            <img
                              src={url}
                              alt={item.filename}
                              className="max-w-full max-h-full w-auto h-auto object-contain select-none"
                              style={{
                                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                transition:
                                  zoom === 1
                                    ? "transform 0.2s ease-out"
                                    : "none",
                                maxWidth: "100%",
                                maxHeight: "100%",
                              }}
                              draggable={false}
                              onContextMenu={(e) => e.preventDefault()}
                            />
                          </div>
                        ) : isVideo(item.contentType) ? (
                          <video
                            src={url}
                            controls
                            className="max-w-full max-h-full w-auto h-auto select-none"
                            // style={{
                            //   maxWidth: "100vw",
                            // }}
                            autoPlay={isCurrent}
                            playsInline
                            onContextMenu={(e) => e.preventDefault()}
                          />
                        ) : isAudio(item.contentType) ? (
                          <div className="flex flex-col items-center gap-4 sm:gap-6 max-w-sm sm:max-w-md w-full px-4">
                            <div className="flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-primary/10">
                              <FileIcon className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
                            </div>
                            <audio src={url} controls className="w-full" />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-4 sm:gap-6 max-w-sm sm:max-w-md w-full p-4 sm:p-8 bg-card rounded-lg border">
                            <div className="flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-muted">
                              <FileIcon className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-sm sm:text-base font-medium line-clamp-3">
                                {item.filename}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {t("drive.media.previewNotAvailable")}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => handleDownload(item)}
                              className="w-full text-xs sm:text-sm"
                            >
                              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                              Download File
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <FileIcon className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Failed to load media
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Arrows */}
          {showNavigation && media.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full shadow-lg"
                onClick={scrollPrev}
                disabled={!canScrollPrev}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full shadow-lg"
                onClick={scrollNext}
                disabled={!canScrollNext}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Footer - Thumbnails */}
        {showNavigation && media.length > 1 && (
          <div className="border-t px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                {currentIndex + 1} / {media.length}
              </span>
              <div className="flex gap-1 sm:gap-2 flex-1 overflow-x-auto pb-1 sm:pb-2">
                {media.map((item, index) => {
                  const url = mediaUrls.get(item.storageId);
                  const isActive = index === currentIndex;

                  return (
                    <button
                      key={item.storageId}
                      onClick={() => emblaApi?.scrollTo(index)}
                      className={`flex-shrink-0 relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded border-2 transition-all overflow-hidden ${
                        isActive
                          ? "border-primary ring-1 sm:ring-2 ring-primary/20"
                          : "border-transparent hover:border-muted-foreground/30"
                      }`}
                    >
                      {url && isImage(item.contentType) ? (
                        <img
                          src={url}
                          alt={item.filename}
                          className="w-full h-full object-cover"
                        />
                      ) : url && isVideo(item.contentType) ? (
                        <video
                          src={url}
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <FileIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-muted-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
