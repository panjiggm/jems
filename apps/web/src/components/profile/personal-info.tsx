"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ButtonPrimary } from "../ui/button-primary";

export default function PersonalInfo() {
  const profile = useQuery(api.queries.profile.getProfile);
  const updateProfile = useMutation(api.mutations.profile.updateProfile);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
  });
  const [regeneratePrompt, setRegeneratePrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setIsLoading(true);

      // Check what changed
      const updates: {
        full_name?: string;
        phone?: string;
        avatar_url?: string;
        regeneratePrompt?: boolean;
        locale?: string;
      } = {};

      if (formData.full_name !== profile.full_name) {
        updates.full_name = formData.full_name;
      }
      if (formData.phone !== profile.phone) {
        updates.phone = formData.phone;
      }
      if (formData.avatar_url !== profile.avatar_url) {
        updates.avatar_url = formData.avatar_url;
      }

      // If regeneratePrompt is checked, add it
      if (regeneratePrompt) {
        updates.regeneratePrompt = true;
        updates.locale = navigator.language.split("-")[0] || "en";
      }

      // Only update if there are changes
      if (Object.keys(updates).length === 0) {
        toast.info("No changes were made to your profile.");
        return;
      }

      await updateProfile(updates);

      toast.success(
        regeneratePrompt
          ? "Profile updated! AI prompt is being regenerated."
          : "Profile has been updated successfully.",
      );

      setHasChanges(false);
      setRegeneratePrompt(false);
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        avatar_url: profile.avatar_url || "",
      });
      setHasChanges(false);
      setRegeneratePrompt(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Personal Info</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update your personal information and contact details
        </p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            type="text"
            value={formData.full_name}
            onChange={(e) => handleInputChange("full_name", e.target.value)}
            placeholder="Enter your full name"
            disabled={isLoading}
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+62 812 3456 7890"
            disabled={isLoading}
          />
        </div>

        {/* Avatar URL */}
        <div className="space-y-2">
          <Label htmlFor="avatar_url">Avatar URL</Label>
          <Input
            id="avatar_url"
            type="url"
            value={formData.avatar_url}
            onChange={(e) => handleInputChange("avatar_url", e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Enter a URL for your profile picture
          </p>
        </div>

        {/* Regenerate AI Prompt Option */}
        {formData.full_name !== profile?.full_name && (
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="regenerate"
              checked={regeneratePrompt}
              onCheckedChange={(checked) =>
                setRegeneratePrompt(checked as boolean)
              }
              disabled={isLoading}
            />
            <Label
              htmlFor="regenerate"
              className="text-sm font-normal cursor-pointer"
            >
              Regenerate AI prompt with new name
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
        <ButtonPrimary onClick={handleSave} disabled={isLoading || !hasChanges}>
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
  );
}
