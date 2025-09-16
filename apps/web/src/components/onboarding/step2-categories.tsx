"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../../packages/backend/convex/_generated/api";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

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
  const categories = useQuery(api.niches.getCategories);

  const maxCategories = 3;

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
          Choose Your Interest Categories 🎯
        </h3>
        <p className="text-muted-foreground text-sm">
          Select up to {maxCategories} categories that interest you most
        </p>
        <div className="text-xs text-muted-foreground">
          {selectedCategories.length}/{maxCategories} selected
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          const isDisabled =
            !isSelected && selectedCategories.length >= maxCategories;

          return (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              disabled={isDisabled}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : isDisabled
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{category}</h4>
                  <p className="text-sm text-muted-foreground">
                    Explore opportunities in {category.toLowerCase()}
                  </p>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected Categories:</p>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge key={category} variant="secondary" className="px-3 py-1">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <ButtonPrimary tone="outline" onClick={onPrevious}>
          Previous
        </ButtonPrimary>

        <ButtonPrimary
          onClick={handleNext}
          disabled={selectedCategories.length === 0}
        >
          Next
        </ButtonPrimary>
      </div>
    </div>
  );
}
