"use client";

import * as React from "react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { FunctionReturnType } from "convex/server";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  Clock,
  Trash2,
  FileText,
  ArrowLeft,
  Loader2,
  CheckSquare,
  FileQuestion,
} from "lucide-react";
import { TaskSection } from "@/components/tasks";
import { EditablePlatformBadge } from "@/components/contents/editable-badges/editable-platform-badge";
import {
  EditableCampaignTypeBadge,
  EditableCampaignStatusBadge,
  EditableRoutineStatusBadge,
} from "@/components/contents/editable-badges";
import { MediaAttachments } from "@/components/contents/media-attachments";
import { ContentActivity } from "@/components/contents";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQueryState } from "nuqs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useTranslations } from "@/hooks/use-translations";
import { ButtonPrimary } from "../ui/button-primary";

// Infer types from Convex queries
type CampaignData = FunctionReturnType<
  typeof api.queries.contentCampaigns.getBySlug
>;
type RoutineData = FunctionReturnType<
  typeof api.queries.contentRoutines.getBySlug
>;

// Props interface for preloaded data
interface CampaignDetailPageProps {
  contentType: "campaign";
  preloadedData: Preloaded<typeof api.queries.contentCampaigns.getBySlug>;
}

interface RoutineDetailPageProps {
  contentType: "routine";
  preloadedData: Preloaded<typeof api.queries.contentRoutines.getBySlug>;
}

type ContentDetailPageProps = CampaignDetailPageProps | RoutineDetailPageProps;

export function ContentDetailPage(props: ContentDetailPageProps) {
  // Split into separate components to avoid conditional hook calls
  if (props.contentType === "campaign") {
    return <CampaignDetailPageInner {...props} />;
  } else {
    return <RoutineDetailPageInner {...props} />;
  }
}

// Campaign Detail Page Inner Component
function CampaignDetailPageInner(props: CampaignDetailPageProps) {
  const { preloadedData } = props;
  const { t } = useTranslations();
  const router = useRouter();
  const params = useParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useQueryState("tab");
  const locale = (params.locale as string) || "en";

  const data = usePreloadedQuery(preloadedData) as CampaignData;

  // Mutations
  const deleteCampaign = useMutation(api.mutations.contentCampaigns.remove);

  const handleDeleteContent = async () => {
    if (!content) return;

    try {
      await deleteCampaign({ id: content._id as Id<"contentCampaigns"> });
      toast.success(
        t("contents.detail.deleteSuccess") || "Campaign deleted successfully",
      );
      setDeleteDialogOpen(false);
      router.push("/en/projects");
    } catch (error) {
      toast.error(
        t("contents.detail.deleteError") || "Failed to delete campaign",
      );
      console.error(error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Loading state
  if (data === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-xs text-muted-foreground">
            {t("common.loading")}...
          </p>
        </div>
      </div>
    );
  }

  // Handle null data
  if (!data) {
    return (
      <Empty className="min-h-[calc(100vh-3.5rem)]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestion className="size-5" />
          </EmptyMedia>
          <EmptyTitle>{t("contents.notFound.title")}</EmptyTitle>
          <EmptyDescription>
            {t("contents.notFound.description")}
          </EmptyDescription>
        </EmptyHeader>
        <ButtonPrimary onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("contents.notFound.goBack")}
        </ButtonPrimary>
      </Empty>
    );
  }

  // Extract content and project
  const content = data?.campaign ?? null;
  const project = data?.project ?? null;

  // Helper function to get year from project
  const getYearFromProject = (): string => {
    if (params?.year) {
      return params.year as string;
    }

    if (project?.startDate) {
      return new Date(project.startDate).getFullYear().toString();
    }
    if (project?.endDate) {
      return new Date(project.endDate).getFullYear().toString();
    }

    return new Date().getFullYear().toString();
  };

  // Not found state
  if (!content) {
    return (
      <Empty className="min-h-[calc(100vh-3.5rem)]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestion className="size-5" />
          </EmptyMedia>
          <EmptyTitle>{t("contents.notFound.title")}</EmptyTitle>
          <EmptyDescription>
            {t("contents.notFound.description")}
          </EmptyDescription>
        </EmptyHeader>
        <ButtonPrimary onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("contents.notFound.goBack")}
        </ButtonPrimary>
      </Empty>
    );
  }

  const contentTypeName = "Campaign";
  const maxWidth = "max-w-4xl";

  const currentTab = activeTab || "detail";

  return (
    <>
      <Tabs
        value={currentTab}
        onValueChange={(value) => setActiveTab(value)}
        className="flex flex-col h-[calc(100vh-3.5rem)]"
      >
        {/* Header + Tabs Navigation - Sticky */}
        <div className="bg-background sticky top-14 z-10">
          {/* Header */}
          <div className={`container ${maxWidth} mx-auto px-4 sm:px-6 py-4`}>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="xs" onClick={handleBack}>
                <ArrowLeft className="h-3 w-3 mr-1" />
                {t("contents.detail.back")}
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {t("contents.detail.delete")}
              </Button>
            </div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                {/* Parent Project Badge */}
                {project && (
                  <div className="mb-2">
                    <Badge variant="outline" size="xs" asChild>
                      <Link
                        href={`/${locale}/projects/${getYearFromProject()}/${project._id}`}
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
                {content.sow && (
                  <div className="mt-3">
                    <Label className="text-xs text-muted-foreground">
                      Statement of Work (SOW)
                    </Label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">
                      {content.sow}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b">
            <div className={`container ${maxWidth} mx-auto px-4 sm:px-6`}>
              <TabsList className="h-auto p-0 bg-transparent justify-start border-0 flex-nowrap overflow-x-auto gap-1">
                <TabsTrigger
                  value="detail"
                  className="px-0 text-xs font-normal border-b-2 border-transparent border-t-0 border-l-0 border-r-0 shadow-none data-[state=active]:border-b-[#f7a641] data-[state=active]:text-[#4a2e1a] data-[state=active]:border-t-0 data-[state=active]:border-l-0 data-[state=active]:border-r-0 data-[state=active]:shadow-none text-muted-foreground hover:text-foreground rounded-none transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-1.5">
                    <FileText className="h-3 w-3" />
                    <span className="text-xs">
                      {t("contents.detail.details")}
                    </span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="px-0 text-xs font-normal border-b-2 border-transparent border-t-0 border-l-0 border-r-0 shadow-none data-[state=active]:border-b-[#f7a641] data-[state=active]:text-[#4a2e1a] data-[state=active]:border-t-0 data-[state=active]:border-l-0 data-[state=active]:border-r-0 data-[state=active]:shadow-none text-muted-foreground hover:text-foreground rounded-none transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-1.5">
                    <CheckSquare className="h-3 w-3" />
                    <span className="text-xs">
                      {t("contents.detail.tasks")}
                    </span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="px-0 text-xs font-normal border-b-2 border-transparent border-t-0 border-l-0 border-r-0 shadow-none data-[state=active]:border-b-[#f7a641] data-[state=active]:text-[#4a2e1a] data-[state=active]:border-t-0 data-[state=active]:border-l-0 data-[state=active]:border-r-0 data-[state=active]:shadow-none text-muted-foreground hover:text-foreground rounded-none transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-1.5">
                    <FileText className="h-3 w-3" />
                    <span className="text-xs">
                      {t("contents.detail.activity")}
                    </span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        {/* Scrollable Tabs Content */}
        <ScrollArea className="flex-1">
          <div className={`container ${maxWidth} mx-auto px-4 sm:px-6`}>
            <TabsContent value="detail" className="mt-4">
              <div className="space-y-6">
                {/* Details Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    {t("contents.detail.details")}
                  </h3>

                  {/* Editable Badges */}
                  <div className="flex flex-wrap gap-2">
                    <EditablePlatformBadge
                      value={content.platform}
                      contentId={content._id as any}
                    />
                    <EditableCampaignTypeBadge
                      value={content.type}
                      campaignId={content._id as Id<"contentCampaigns">}
                    />
                    <EditableCampaignStatusBadge
                      value={
                        content.status as
                          | "product_obtained"
                          | "production"
                          | "published"
                          | "payment"
                          | "done"
                      }
                      campaignId={content._id as Id<"contentCampaigns">}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        {t("contents.detail.created")}
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
                        {t("contents.detail.updated")}
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
                    {t("contents.detail.media")}
                  </h3>
                  <MediaAttachments
                    contentType="campaign"
                    contentId={content._id as Id<"contentCampaigns">}
                    mediaFiles={content.mediaFiles}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <TaskSection
                contentId={content._id}
                contentType="campaign"
                projectId={content.projectId}
              />
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <ContentActivity
                contentId={content._id}
                contentType="content_campaign"
                statusHistory={content.statusHistory}
              />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("contents.detail.deleteTitle")} {contentTypeName}
            </DialogTitle>
            <DialogDescription>
              {t("contents.detail.deleteDescription")} &ldquo;{content.title}
              &rdquo;?
              {t("contents.detail.deleteWarning")} campaign.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t("contents.detail.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteContent}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t("contents.detail.confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Routine Detail Page Inner Component
function RoutineDetailPageInner(props: RoutineDetailPageProps) {
  const { preloadedData } = props;
  const { t } = useTranslations();
  const router = useRouter();
  const params = useParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useQueryState("tab");
  const locale = (params.locale as string) || "en";

  const data = usePreloadedQuery(preloadedData) as RoutineData;

  // Mutations
  const deleteRoutine = useMutation(api.mutations.contentRoutines.remove);

  const handleDeleteContent = async () => {
    if (!content) return;

    try {
      await deleteRoutine({ id: content._id as Id<"contentRoutines"> });
      toast.success(
        t("contents.detail.deleteSuccess") || "Routine deleted successfully",
      );
      setDeleteDialogOpen(false);
      router.push("/en/projects");
    } catch (error) {
      toast.error(
        t("contents.detail.deleteError") || "Failed to delete routine",
      );
      console.error(error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Loading state
  if (data === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-xs text-muted-foreground">
            {t("common.loading")}...
          </p>
        </div>
      </div>
    );
  }

  // Handle null data
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Routine Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The routine you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Extract content and project
  const content = data?.routine ?? null;
  const project = data?.project ?? null;

  // Helper function to get year from project
  const getYearFromProject = (): string => {
    if (params?.year) {
      return params.year as string;
    }

    if (project?.startDate) {
      return new Date(project.startDate).getFullYear().toString();
    }
    if (project?.endDate) {
      return new Date(project.endDate).getFullYear().toString();
    }

    return new Date().getFullYear().toString();
  };

  // Not found state
  if (!content) {
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

  const contentTypeName = "Routine";
  const maxWidth = "max-w-5xl";

  const currentTab = activeTab || "detail";

  return (
    <>
      <Tabs
        value={currentTab}
        onValueChange={(value) => setActiveTab(value)}
        className="flex flex-col h-[calc(100vh-3.5rem)]"
      >
        {/* Header + Tabs Navigation - Sticky */}
        <div className="bg-background sticky top-14 z-10">
          {/* Header */}
          <div className={`container ${maxWidth} mx-auto px-4 sm:px-6 py-4`}>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="xs" onClick={handleBack}>
                <ArrowLeft className="h-3 w-3 mr-1" />
                {t("contents.detail.back")}
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {t("contents.detail.delete")}
              </Button>
            </div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                {/* Parent Project Badge */}
                {project && (
                  <div className="mb-2">
                    <Badge variant="outline" size="xs" asChild>
                      <Link
                        href={`/${locale}/projects/${getYearFromProject()}/${project._id}`}
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
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b">
            <div className={`container ${maxWidth} mx-auto px-4 sm:px-6`}>
              <TabsList className="h-auto p-0 bg-transparent justify-start border-0 flex-nowrap overflow-x-auto gap-1">
                <TabsTrigger
                  value="detail"
                  className="px-0 text-xs font-normal border-b-2 border-transparent border-t-0 border-l-0 border-r-0 shadow-none data-[state=active]:border-b-[#f7a641] data-[state=active]:text-[#4a2e1a] data-[state=active]:border-t-0 data-[state=active]:border-l-0 data-[state=active]:border-r-0 data-[state=active]:shadow-none text-muted-foreground hover:text-foreground rounded-none transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-1.5">
                    <FileText className="h-3 w-3" />
                    <span className="text-xs">
                      {t("contents.detail.details")}
                    </span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="px-0 text-xs font-normal border-b-2 border-transparent border-t-0 border-l-0 border-r-0 shadow-none data-[state=active]:border-b-[#f7a641] data-[state=active]:text-[#4a2e1a] data-[state=active]:border-t-0 data-[state=active]:border-l-0 data-[state=active]:border-r-0 data-[state=active]:shadow-none text-muted-foreground hover:text-foreground rounded-none transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-1.5">
                    <CheckSquare className="h-3 w-3" />
                    <span className="text-xs">
                      {t("contents.detail.tasks")}
                    </span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="px-0 text-xs font-normal border-b-2 border-transparent border-t-0 border-l-0 border-r-0 shadow-none data-[state=active]:border-b-[#f7a641] data-[state=active]:text-[#4a2e1a] data-[state=active]:border-t-0 data-[state=active]:border-l-0 data-[state=active]:border-r-0 data-[state=active]:shadow-none text-muted-foreground hover:text-foreground rounded-none transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-1.5">
                    <FileText className="h-3 w-3" />
                    <span className="text-xs">
                      {t("contents.detail.activity")}
                    </span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        {/* Scrollable Tabs Content */}
        <ScrollArea className="flex-1">
          <div className={`container ${maxWidth} mx-auto px-4 sm:px-6`}>
            <TabsContent value="detail" className="mt-4">
              <div className="space-y-6">
                {/* Details Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    {t("contents.detail.details")}
                  </h3>

                  {/* Editable Badges */}
                  <div className="flex flex-wrap gap-2">
                    <EditablePlatformBadge
                      value={content.platform}
                      contentId={content._id as any}
                    />
                    <EditableRoutineStatusBadge
                      value={
                        content.status as
                          | "plan"
                          | "in_progress"
                          | "scheduled"
                          | "published"
                      }
                      routineId={content._id as Id<"contentRoutines">}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        {t("contents.detail.created")}
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
                        {t("contents.detail.updated")}
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
                    {t("contents.detail.media")}
                  </h3>
                  <MediaAttachments
                    contentType="routine"
                    contentId={content._id as Id<"contentRoutines">}
                    mediaFiles={content.mediaFiles}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <TaskSection
                contentId={content._id}
                contentType="routine"
                projectId={content.projectId}
              />
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <ContentActivity
                contentId={content._id}
                contentType="content_routine"
                statusHistory={content.statusHistory}
              />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("contents.detail.deleteTitle")} {contentTypeName}
            </DialogTitle>
            <DialogDescription>
              {t("contents.detail.deleteDescription")} &ldquo;{content.title}
              &rdquo;?
              {t("contents.detail.deleteWarning")} routine.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t("contents.detail.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteContent}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t("contents.detail.confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
