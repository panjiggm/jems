"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ButtonPrimary } from "../ui/button-primary";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ConvertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ideaId: Id<"contentIdeas"> | null;
  convertType: "campaign" | "routine" | null;
  onSuccess?: () => void;
}

export function ConvertDialog({
  open,
  onOpenChange,
  ideaId,
  convertType,
  onSuccess,
}: ConvertDialogProps) {
  const [projectId, setProjectId] = useState<Id<"projects"> | undefined>(
    undefined,
  );
  const [platform, setPlatform] = useState<string | undefined>(undefined);
  const [type, setType] = useState<"barter" | "paid" | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projects = useQuery(api.queries.projects.getAll, {});
  const idea = useQuery(
    api.queries.contentIdeas.getContentIdea,
    ideaId ? { ideaId } : "skip",
  );

  const convertToCampaign = useMutation(
    api.mutations.contentIdeas.convertIdeaToCampaign,
  );
  const convertToRoutine = useMutation(
    api.mutations.contentIdeas.convertIdeaToRoutine,
  );

  const handleSubmit = async () => {
    if (!ideaId || !projectId) {
      toast.error("Please select a project");
      return;
    }

    if (!convertType) return;

    setIsSubmitting(true);
    try {
      if (convertType === "campaign") {
        await convertToCampaign({
          ideaId,
          projectId,
          platform: platform as
            | "tiktok"
            | "instagram"
            | "youtube"
            | "x"
            | "facebook"
            | "threads"
            | "other"
            | undefined,
          type: type as "barter" | "paid" | undefined,
        });
        toast.success("Content idea converted to campaign!");
      } else {
        await convertToRoutine({
          ideaId,
          projectId,
          platform: platform as
            | "tiktok"
            | "instagram"
            | "youtube"
            | "x"
            | "facebook"
            | "threads"
            | "other"
            | undefined,
        });
        toast.success("Content idea converted to routine!");
      }
      onOpenChange(false);
      setProjectId(undefined);
      setPlatform(undefined);
      setType(undefined);
      onSuccess?.();
    } catch (error) {
      console.error("Error converting idea:", error);
      toast.error("Failed to convert idea. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set default platform from idea
  if (idea?.platform && !platform) {
    setPlatform(idea.platform);
  }

  const projectsList = projects || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Convert to {convertType === "campaign" ? "Campaign" : "Routine"}
          </DialogTitle>
          <DialogDescription>
            Select a project to convert this content idea into a{" "}
            {convertType === "campaign" ? "campaign" : "routine"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select
              value={projectId}
              onValueChange={(value) => setProjectId(value as Id<"projects">)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="project">
                <SelectValue placeholder="Select a project..." />
              </SelectTrigger>
              <SelectContent>
                {projectsList.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No projects available. Create a project first.
                  </div>
                ) : (
                  projectsList.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select
              value={platform}
              onValueChange={setPlatform}
              disabled={isSubmitting}
            >
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select platform..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="x">X (Twitter)</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="threads">Threads</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {convertType === "campaign" && (
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as "barter" | "paid")}
                disabled={isSubmitting}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="barter">Barter</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <ButtonPrimary
            tone="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </ButtonPrimary>
          <ButtonPrimary onClick={handleSubmit} disabled={!projectId || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              "Convert"
            )}
          </ButtonPrimary>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

