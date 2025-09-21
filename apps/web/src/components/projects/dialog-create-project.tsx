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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

import { useCreateProjectDialogStore } from "@/store/use-dialog-store";
import { ButtonPrimary } from "../ui/button-primary";

export function CreateProjectDialog() {
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
      setError("title", "Title is required");
      hasErrors = true;
    }

    if (!formData.type) {
      setError("type", "Project type is required");
      hasErrors = true;
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      setError("endDate", "End date must be after start date");
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      setLoading(true);

      await createProject({
        title: formData.title.trim(),
        type: formData.type,
        description: formData.description.trim() || undefined,
        startDate: formData.startDate?.toISOString().split("T")[0],
        endDate: formData.endDate?.toISOString().split("T")[0],
      });

      toast.success("Project created successfully!", {
        description: `"${formData.title}" has been created.`,
      });

      // Reset form and close dialog
      resetForm();
      closeDialog();
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project", {
        description:
          "Please try again or contact support if the problem persists.",
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
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project to organize your content and track progress.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Project Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">
                Project Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="Enter project title..."
                disabled={isLoading}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Project Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">
                Project Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: "campaign" | "series" | "routine") =>
                  updateFormData({ type: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="campaign">Campaign</SelectItem>
                  <SelectItem value="series">Series</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  updateFormData({ description: e.target.value })
                }
                placeholder="Describe your project..."
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
                label="Start Date"
                onSelectDate={handleDateChange("startDate")}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate}</p>
              )}

              <DatePicker
                label="End Date"
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
              Cancel
            </ButtonPrimary>
            <ButtonPrimary type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Creating..." : "Create Project"}
            </ButtonPrimary>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
