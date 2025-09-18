"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { useTranslations } from "@/hooks/use-translations";

interface Step1ProfileProps {
  onNext: (data: { full_name: string; phone: string }) => void;
  onPrevious: () => void;
  initialData?: { full_name: string; phone: string };
}

export function Step1Profile({
  onNext,
  onPrevious,
  initialData,
}: Step1ProfileProps) {
  const [fullName, setFullName] = useState(initialData?.full_name || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [errors, setErrors] = useState<{ full_name?: string; phone?: string }>(
    {},
  );
  const { t } = useTranslations();

  const validateForm = () => {
    const newErrors: { full_name?: string; phone?: string } = {};

    if (!fullName.trim()) {
      newErrors.full_name = t("onboarding.profile.fullNameRequired");
    } else if (fullName.trim().length < 2) {
      newErrors.full_name = t("onboarding.profile.fullNameMinLength");
    }

    if (!phone.trim()) {
      newErrors.phone = t("onboarding.profile.phoneRequired");
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(phone.trim())) {
      newErrors.phone = t("onboarding.profile.phoneInvalid");
    } else if (phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = t("onboarding.profile.phoneMinLength");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext({
        full_name: fullName.trim(),
        phone: phone.trim(),
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">
          {t("onboarding.profile.title")}
        </h3>
        <p className="text-muted-foreground text-sm">
          {t("onboarding.profile.description")}
        </p>
      </div>

      <div className="space-y-4">
        {/* Full Name Input */}
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium">
            {t("onboarding.profile.fullName")} *
          </label>
          <Input
            id="fullName"
            type="text"
            placeholder={t("onboarding.profile.fullNamePlaceholder")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onKeyPress={handleKeyPress}
            className={errors.full_name ? "border-red-500" : ""}
          />
          {errors.full_name && (
            <p className="text-red-500 text-xs">{errors.full_name}</p>
          )}
        </div>

        {/* Phone Input */}
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            {t("onboarding.profile.phone")} *
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder={t("onboarding.profile.phonePlaceholder")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyPress={handleKeyPress}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs">{errors.phone}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {t("onboarding.profile.phoneHelp")}
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <ButtonPrimary
          tone="outline"
          onClick={onPrevious}
          className="invisible"
        >
          {t("onboarding.navigation.previous")}
        </ButtonPrimary>

        <ButtonPrimary
          onClick={handleNext}
          disabled={!fullName.trim() || !phone.trim()}
        >
          {t("onboarding.navigation.next")}
        </ButtonPrimary>
      </div>
    </div>
  );
}
