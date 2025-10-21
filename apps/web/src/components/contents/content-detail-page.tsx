"use client";

import * as React from "react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Trash2, FileText, ArrowLeft, Loader2 } from "lucide-react";
import { TaskSection } from "@/components/tasks";
import { EditablePlatformBadge } from "@/components/contents/editable-platform-badge";
import {
  EditableCampaignTypeBadge,
  EditableCampaignStatusBadge,
  EditableRoutineStatusBadge,
} from "@/components/contents/editable-badges";
import { MediaAttachments } from "@/components/contents/media-attachments";
import { ContentActivity } from "@/components/contents";
import TabsCustom from "@/components/tabs/tabs-custom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";

type ContentType = "campaign" | "routine";

interface ContentDetailPageProps {
  contentType: ContentType;
  data: any;
  isLoading?: boolean;
}

export function ContentDetailPage({
  contentType,
  data,
  isLoading = false,
}: ContentDetailPageProps) {
  const params = useParams();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Mutations
  const deleteCampaign = useMutation(api.mutations.contentCampaigns.remove);
  const deleteRoutine = useMutation(api.mutations.contentRoutines.remove);

  const handleDeleteContent = async () => {
    if (!content) return;

    try {
      if (contentType === "campaign") {
        await deleteCampaign({ id: content._id as Id<"contentCampaigns"> });
        toast.success("Campaign deleted successfully");
      } else {
        await deleteRoutine({ id: content._id as Id<"contentRoutines"> });
        toast.success("Routine deleted successfully");
      }
      setDeleteDialogOpen(false);
      router.push("/en/projects");
    } catch (error) {
      toast.error(`Failed to delete ${contentType}`);
      console.error(error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Loading state
  if (isLoading || data === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-xs text-muted-foreground">
            Loading {contentType}...
          </p>
        </div>
      </div>
    );
  }

  // Extract content and project based on type
  const content = contentType === "campaign" ? data.campaign : data.routine;
  const project = data.project;
  const locale = params.locale as string;

  // Not found state
  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">
            {contentType === "campaign" ? "Campaign" : "Routine"} Not Found
          </h1>
          <p className="text-muted-foreground mb-4">
            The {contentType} you&apos;re looking for doesn&apos;t exist or you
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

  const isCampaign = contentType === "campaign";
  const contentTypeName = isCampaign ? "Campaign" : "Routine";
  const maxWidth = isCampaign ? "max-w-4xl" : "max-w-5xl";

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <div className="bg-background sticky top-14 z-10">
          <div className={`container ${maxWidth} mx-auto px-4 sm:px-6 py-4`}>
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
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                {/* Parent Project Badge */}
                {project && (
                  <div className="mb-2">
                    <Badge variant="outline" size="xs" asChild>
                      <Link
                        href={`/${locale}/projects/${project._id}`}
                        className="hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        {project.title}
                      </Link>
                    </Badge>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h1 className="text-xl sm:text-2xl font-bold break-words">
                    {content.title}
                  </h1>
                  <Badge variant="outline" className="text-xs w-fit">
                    {contentTypeName}
                  </Badge>
                </div>
                {content.notes && (
                  <div className="mt-2 flex items-start gap-2">
                    <FileText className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                      {content.notes}
                    </p>
                  </div>
                )}
                {/* Campaign-specific SOW field */}
                {isCampaign && content.sow && (
                  <div className="mt-3">
                    <Label className="text-xs text-muted-foreground">
                      Statement of Work
                    </Label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">
                      {content.sow}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <TabsCustom
          containerMaxWidth={maxWidth}
          tabs={[
            {
              id: "detail",
              label: "Detail",
              content: (
                <div className="space-y-6">
                  {/* Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      Details
                    </h3>

                    {/* Editable Badges */}
                    <div className="flex flex-wrap gap-2">
                      <EditablePlatformBadge
                        value={content.platform}
                        contentId={content._id as any}
                      />
                      {isCampaign ? (
                        <>
                          <EditableCampaignTypeBadge
                            value={content.type}
                            campaignId={content._id as Id<"contentCampaigns">}
                          />
                          <EditableCampaignStatusBadge
                            value={content.status}
                            campaignId={content._id as Id<"contentCampaigns">}
                          />
                        </>
                      ) : (
                        <EditableRoutineStatusBadge
                          value={content.status}
                          routineId={content._id as Id<"contentRoutines">}
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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

                  {/* Media Attachments */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      Media
                    </h3>
                    <MediaAttachments
                      contentType={contentType}
                      contentId={content._id as any}
                      mediaFiles={content.mediaFiles}
                    />
                  </div>
                </div>
              ),
            },
            {
              id: "tasks",
              label: "Tasks",
              content: (
                <TaskSection
                  contentId={content._id}
                  contentType={contentType}
                  projectId={content.projectId}
                />
              ),
            },
            {
              id: "activity",
              label: "Activity",
              content: (
                <ContentActivity
                  contentId={content._id}
                  contentType={
                    isCampaign ? "content_campaign" : "content_routine"
                  }
                  statusHistory={content.statusHistory}
                />
              ),
            },
          ]}
          defaultValue="detail"
          variant="underline"
          autoAssignIcons={true}
          queryParamName="tab"
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {contentTypeName}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{content.title}&rdquo;?
              This action cannot be undone. All associated tasks will remain but
              will no longer be linked to this {contentType}.
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
