"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ButtonPrimary } from "../ui/button-primary";
import { useTranslations } from "@/hooks/use-translations";

export default function PersonalInfo() {
  const profile = useQuery(api.queries.profile.getProfile);
  const updateProfile = useMutation(api.mutations.profile.updateProfile);
  const { t } = useTranslations();

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
        toast.info(t("profile.messages.noChanges"));
        return;
      }

      await updateProfile(updates);

      toast.success(
        regeneratePrompt
          ? t("profile.messages.profileUpdated")
          : t("profile.messages.profileUpdatedSuccess"),
      );

      setHasChanges(false);
      setRegeneratePrompt(false);
    } catch (error) {
      toast.error(t("profile.messages.profileUpdateError"));
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
        <h1 className="text-2xl font-bold">
          {t("profile.personalInfo.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("profile.personalInfo.description")}
        </p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="full_name">
            {t("profile.personalInfo.fullName")}
          </Label>
          <Input
            id="full_name"
            type="text"
            value={formData.full_name}
            onChange={(e) => handleInputChange("full_name", e.target.value)}
            placeholder={t("profile.personalInfo.fullNamePlaceholder")}
            disabled={isLoading}
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">{t("profile.personalInfo.phone")}</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder={t("profile.personalInfo.phonePlaceholder")}
            disabled={isLoading}
          />
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
              {t("profile.personalInfo.regeneratePrompt")}
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
          {t("profile.personalInfo.cancel")}
        </ButtonPrimary>
        <ButtonPrimary onClick={handleSave} disabled={isLoading || !hasChanges}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("profile.personalInfo.saving")}
            </>
          ) : (
            t("profile.personalInfo.saveChanges")
          )}
        </ButtonPrimary>
      </div>
    </div>
  );
}
