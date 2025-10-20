"use client";

import * as React from "react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Trash2, FileText, ArrowLeft, Loader2 } from "lucide-react";
import { TaskSection } from "@/components/tasks";
import { EditablePlatformBadge } from "@/components/contents/editable-platform-badge";
import { EditableRoutineStatusBadge } from "@/components/contents/editable-badges";
import { MediaAttachments } from "@/components/contents/media-attachments";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function RoutineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Query routine by slug
  const routineData = useQuery(api.queries.contentRoutines.getBySlug, {
    slug,
  });

  // Mutations
  const deleteRoutine = useMutation(api.mutations.contentRoutines.remove);

  const handleDeleteContent = async () => {
    if (!routineData?.routine) return;

    try {
      await deleteRoutine({ id: routineData.routine._id });
      toast.success("Routine deleted successfully");
      setDeleteDialogOpen(false);
      // Navigate back to projects
      router.push("/en/projects");
    } catch (error) {
      toast.error("Failed to delete routine");
      console.error(error);
    }
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleBack = () => {
    router.back();
  };

  // Loading state
  if (routineData === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-xs text-muted-foreground">Loading routine...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!routineData?.routine) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Routine Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The routine you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const routine = routineData.routine;

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <div className="border-b bg-background sticky top-14 z-10">
          <div className="container max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="xs" onClick={handleBack}>
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold break-words">
                    {routine.title}
                  </h1>
                  <Badge variant="outline" className="text-xs">
                    Routine
                  </Badge>
                </div>
                {routine.notes && (
                  <div className="mt-2 flex items-start gap-2">
                    <FileText className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                      {routine.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <ScrollArea className="flex-1">
          <div className="container max-w-5xl mx-auto px-6 py-6 space-y-6">
            {/* Details Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Details</h3>

              {/* Editable Badges */}
              <div className="grid grid-cols-2 gap-2">
                <EditablePlatformBadge
                  value={routine.platform}
                  contentId={routine._id as any}
                />
                <EditableRoutineStatusBadge
                  value={routine.status}
                  routineId={routine._id as Id<"contentRoutines">}
                />
              </div>

              {/* Status History */}
              {routine.statusHistory && routine.statusHistory.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Status History
                  </Label>
                  <div className="space-y-2">
                    {routine.statusHistory.map((history, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 text-xs"
                      >
                        <Clock className="h-3 w-3 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <Badge variant="outline" className="text-xs mr-2">
                            {history.status}
                          </Badge>
                          <span className="text-muted-foreground">
                            {formatTimestamp(history.timestamp)}
                          </span>
                          {history.note && (
                            <p className="text-muted-foreground mt-1">
                              {history.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Created
                  </Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(routine.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Updated
                  </Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(routine.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Media Attachments */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Media</h3>
              <MediaAttachments
                contentType="routine"
                contentId={routine._id as any}
                mediaFiles={routine.mediaFiles}
              />
            </div>

            <Separator />

            {/* Tasks Section */}
            <TaskSection
              contentId={routine._id}
              contentType="routine"
              projectId={routine.projectId}
            />
          </div>
        </ScrollArea>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Routine</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{routine.title}&rdquo;?
              This action cannot be undone. All associated tasks will remain but
              will no longer be linked to this routine.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteContent}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
