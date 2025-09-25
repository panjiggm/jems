"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { toast } from "sonner";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

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

import { useContentDialogStore } from "@/store/use-dialog-content-store";
import { useTranslations } from "@/hooks/use-translations";

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

  // Get projects list for dropdown (only when projectId is not provided)
  const projects = useQuery(
    api.queries.projects.getAll,
    !projectId ? { search: "" } : "skip",
  );

  const createContent = useMutation(api.mutations.contents.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    clearErrors();

    // Validation
    let hasErrors = false;

    if (!formData.title.trim()) {
      setError("title", t("contents.dialog.form.titleRequired"));
      hasErrors = true;
    }

    if (!projectId) {
      setError("projectId", t("contents.dialog.form.projectRequired"));
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      setLoading(true);

      await createContent({
        projectId: projectId as any,
        title: formData.title.trim(),
        platform: formData.platform,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        notes: formData.notes.trim() || undefined,
      });

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

  const platformOptions = [
    { value: "tiktok", label: "TikTok" },
    { value: "instagram", label: "Instagram" },
    { value: "youtube", label: "YouTube" },
    { value: "x", label: "X (Twitter)" },
    { value: "facebook", label: "Facebook" },
    { value: "threads", label: "Threads" },
    { value: "other", label: "Other" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("contents.dialog.title")}</DialogTitle>
            <DialogDescription>
              {projectId
                ? t("contents.dialog.description.withProject")
                : t("contents.dialog.description.selectProject")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Project Selection - Only show when projectId is not provided */}
            {!projectId && (
              <div className="grid gap-2">
                <Label htmlFor="project">
                  {t("contents.dialog.form.project")}{" "}
                  <span className="text-red-500">*</span>
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
                    <SelectValue
                      placeholder={t("contents.dialog.form.projectPlaceholder")}
                    />
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
                {t("contents.dialog.form.title")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder={t("contents.dialog.form.titlePlaceholder")}
                disabled={isLoading}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Platform Selection */}
            <div className="grid gap-2">
              <Label htmlFor="platform">
                {t("contents.dialog.form.platform")}{" "}
                <span className="text-red-500">*</span>
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.platform && (
                <p className="text-sm text-red-500">{errors.platform}</p>
              )}
            </div>

            {/* Priority Selection */}
            <div className="grid gap-2">
              <Label htmlFor="priority">
                {t("contents.dialog.form.priority")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) =>
                  updateFormData({ priority: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger
                  className={errors.priority ? "border-red-500" : ""}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-500">{errors.priority}</p>
              )}
            </div>

            {/* Due Date */}
            <div className="grid gap-2">
              <Label htmlFor="dueDate">
                {t("contents.dialog.form.dueDate")}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !formData.dueDate && "text-muted-foreground"
                    } ${errors.dueDate ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? (
                      format(new Date(formData.dueDate), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formData.dueDate ? new Date(formData.dueDate) : undefined
                    }
                    onSelect={(date) =>
                      updateFormData({
                        dueDate: date ? format(date, "yyyy-MM-dd") : "",
                      })
                    }
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate}</p>
              )}
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">{t("contents.dialog.form.notes")}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData({ notes: e.target.value })}
                placeholder={t("contents.dialog.form.notesPlaceholder")}
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
              {t("common.cancel")}
            </Button>
            <ButtonPrimary type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("contents.dialog.form.createButton")}
            </ButtonPrimary>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
