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
import { Calendar, Clock, Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskSection } from "@/components/tasks";
import { EditablePlatformBadge } from "./editable-platform-badge";
import {
  EditableCampaignTypeBadge,
  EditableCampaignStatusBadge,
  EditableRoutineStatusBadge,
} from "./editable-badges";
import { toast } from "sonner";

interface ContentDetailsDrawerProps {
  contentId: string | null;
  contentType: "campaign" | "routine";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function ContentDetailsDrawer({
  contentId,
  contentType,
  open,
  onOpenChange,
  onDeleted,
}: ContentDetailsDrawerProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Queries - conditionally fetch based on content type
  const campaignData = useQuery(
    api.queries.contentCampaigns.getById,
    contentId && contentType === "campaign"
      ? { campaignId: contentId as Id<"contentCampaigns"> }
      : "skip",
  );

  const routineData = useQuery(
    api.queries.contentRoutines.getById,
    contentId && contentType === "routine"
      ? { routineId: contentId as Id<"contentRoutines"> }
      : "skip",
  );

  // Mutations
  const deleteCampaign = useMutation(api.mutations.contentCampaigns.remove);
  const deleteRoutine = useMutation(api.mutations.contentRoutines.remove);

  const handleDeleteContent = async () => {
    if (!contentId) return;

    try {
      if (contentType === "campaign") {
        await deleteCampaign({ id: contentId as Id<"contentCampaigns"> });
      } else {
        await deleteRoutine({ id: contentId as Id<"contentRoutines"> });
      }
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

  // Get the appropriate content based on type
  const content =
    contentType === "campaign" ? campaignData?.campaign : routineData?.routine;

  if (!contentId || !content) {
    return null;
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full"
        >
          {/* Fixed Header */}
          <SheetHeader className="p-6 pb-4 flex-shrink-0 border-b">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <SheetTitle className="text-xl font-semibold break-words">
                    {content.title}
                  </SheetTitle>
                  <Badge variant="outline" className="text-xs">
                    {contentType === "campaign" ? "Campaign" : "Routine"}
                  </Badge>
                </div>
                {content.notes && (
                  <div className="mt-2 flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                      {content.notes}
                    </p>
                  </div>
                )}
                {contentType === "campaign" &&
                  "sow" in content &&
                  content.sow && (
                    <div className="mt-2">
                      <Label className="text-xs text-muted-foreground">
                        SOW
                      </Label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">
                        {content.sow}
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
                  <div className="grid grid-cols-2 gap-2">
                    <EditablePlatformBadge
                      value={content.platform}
                      contentId={contentId as any}
                    />
                    {contentType === "campaign" && "type" in content && (
                      <>
                        <EditableCampaignTypeBadge
                          value={content.type}
                          campaignId={contentId as Id<"contentCampaigns">}
                        />
                        <EditableCampaignStatusBadge
                          value={content.status}
                          campaignId={contentId as Id<"contentCampaigns">}
                        />
                      </>
                    )}
                    {contentType === "routine" && (
                      <EditableRoutineStatusBadge
                        value={content.status}
                        routineId={contentId as Id<"contentRoutines">}
                      />
                    )}
                  </div>

                  {/* Status History */}
                  {content.statusHistory &&
                    content.statusHistory.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Status History
                        </Label>
                        <div className="space-y-2">
                          {content.statusHistory.map((history, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 text-xs"
                            >
                              <Clock className="h-3 w-3 text-muted-foreground mt-0.5" />
                              <div className="flex-1">
                                <Badge
                                  variant="outline"
                                  className="text-xs mr-2"
                                >
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
                          {new Date(content.createdAt).toLocaleDateString()}
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
                          {new Date(content.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tasks Section */}
                <TaskSection
                  contentId={contentId}
                  contentType={contentType}
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
              Are you sure you want to delete &ldquo;{content.title}&rdquo;?
              This action cannot be undone. All associated tasks will remain but
              will no longer be linked to this content.
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
