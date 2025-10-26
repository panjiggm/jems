"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BadgePrimary } from "@/components/ui/badge-primary";
import { Label } from "@/components/ui/label";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import { ButtonPrimary } from "../ui/button-primary";
import { useTranslations } from "@/hooks/use-translations";

interface UpdateNicheDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentNicheIds: Id<"niches">[];
  onSave: (nicheIds: Id<"niches">[]) => Promise<void>;
}

export function UpdateNicheDialog({
  open,
  onOpenChange,
  currentNicheIds,
  onSave,
}: UpdateNicheDialogProps) {
  const allCategories = useQuery(api.queries.niches.getCategories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedNicheIds, setSelectedNicheIds] = useState<Id<"niches">[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasInitializedCategories = useRef(false);
  const { t } = useTranslations();

  const maxCategories = 2;
  const maxNiches = 4;

  // Query niches based on selected categories
  const nichesByCategories = useQuery(
    api.queries.niches.getNichesByCategories,
    selectedCategories.length > 0 ? { categories: selectedCategories } : "skip",
  );

  const currentNiches = useQuery(
    api.queries.niches.getNichesByIds,
    currentNicheIds.length > 0 ? { nicheIds: currentNicheIds } : "skip",
  );

  // Initialize with current data when dialog opens
  useEffect(() => {
    if (open && currentNiches && !hasInitializedCategories.current) {
      // Get categories from current niches
      const categories = new Set<string>();
      currentNiches.forEach((niche) => {
        if (niche) {
          categories.add(niche.category);
        }
      });
      setSelectedCategories(Array.from(categories));
      setSelectedNicheIds(currentNicheIds);
      hasInitializedCategories.current = true;
    }

    if (!open) {
      hasInitializedCategories.current = false;
    }
  }, [open, currentNiches, currentNicheIds]);

  // Group niches by category
  const nichesByCategory = useMemo(() => {
    if (!nichesByCategories) return {};
    return nichesByCategories.reduce(
      (acc, niche) => {
        if (!acc[niche.category]) {
          acc[niche.category] = [];
        }
        acc[niche.category]!.push(niche);
        return acc;
      },
      {} as Record<string, typeof nichesByCategories>,
    );
  }, [nichesByCategories]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        // Remove category and its niches
        const updatedCategories = prev.filter((c) => c !== category);
        // Remove niches from this category
        setSelectedNicheIds((prevNiches) =>
          prevNiches.filter((id) => {
            const niche = nichesByCategories?.find((n) => n._id === id);
            return niche?.category !== category;
          }),
        );
        return updatedCategories;
      } else if (prev.length < maxCategories) {
        return [...prev, category];
      }
      return prev;
    });
  };

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

  const handleSave = async () => {
    if (selectedNicheIds.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(selectedNicheIds);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedNiches = useMemo(() => {
    if (!nichesByCategories) return [];
    return nichesByCategories.filter((niche) =>
      selectedNicheIds.includes(niche._id),
    );
  }, [nichesByCategories, selectedNicheIds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("profile.updateNicheDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("profile.updateNicheDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Category Selection */}
          <div className="space-y-3">
            <div>
              <Label>{t("profile.updateNicheDialog.categories")}</Label>
              <p className="text-xs text-muted-foreground mt-1">
                {t("profile.updateNicheDialog.categoriesDescription").replace(
                  "{maxCategories}",
                  maxCategories.toString(),
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {allCategories?.map((category) => {
                const isSelected = selectedCategories.includes(category);
                const isDisabled =
                  !isSelected && selectedCategories.length >= maxCategories;

                return (
                  <BadgePrimary
                    key={category}
                    size="sm"
                    asChild
                    tone={isSelected ? "solid" : "outline"}
                    className={cn(
                      "cursor-pointer select-none px-2 py-1.5 text-xs transition-all",
                      "flex items-center justify-start gap-2 rounded-full",
                      isSelected && "shadow-sm",
                      isDisabled &&
                        !isSelected &&
                        "opacity-50 pointer-events-none",
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
          </div>

          {/* Niche Selection */}
          {selectedCategories.length > 0 && (
            <div className="space-y-3">
              <div>
                <Label>{t("profile.updateNicheDialog.niches")}</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("profile.updateNicheDialog.nichesDescription").replace(
                    "{maxNiches}",
                    maxNiches.toString(),
                  )}
                </p>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {Object.entries(nichesByCategory).map(
                  ([category, categoryNiches]) => {
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
                          onClick={() =>
                            setOpenCategory(isOpen ? null : category)
                          }
                          aria-expanded={isOpen}
                          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-semibold text-primary transition hover:bg-primary/10"
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
                                const isSelected = selectedNicheIds.includes(
                                  niche._id,
                                );
                                const isDisabled =
                                  !isSelected &&
                                  selectedNicheIds.length >= maxNiches;

                                return (
                                  <button
                                    key={niche._id}
                                    type="button"
                                    onClick={() => toggleNiche(niche._id)}
                                    disabled={isDisabled}
                                    aria-pressed={isSelected}
                                    className={cn(
                                      "relative flex basis-full flex-col rounded-lg border px-3 py-3 text-left transition",
                                      "sm:basis-[calc(50%-0.5rem)]",
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
                  },
                )}
              </div>

              {/* Selected Niches Display */}
              {selectedNicheIds.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium">
                    {t("profile.updateNicheDialog.selected")
                      .replace("{count}", selectedNicheIds.length.toString())
                      .replace("{max}", maxNiches.toString())}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedNiches.map((niche) => (
                      <div
                        key={niche._id}
                        className="inline-flex items-center gap-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium"
                      >
                        {niche.emoji && <span>{niche.emoji}</span>}
                        <span>{niche.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2">
          <ButtonPrimary
            tone="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t("profile.updateNicheDialog.cancel")}
          </ButtonPrimary>
          <ButtonPrimary
            onClick={handleSave}
            disabled={isLoading || selectedNicheIds.length === 0}
          >
            {isLoading
              ? t("profile.updateNicheDialog.saving")
              : t("profile.updateNicheDialog.saveChanges")}
          </ButtonPrimary>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
