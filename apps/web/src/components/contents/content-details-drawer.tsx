"use client";

import * as React from "react";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Trash2, ExternalLink, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskSection } from "@/components/tasks";
import { EditablePlatformBadge } from "./editable-platform-badge";
import { EditableTypeBadge } from "./editable-type-badge";
import { EditablePhaseBadge } from "./editable-phase-badge";
import { EditableStatusBadge } from "./editable-status-badge";
import { toast } from "sonner";

interface ContentDetailsDrawerProps {
  contentId: Id<"contents"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function ContentDetailsDrawer({
  contentId,
  open,
  onOpenChange,
  onDeleted,
}: ContentDetailsDrawerProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Queries
  const contentData = useQuery(
    api.queries.contents.getByIdWithStats,
    contentId ? { contentId } : "skip",
  );

  // Mutations
  const deleteContent = useMutation(api.mutations.contents.remove);

  const handleDeleteContent = async () => {
    if (!contentId) return;

    try {
      await deleteContent({ id: contentId });
      toast.success("Content deleted successfully");
      setDeleteDialogOpen(false);
      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      toast.error("Failed to delete content");
      console.error(error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!contentId || !contentData?.content) {
    return null;
  }

  const { content } = contentData;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col h-full"
        >
          {/* Fixed Header */}
          <SheetHeader className="p-6 pb-4 flex-shrink-0 border-b">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-xl font-semibold break-words">
                  {content.title}
                </SheetTitle>
                {content.notes && (
                  <div className="mt-2 flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                      {content.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </SheetHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* Content Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Details
                  </h3>

                  {/* Editable Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <EditablePlatformBadge
                      value={content.platform}
                      contentId={content._id}
                    />
                    <EditableTypeBadge
                      value={content.type}
                      contentId={content._id}
                    />
                    <EditablePhaseBadge
                      value={content.phase}
                      contentId={content._id}
                    />
                    <EditableStatusBadge
                      value={content.status}
                      contentId={content._id}
                      contentType={content.type}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Due Date
                      </Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(content.dueDate)}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Scheduled At
                      </Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(content.scheduledAt)}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Published At
                      </Label>
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(content.publishedAt)}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Created
                      </Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(content.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tasks Section */}
                <TaskSection
                  contentId={content._id}
                  projectId={content.projectId}
                />
              </div>
            </ScrollArea>
          </div>

          {/* Fixed Footer */}
          <SheetFooter className="p-6 pt-4 border-t flex-shrink-0">
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              Delete Content
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Content</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{content.title}"? This action
              cannot be undone. All associated tasks will remain but will no
              longer be linked to this content.
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
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
