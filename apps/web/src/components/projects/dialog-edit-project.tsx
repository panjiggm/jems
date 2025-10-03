"use client";

import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
import { DatePicker } from "@/components/ui/date-picker";

import { useEditProjectDialogStore } from "@/store/use-dialog-store";
import { ButtonPrimary } from "../ui/button-primary";
import { useTranslations } from "@/hooks/use-translations";

export function EditProjectDialog() {
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
  } = useEditProjectDialogStore();

  const updateProject = useMutation(api.mutations.projects.update);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    clearErrors();

    // Validation
    let hasErrors = false;

    if (!formData.title.trim()) {
      setError("title", t("projects.editDialog.form.titleRequired"));
      hasErrors = true;
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      setError("endDate", t("projects.editDialog.form.endDateError"));
      hasErrors = true;
    }

    if (hasErrors || !projectId) {
      return;
    }

    try {
      setLoading(true);

      await updateProject({
        id: projectId,
        patch: {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          startDate: formData.startDate?.toISOString().split("T")[0],
          endDate: formData.endDate?.toISOString().split("T")[0],
        },
      });

      toast.success(t("projects.editDialog.messages.success"), {
        description: `"${formData.title}" ${t("projects.editDialog.messages.successDescription")}`,
      });

      // Reset form and close dialog
      resetForm();
      closeDialog();
    } catch (error) {
      console.error("Failed to update project:", error);
      toast.error(t("projects.editDialog.messages.error"), {
        description: t("projects.editDialog.messages.errorDescription"),
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

  const handleDateChange =
    (field: "startDate" | "endDate") => (date: Date | undefined) => {
      updateFormData({ [field]: date });
    };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("projects.editDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("projects.editDialog.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Project Title */}
            <div className="grid gap-2">
              <Label htmlFor="edit-title">
                {t("projects.editDialog.form.title")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder={t("projects.editDialog.form.titlePlaceholder")}
                disabled={isLoading}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="edit-description">
                {t("projects.editDialog.form.description")}
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  updateFormData({ description: e.target.value })
                }
                placeholder={t(
                  "projects.editDialog.form.descriptionPlaceholder",
                )}
                rows={3}
                disabled={isLoading}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <DatePicker
                  className="w-full"
                  label={t("projects.editDialog.form.startDate")}
                  date={formData.startDate}
                  onSelectDate={handleDateChange("startDate")}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <DatePicker
                  className="w-full"
                  label={t("projects.editDialog.form.endDate")}
                  date={formData.endDate}
                  onSelectDate={handleDateChange("endDate")}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <ButtonPrimary
              type="button"
              tone="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t("projects.editDialog.buttons.cancel")}
            </ButtonPrimary>
            <ButtonPrimary type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading
                ? t("projects.editDialog.buttons.updating")
                : t("projects.editDialog.buttons.update")}
            </ButtonPrimary>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
