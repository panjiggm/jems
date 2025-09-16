"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../../packages/backend/convex/_generated/api";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import type { Id } from "@/../../packages/backend/convex/_generated/dataModel";

interface Step3NichesProps {
  onNext: (data: { nicheIds: Id<"niches">[] }) => void;
  onPrevious: () => void;
  categories: string[];
  initialData?: { nicheIds: Id<"niches">[] };
}

export function Step3Niches({
  onNext,
  onPrevious,
  categories,
  initialData,
}: Step3NichesProps) {
  const [selectedNicheIds, setSelectedNicheIds] = useState<Id<"niches">[]>(
    initialData?.nicheIds || [],
  );
  const niches = useQuery(api.niches.getNichesByCategories, { categories });

  const maxNiches = 6;

  const toggleNiche = (nicheId: Id<"niches">) => {
    setSelectedNicheIds((prev) => {
      if (prev.includes(nicheId)) {
        return prev.filter((id) => id !== nicheId);
      } else if (prev.length < maxNiches) {
        return [...prev, nicheId];
      }
      return prev;
    });
  };

  const handleNext = () => {
    if (selectedNicheIds.length > 0) {
      onNext({ nicheIds: selectedNicheIds });
    }
  };

  if (!niches) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Group niches by category for better display
  const nichesByCategory = niches.reduce(
    (acc, niche) => {
      if (!acc[niche.category]) {
        acc[niche.category] = [];
      }
      acc[niche.category].push(niche);
      return acc;
    },
    {} as Record<string, typeof niches>,
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">
          Select Your Specific Niches 🎭
        </h3>
        <p className="text-muted-foreground text-sm">
          Choose up to {maxNiches} specific areas you want to focus on
        </p>
        <div className="text-xs text-muted-foreground">
          {selectedNicheIds.length}/{maxNiches} selected
        </div>
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto">
        {Object.entries(nichesByCategory).map(([category, categoryNiches]) => (
          <div key={category} className="space-y-3">
            <h4 className="font-medium text-primary border-b border-gray-200 pb-1">
              {category}
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {categoryNiches.map((niche) => {
                const isSelected = selectedNicheIds.includes(niche._id);
                const isDisabled =
                  !isSelected && selectedNicheIds.length >= maxNiches;

                return (
                  <button
                    key={niche._id}
                    onClick={() => toggleNiche(niche._id)}
                    disabled={isDisabled}
                    className={`
                      relative p-3 rounded-lg border transition-all text-left
                      ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : isDisabled
                            ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{niche.label}</h5>
                        {niche.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {niche.description}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0 ml-2">
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedNicheIds.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected Niches:</p>
          <div className="flex flex-wrap gap-2">
            {selectedNicheIds.map((nicheId) => {
              const niche = niches.find((n) => n._id === nicheId);
              return niche ? (
                <Badge
                  key={nicheId}
                  variant="secondary"
                  className="px-2 py-1 text-xs"
                >
                  {niche.label}
                </Badge>
              ) : null;
            })}
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
          disabled={selectedNicheIds.length === 0}
        >
          Next
        </ButtonPrimary>
      </div>
    </div>
  );
}
