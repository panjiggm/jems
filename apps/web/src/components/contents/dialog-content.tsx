"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { toast } from "sonner";
import { Loader2, CalendarIcon } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useContentDialogStore } from "@/store/use-dialog-content-store";
import { useTranslations } from "@/hooks/use-translations";
import {
  ContentType,
  ContentCampaignType,
  ContentCampaignStatus,
  ContentRoutineStatus,
} from "@/types/status";

export function ContentDialog() {
  const { t } = useTranslations();
  const {
    isOpen,
    isLoading,
    projectId,
    formData,
    errors,
    closeDialog,
    setLoading,
    updateFormData,
    setError,
    clearErrors,
    resetForm,
  } = useContentDialogStore();

  const [contentType, setContentType] = useState<ContentType>("campaign");

  // Get projects list for dropdown (only when projectId is not provided)
  const projects = useQuery(
    api.queries.projects.getAll,
    !projectId ? { search: "" } : "skip",
  );

  const createCampaign = useMutation(api.mutations.contentCampaigns.create);
  const createRoutine = useMutation(api.mutations.contentRoutines.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    clearErrors();

    // Validation
    let hasErrors = false;

    if (!formData.title.trim()) {
      setError("title", "Title is required");
      hasErrors = true;
    }

    if (!formData.platform) {
      setError("platform", "Platform is required");
      hasErrors = true;
    }

    if (!projectId) {
      setError("projectId", "Project is required");
      hasErrors = true;
    }

    // Campaign-specific validation
    if (contentType === "campaign" && !formData.campaignType) {
      setError("campaignType", "Campaign type is required");
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      setLoading(true);

      if (contentType === "campaign") {
        await createCampaign({
          projectId: projectId as any,
          title: formData.title.trim(),
          sow: formData.sow?.trim() || undefined,
          platform: formData.platform,
          type: formData.campaignType as ContentCampaignType,
          status: (formData.campaignStatus ||
            "product_obtained") as ContentCampaignStatus,
          notes: formData.notes.trim() || undefined,
        });
      } else {
        await createRoutine({
          projectId: projectId as any,
          title: formData.title.trim(),
          notes: formData.notes.trim() || undefined,
          platform: formData.platform,
          status: (formData.routineStatus || "plan") as ContentRoutineStatus,
        });
      }

      toast.success("Content created successfully!", {
        description: `"${formData.title}" has been created`,
      });

      resetForm();
      closeDialog();
    } catch (error) {
      console.error("Failed to create content:", error);
      toast.error("Failed to create content", {
        description: "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      closeDialog();
    }
  };

  const platformOptions = [
    { value: "tiktok", label: "TikTok", icon: "/icons/tiktok.svg" },
    { value: "instagram", label: "Instagram", icon: "/icons/instagram.svg" },
    { value: "youtube", label: "YouTube", icon: "/icons/youtube.svg" },
    { value: "x", label: "X (Twitter)", icon: "/icons/x.svg" },
    { value: "facebook", label: "Facebook", icon: "/icons/facebook.svg" },
    { value: "threads", label: "Threads", icon: "/icons/thread.svg" },
    { value: "other", label: "Other", icon: null },
  ];

  const campaignTypeOptions = [
    { value: "barter", label: "Barter" },
    { value: "paid", label: "Paid" },
  ];

  const campaignStatusOptions = [
    { value: "product_obtained", label: "Product Obtained" },
    { value: "production", label: "Production" },
    { value: "published", label: "Published" },
    { value: "payment", label: "Payment" },
    { value: "done", label: "Done" },
  ];

  const routineStatusOptions = [
    { value: "plan", label: "Plan" },
    { value: "in_progress", label: "In Progress" },
    { value: "scheduled", label: "Scheduled" },
    { value: "published", label: "Published" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Content</DialogTitle>
            <DialogDescription>
              {projectId
                ? "Add content to your project"
                : "Select a project and add content"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Content Type Selection */}
            <div className="grid gap-2">
              <Label>Content Type</Label>
              <Tabs
                value={contentType}
                onValueChange={(value) => setContentType(value as ContentType)}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="campaign">Campaign</TabsTrigger>
                  <TabsTrigger value="routine">Routine</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Project Selection - Only show when projectId is not provided */}
            {!projectId && (
              <div className="grid gap-2">
                <Label htmlFor="project">
                  Project <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={projectId}
                  onValueChange={(value) =>
                    updateFormData({ projectId: value as string })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className={errors.projectId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((project) => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.projectId && (
                  <p className="text-sm text-red-500">{errors.projectId}</p>
                )}
              </div>
            )}

            {/* Content Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="Enter content title"
                disabled={isLoading}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Campaign-specific fields */}
            {contentType === "campaign" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="sow">Statement of Work (SOW)</Label>
                  <Textarea
                    id="sow"
                    value={formData.sow || ""}
                    onChange={(e) => updateFormData({ sow: e.target.value })}
                    placeholder="Enter SOW details"
                    disabled={isLoading}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="campaignType">
                      Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.campaignType}
                      onValueChange={(value: any) =>
                        updateFormData({ campaignType: value })
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger
                        className={errors.campaignType ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {campaignTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.campaignType && (
                      <p className="text-sm text-red-500">
                        {errors.campaignType}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="campaignStatus">Status</Label>
                    <Select
                      value={formData.campaignStatus || "product_obtained"}
                      onValueChange={(value: any) =>
                        updateFormData({ campaignStatus: value })
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {campaignStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Routine-specific fields */}
            {contentType === "routine" && (
              <div className="grid gap-2">
                <Label htmlFor="routineStatus">Status</Label>
                <Select
                  value={formData.routineStatus || "plan"}
                  onValueChange={(value: any) =>
                    updateFormData({ routineStatus: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {routineStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Platform Selection */}
            <div className="grid gap-2">
              <Label htmlFor="platform">
                Platform <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.platform}
                onValueChange={(value: any) =>
                  updateFormData({ platform: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger
                  className={errors.platform ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon && (
                          <Image
                            src={option.icon}
                            alt={option.label}
                            width={16}
                            height={16}
                            className="w-4 h-4"
                          />
                        )}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.platform && (
                <p className="text-sm text-red-500">{errors.platform}</p>
              )}
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData({ notes: e.target.value })}
                placeholder="Add any additional notes..."
                disabled={isLoading}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <ButtonPrimary type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Content
            </ButtonPrimary>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
