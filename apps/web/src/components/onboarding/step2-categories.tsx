"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../../packages/backend/convex/_generated/api";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { BadgePrimary } from "@/components/ui/badge-primary";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Badge } from "../ui/badge";
import { useTranslations } from "@/hooks/use-translations";

interface Step2CategoriesProps {
  onNext: (data: { categories: string[] }) => void;
  onPrevious: () => void;
  initialData?: { categories: string[] };
}

export function Step2Categories({
  onNext,
  onPrevious,
  initialData,
}: Step2CategoriesProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.categories || [],
  );
  const categories = useQuery(api.queries.niches.getCategories);
  const { t } = useTranslations();

  const maxCategories = 2;

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else if (prev.length < maxCategories) {
        return [...prev, category];
      }
      return prev;
    });
  };

  const handleNext = () => {
    if (selectedCategories.length > 0) {
      onNext({ categories: selectedCategories });
    }
  };

  if (!categories) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">
          {t("onboarding.categories.title")}
        </h3>
        <p className="text-muted-foreground text-sm">
          {t("onboarding.categories.description")} {maxCategories}{" "}
          {t("onboarding.categories.maxCategories")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          const isDisabled =
            !isSelected && selectedCategories.length >= maxCategories;

          return (
            <BadgePrimary
              key={category}
              asChild
              tone={isSelected ? "solid" : "outline"}
              className={cn(
                "cursor-pointer select-none px-3 py-2 text-xs transition-all",
                "flex items-center justify-start gap-2 rounded-full",
                isSelected && "shadow-sm",
                isDisabled && !isSelected && "opacity-50 pointer-events-none",
              )}
            >
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                disabled={isDisabled}
                aria-pressed={isSelected}
              >
                {isSelected && <Check className="h-4 w-4" />}
                <span>{category}</span>
              </button>
            </BadgePrimary>
          );
        })}
      </div>

      {selectedCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium">
            {t("onboarding.categories.selected")} ({selectedCategories.length}/
            {maxCategories}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge
                key={category}
                variant={"secondary"}
                className="px-3 py-1 text-xs"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <ButtonPrimary tone="outline" onClick={onPrevious}>
          {t("onboarding.navigation.previous")}
        </ButtonPrimary>

        <ButtonPrimary
          onClick={handleNext}
          disabled={selectedCategories.length === 0}
        >
          {t("onboarding.navigation.next")}
        </ButtonPrimary>
      </div>
    </div>
  );
}
