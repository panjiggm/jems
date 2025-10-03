"use client";

import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useDeleteProjectDialogStore } from "@/store/use-dialog-store";
import { ButtonPrimary } from "../ui/button-primary";
import { useTranslations } from "@/hooks/use-translations";

export function DeleteProjectDialog() {
  const { t } = useTranslations();
  const router = useRouter();
  const {
    isOpen,
    isLoading,
    projectId,
    projectTitle,
    closeDialog,
    setLoading,
  } = useDeleteProjectDialogStore();

  const deleteProject = useMutation(api.mutations.projects.remove);

  const handleDelete = async () => {
    if (!projectId) return;

    try {
      setLoading(true);

      await deleteProject({ id: projectId });

      toast.success(t("projects.deleteDialog.messages.success"), {
        description: `"${projectTitle}" ${t("projects.deleteDialog.messages.successDescription")}`,
      });

      closeDialog();

      // Navigate to projects page after deletion
      router.push("/en/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error(t("projects.deleteDialog.messages.error"), {
        description: t("projects.deleteDialog.messages.errorDescription"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      closeDialog();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 rounded-full p-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle>{t("projects.deleteDialog.title")}</DialogTitle>
          </div>
          <DialogDescription className="pt-3">
            {t("projects.deleteDialog.description")}{" "}
            <span className="font-semibold text-foreground">
              &ldquo;{projectTitle}&rdquo;
            </span>
            ?
            <br />
            <br />
            {t("projects.deleteDialog.warning")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <ButtonPrimary
            type="button"
            tone="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            {t("projects.deleteDialog.buttons.cancel")}
          </ButtonPrimary>
          <ButtonPrimary
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading
              ? t("projects.deleteDialog.buttons.deleting")
              : t("projects.deleteDialog.buttons.delete")}
          </ButtonPrimary>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
