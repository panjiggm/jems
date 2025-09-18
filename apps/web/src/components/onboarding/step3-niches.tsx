"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../../packages/backend/convex/_generated/api";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { BadgePrimary } from "@/components/ui/badge-primary";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import type { Id } from "@/../../packages/backend/convex/_generated/dataModel";
import { useTranslations } from "@/hooks/use-translations";

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
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const hasInitializedOpen = useRef(false);
  const niches = useQuery(api.niches.getNichesByCategories, { categories });
  const { t } = useTranslations();

  const maxNiches = 4;

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

  type Niche = NonNullable<typeof niches>[number];

  // Group niches by category for better display
  const nichesByCategory = useMemo(() => {
    if (!niches) {
      return {} as Record<string, Niche[]>;
    }

    return niches.reduce<Record<string, Niche[]>>((acc, niche) => {
      if (!acc[niche.category]) {
        acc[niche.category] = [];
      }
      acc[niche.category]!.push(niche);
      return acc;
    }, {});
  }, [niches]);

  const categoryEntries = useMemo(
    () => Object.entries(nichesByCategory) as [string, Niche[]][],
    [nichesByCategory],
  );
  const firstCategory = categoryEntries[0]?.[0];

  useEffect(() => {
    if (hasInitializedOpen.current) {
      return;
    }

    if (firstCategory) {
      setOpenCategory(firstCategory);
      hasInitializedOpen.current = true;
    }
  }, [firstCategory]);

  useEffect(() => {
    if (!openCategory) {
      return;
    }

    if (!nichesByCategory[openCategory]) {
      const fallbackCategory = categoryEntries[0]?.[0] ?? null;
      setOpenCategory(fallbackCategory);
    }
  }, [openCategory, nichesByCategory, categoryEntries]);

  if (!niches) {
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
          {t("onboarding.niches.title")}
        </h3>
        <p className="text-muted-foreground text-sm">
          {t("onboarding.niches.description")} {maxNiches}{" "}
          {t("onboarding.niches.maxNiches")}
        </p>
      </div>

      <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
        {categoryEntries.map(([category, categoryNiches]) => {
          const isOpen = openCategory === category;

          return (
            <div
              key={category}
              className={cn(
                "rounded-lg border border-border/40 bg-muted/20 transition",
                isOpen && "border-primary/50 bg-primary/5",
              )}
            >
              <button
                type="button"
                onClick={() => setOpenCategory(isOpen ? null : category)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-semibold text-primary transition hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <span>{category}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pt-2">
                  <div className="flex flex-wrap gap-2">
                    {categoryNiches.map((niche) => {
                      const isSelected = selectedNicheIds.includes(niche._id);
                      const isDisabled =
                        !isSelected && selectedNicheIds.length >= maxNiches;

                      return (
                        <button
                          key={niche._id}
                          type="button"
                          onClick={() => toggleNiche(niche._id)}
                          disabled={isDisabled}
                          aria-pressed={isSelected}
                          className={cn(
                            "relative flex basis-full flex-col rounded-lg border px-3 py-3 text-left transition",
                            "sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.5rem)]",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : isDisabled
                                ? "border-border/40 bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                                : "border-border hover:border-primary/40 hover:bg-primary/5",
                          )}
                        >
                          <span className="text-xs font-medium">
                            {niche.emoji}
                          </span>
                          <span className="text-xs font-medium">
                            {niche.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedNicheIds.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium">
            {t("onboarding.niches.selected")} ({selectedNicheIds.length}/
            {maxNiches}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedNicheIds.map((nicheId) => {
              const niche = niches.find((n) => n._id === nicheId);
              if (!niche) {
                return null;
              }

              const displayLabel = `${niche.emoji} ${niche.label}`;

              return (
                <BadgePrimary
                  key={nicheId}
                  tone="outline"
                  size="sm"
                  className="px-3 py-1"
                >
                  {displayLabel}
                </BadgePrimary>
              );
            })}
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
          disabled={selectedNicheIds.length === 0}
        >
          {t("onboarding.navigation.next")}
        </ButtonPrimary>
      </div>
    </div>
  );
}
