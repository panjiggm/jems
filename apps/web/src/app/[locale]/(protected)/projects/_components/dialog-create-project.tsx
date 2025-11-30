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

import { useCreateProjectDialogStore } from "@/store/use-dialog-store";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { useTranslations } from "@/hooks/use-translations";

export function CreateProjectDialog() {
  const { t } = useTranslations();
  const {
    isOpen,
    isLoading,
    formData,
    errors,
    closeDialog,
    setLoading,
    updateFormData,
    setError,
    clearErrors,
    resetForm,
  } = useCreateProjectDialogStore();

  const createProject = useMutation(api.mutations.projects.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    clearErrors();

    // Validation
    let hasErrors = false;

    if (!formData.title.trim()) {
      setError("title", t("projects.dialog.form.titleRequired"));
      hasErrors = true;
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      setError("endDate", t("projects.dialog.form.endDateError"));
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      setLoading(true);

      await createProject({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        startDate: formData.startDate?.toISOString().split("T")[0],
        endDate: formData.endDate?.toISOString().split("T")[0],
      });

      toast.success(t("projects.dialog.messages.success"), {
        description: `"${formData.title}" ${t("projects.dialog.messages.successDescription")}`,
      });

      // Reset form and close dialog
      resetForm();
      closeDialog();
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error(t("projects.dialog.messages.error"), {
        description: t("projects.dialog.messages.errorDescription"),
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
            <DialogTitle>{t("projects.dialog.title")}</DialogTitle>
            <DialogDescription>
              {t("projects.dialog.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Project Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">
                {t("projects.dialog.form.title")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder={t("projects.dialog.form.titlePlaceholder")}
                disabled={isLoading}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">
                {t("projects.dialog.form.description")}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  updateFormData({ description: e.target.value })
                }
                placeholder={t("projects.dialog.form.descriptionPlaceholder")}
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
              <DatePicker
                className="w-full"
                label={t("projects.dialog.form.startDate")}
                onSelectDate={handleDateChange("startDate")}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate}</p>
              )}

              <DatePicker
                className="w-full"
                label={t("projects.dialog.form.endDate")}
                onSelectDate={handleDateChange("endDate")}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <ButtonPrimary
              type="button"
              tone="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t("projects.dialog.buttons.cancel")}
            </ButtonPrimary>
            <ButtonPrimary type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading
                ? t("projects.dialog.buttons.creating")
                : t("projects.dialog.buttons.create")}
            </ButtonPrimary>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
