"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@packages/backend/convex/_generated/api";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import { UpdateNicheDialog } from "./update-niche-dialog";
import { ButtonPrimary } from "../ui/button-primary";

export default function NichePersona() {
  const persona = useQuery(api.queries.persona.getPersona);
  const updatePersona = useMutation(api.mutations.profile.updatePersona);

  const selectedNiches = useQuery(
    api.queries.niches.getNichesByIds,
    persona?.nicheIds ? { nicheIds: persona.nicheIds } : "skip",
  );

  const [bio, setBio] = useState("");
  const [regeneratePrompt, setRegeneratePrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Initialize bio with persona data
  useEffect(() => {
    if (persona) {
      setBio(persona.bio || "");
    }
  }, [persona]);

  const handleNicheUpdate = async (nicheIds: Id<"niches">[]) => {
    try {
      await updatePersona({
        nicheIds,
        regeneratePrompt: true,
        locale: navigator.language.split("-")[0] || "en",
      });

      toast.success("Niches updated! AI prompt is being regenerated.");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update niches. Please try again.");
      console.error("Error updating niches:", error);
    }
  };

  const handleSaveBio = async () => {
    if (!persona) return;

    try {
      setIsLoading(true);

      if (bio === persona.bio) {
        toast.info("No changes were made");
        return;
      }

      if (!bio.trim()) {
        toast.error("Bio cannot be empty");
        return;
      }

      const updates: {
        bio: string;
        regeneratePrompt?: boolean;
        locale?: string;
      } = {
        bio,
      };

      if (regeneratePrompt) {
        updates.regeneratePrompt = true;
        updates.locale = navigator.language.split("-")[0] || "en";
      }

      await updatePersona(updates);

      toast.success(
        regeneratePrompt
          ? "Bio updated! AI prompt is being regenerated."
          : "Bio has been updated successfully.",
      );

      setHasChanges(false);
      setRegeneratePrompt(false);
    } catch (error) {
      toast.error("Failed to update bio. Please try again.");
      console.error("Error updating bio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (persona) {
      setBio(persona.bio || "");
      setHasChanges(false);
      setRegeneratePrompt(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Niche & Persona</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your niches and persona settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Selected Niches Display */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Selected Niches</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Your current niche interests
                </p>
              </div>
              <ButtonPrimary
                tone="outline"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
              >
                {/* <Pencil className="h-4 w-4 mr-2" /> */}
                Update
              </ButtonPrimary>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedNiches && selectedNiches.length > 0 ? (
                selectedNiches
                  .filter((niche) => niche !== null)
                  .map((niche) => (
                    <div
                      key={niche._id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {niche.emoji && <span>{niche.emoji}</span>}
                      <span>{niche.label}</span>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No niches selected yet
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="bio">Bio</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Describe yourself and your interests
              </p>
            </div>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Tell us about yourself..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          {/* Regenerate AI Prompt Option */}
          {hasChanges && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="regenerate-persona"
                checked={regeneratePrompt}
                onCheckedChange={(checked) =>
                  setRegeneratePrompt(checked as boolean)
                }
                disabled={isLoading}
              />
              <Label
                htmlFor="regenerate-persona"
                className="text-sm font-normal cursor-pointer"
              >
                Regenerate AI prompt with updated bio
              </Label>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <ButtonPrimary
            tone="outline"
            onClick={handleCancel}
            disabled={isLoading || !hasChanges}
          >
            Cancel
          </ButtonPrimary>
          <ButtonPrimary
            onClick={handleSaveBio}
            disabled={isLoading || !hasChanges}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </ButtonPrimary>
        </div>
      </div>

      {/* Update Niche Dialog */}
      <UpdateNicheDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentNicheIds={persona?.nicheIds || []}
        onSave={handleNicheUpdate}
      />
    </>
  );
}
