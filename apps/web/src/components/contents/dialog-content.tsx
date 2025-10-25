"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { toast } from "sonner";
import {
  Loader2,
  Package,
  Wrench,
  Send,
  DollarSign,
  CheckCircle,
  Target,
  Play,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { useQueryState } from "nuqs";

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
import { Badge } from "@/components/ui/badge";

import { useContentDialogStore } from "@/store/use-dialog-content-store";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";
import {
  ContentType,
  ContentCampaignType,
  ContentCampaignStatus,
  ContentRoutineStatus,
} from "@/types/status";
import {
  DurationSettings,
  type StatusDurations,
} from "@/components/contents/duration-settings";

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

  const [contentType] = useQueryState("contentType", {
    defaultValue: "campaign",
  });

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
      setError("title", t("contents.dialog.form.titleRequired"));
      hasErrors = true;
    }

    if (!formData.platform) {
      setError("platform", t("contents.dialog.form.platformRequired"));
      hasErrors = true;
    }

    if (!projectId) {
      setError("projectId", t("contents.dialog.form.projectRequired"));
      hasErrors = true;
    }

    // Campaign-specific validation
    if ((contentType || "campaign") === "campaign" && !formData.campaignType) {
      setError("campaignType", t("contents.dialog.form.campaignTypeRequired"));
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      setLoading(true);

      if ((contentType || "campaign") === "campaign") {
        // Filter only campaign-related durations
        const campaignDurations = formData.statusDurations
          ? {
              product_obtained_to_production:
                formData.statusDurations.product_obtained_to_production,
              production_to_published:
                formData.statusDurations.production_to_published,
              published_to_payment:
                formData.statusDurations.published_to_payment,
              payment_to_done: formData.statusDurations.payment_to_done,
            }
          : undefined;

        await createCampaign({
          projectId: projectId as any,
          title: formData.title.trim(),
          sow: formData.sow?.trim() || undefined,
          platform: formData.platform,
          type: formData.campaignType as ContentCampaignType,
          status: (formData.campaignStatus ||
            "product_obtained") as ContentCampaignStatus,
          notes: formData.notes.trim() || undefined,
          statusDurations: campaignDurations,
        });
      } else {
        // Filter only routine-related durations
        const routineDurations = formData.statusDurations
          ? {
              plan_to_in_progress: formData.statusDurations.plan_to_in_progress,
              in_progress_to_scheduled:
                formData.statusDurations.in_progress_to_scheduled,
              scheduled_to_published:
                formData.statusDurations.scheduled_to_published,
            }
          : undefined;

        await createRoutine({
          projectId: projectId as any,
          title: formData.title.trim(),
          notes: formData.notes.trim() || undefined,
          platform: formData.platform,
          status: (formData.routineStatus || "plan") as ContentRoutineStatus,
          statusDurations: routineDurations,
        });
      }

      toast.success(t("contents.dialog.messages.success"), {
        description: `"${formData.title}" ${t("contents.dialog.messages.successDescription")}`,
      });

      resetForm();
      closeDialog();
    } catch (error) {
      console.error("Failed to create content:", error);
      toast.error(t("contents.dialog.messages.error"), {
        description: t("contents.dialog.messages.errorDescription"),
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

  // Platform configs
  const platformConfigs = {
    tiktok: { label: "TikTok", icon: "/icons/tiktok.svg" },
    instagram: { label: "Instagram", icon: "/icons/instagram.svg" },
    youtube: { label: "YouTube", icon: "/icons/youtube.svg" },
    x: { label: "X (Twitter)", icon: "/icons/x.svg" },
    facebook: { label: "Facebook", icon: "/icons/facebook.svg" },
    threads: { label: "Threads", icon: "/icons/thread.svg" },
    other: { label: "Other", icon: null },
  };

  // Campaign type configs
  const campaignTypeConfigs = {
    barter: {
      label: "Barter",
      icon: Package,
      className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    paid: {
      label: "Paid",
      icon: DollarSign,
      className: "bg-amber-100 text-amber-800 border-amber-200",
    },
  };

  // Campaign status configs
  const campaignStatusConfigs = {
    product_obtained: {
      label: "Product Obtained",
      shortLabel: "Product",
      icon: Package,
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    production: {
      label: "Production",
      shortLabel: "Production",
      icon: Wrench,
      className: "bg-orange-100 text-orange-800 border-orange-200",
    },
    published: {
      label: "Published",
      shortLabel: "Published",
      icon: Send,
      className: "bg-green-100 text-green-800 border-green-200",
    },
    payment: {
      label: "Payment",
      shortLabel: "Payment",
      icon: DollarSign,
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    done: {
      label: "Done",
      shortLabel: "Done",
      icon: CheckCircle,
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
  };

  // Routine status configs
  const routineStatusConfigs = {
    plan: {
      label: "Plan",
      icon: Target,
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    in_progress: {
      label: "In Progress",
      icon: Play,
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    scheduled: {
      label: "Scheduled",
      icon: Calendar,
      className: "bg-purple-100 text-purple-800 border-purple-200",
    },
    published: {
      label: "Published",
      icon: Send,
      className: "bg-green-100 text-green-800 border-green-200",
    },
  };

  // Helper function to get platform config
  const getPlatformConfig = (platform: string) => {
    return platformConfigs[platform as keyof typeof platformConfigs];
  };

  // Build options with Badges
  const platformOptions = Object.entries(platformConfigs).map(
    ([value, config]) => ({
      value,
      label: (
        <div className="flex items-center gap-2">
          {config.icon && (
            <Image
              src={config.icon}
              alt={config.label}
              width={16}
              height={16}
              className="h-3 w-3"
            />
          )}
          {config.label}
        </div>
      ),
    }),
  );

  const campaignTypeOptions = Object.entries(campaignTypeConfigs).map(
    ([value, config]) => {
      const IconComponent = config.icon;
      return {
        value,
        label: (
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-2 text-xs font-medium",
              config.className,
            )}
          >
            <IconComponent className="h-3 w-3" />
            {config.label}
          </Badge>
        ),
      };
    },
  );

  const campaignStatusOptions = Object.entries(campaignStatusConfigs).map(
    ([value, config]) => {
      const IconComponent = config.icon;
      return {
        value,
        label: (
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-2 text-xs font-medium",
              config.className,
            )}
          >
            <IconComponent className="h-3 w-3" />
            <span className="hidden sm:inline">{config.label}</span>
            <span className="sm:hidden">{config.shortLabel}</span>
          </Badge>
        ),
      };
    },
  );

  const routineStatusOptions = Object.entries(routineStatusConfigs).map(
    ([value, config]) => {
      const IconComponent = config.icon;
      return {
        value,
        label: (
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-2 text-xs font-medium",
              config.className,
            )}
          >
            <IconComponent className="h-3 w-3" />
            {config.label}
          </Badge>
        ),
      };
    },
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-sm font-semibold">
              Create New Content
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-2">
            {/* Content Title */}
            <div className="space-y-2">
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder={t("contents.dialog.form.titlePlaceholder")}
                disabled={isLoading}
                className={`border-none shadow-none focus-visible:ring-0 focus:ring-0 focus:outline-none px-0 transition-all duration-200 text-lg focus:text-2xl font-semibold`}
              />
              {errors.title && (
                <p className="text-xs text-red-500 px-0">{errors.title}</p>
              )}
            </div>

            {/* Campaign-specific: SOW */}
            {contentType === "campaign" ? (
              <div className="space-y-2">
                <textarea
                  id="sow"
                  value={formData.sow || ""}
                  onChange={(e) => updateFormData({ sow: e.target.value })}
                  placeholder={t("contents.dialog.form.sowPlaceholder")}
                  disabled={isLoading}
                  rows={4}
                  className="text-xs text-muted-foreground resize-none border-none outline-none focus:ring-0 focus:border-none bg-transparent w-full"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateFormData({ notes: e.target.value })}
                  placeholder={t("contents.dialog.form.notesPlaceholder")}
                  disabled={isLoading}
                  rows={5}
                  className="text-xs text-muted-foreground resize-none border-none outline-none focus:ring-0 focus:border-none bg-transparent w-full"
                />
              </div>
            )}

            {/* Duration Settings */}
            <DurationSettings
              contentType={
                (contentType || "campaign") as "campaign" | "routine"
              }
              durations={formData.statusDurations}
              onChange={(durations) =>
                updateFormData({ statusDurations: durations })
              }
              disabled={isLoading}
            />

            {/* Notes/Description */}
          </div>

          {/* Bottom Action Bar */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between w-full">
              {/* Status */}
              <div className="flex flex-wrap items-center gap-2">
                {(contentType || "campaign") === "campaign" ? (
                  <Select
                    value={formData.campaignStatus || "product_obtained"}
                    onValueChange={(value: any) =>
                      updateFormData({ campaignStatus: value })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-auto h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignStatusOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-xs py-1 px-2"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={formData.routineStatus || "plan"}
                    onValueChange={(value: any) =>
                      updateFormData({ routineStatus: value })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-auto h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {routineStatusOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-xs py-1 px-2"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Campaign Type */}
                {(contentType || "campaign") === "campaign" && (
                  <Select
                    value={formData.campaignType}
                    onValueChange={(value: any) =>
                      updateFormData({ campaignType: value })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      className={`w-auto h-7 text-xs ${
                        errors.campaignType ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue
                        placeholder={t("contents.dialog.form.type")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignTypeOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-xs py-1 px-2"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Platform */}
                <Select
                  value={formData.platform}
                  onValueChange={(value: any) =>
                    updateFormData({ platform: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className={`w-auto h-7 text-xs ${
                      errors.platform ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue
                      placeholder={t("contents.dialog.form.platform")}
                    >
                      {formData.platform
                        ? (() => {
                            const config = getPlatformConfig(formData.platform);
                            return (
                              <div className="flex items-center gap-2">
                                {config?.icon && (
                                  <Image
                                    src={config.icon}
                                    alt={config.label}
                                    width={16}
                                    height={16}
                                    className="h-4 w-4"
                                  />
                                )}
                                <span className="hidden sm:inline">
                                  {config?.label || "Platform"}
                                </span>
                              </div>
                            );
                          })()
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-xs py-1 px-2"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Project Selection - Only show when projectId is not provided */}
                {!projectId && (
                  <Select
                    value={projectId}
                    onValueChange={(value) =>
                      updateFormData({ projectId: value as string })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      className={`w-auto h-8 text-sm ${
                        errors.projectId ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue
                        placeholder={t("contents.dialog.form.project")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.map((project) => (
                        <SelectItem
                          key={project._id}
                          value={project._id}
                          className="text-xs py-1 px-2"
                        >
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="">
                <ButtonPrimary type="submit" disabled={isLoading} size="sm">
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create
                </ButtonPrimary>
              </div>
            </div>

            {/* Error messages */}
            {(errors.campaignType || errors.platform || errors.projectId) && (
              <div className="text-sm text-red-500">
                {errors.campaignType || errors.platform || errors.projectId}
              </div>
            )}
          </div>

          {/* <DialogFooter className="pt-4">
          </DialogFooter> */}
        </form>
      </DialogContent>
    </Dialog>
  );
}
