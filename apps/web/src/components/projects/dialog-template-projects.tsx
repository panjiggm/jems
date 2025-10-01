"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Check,
  Sparkles,
  TrendingUp,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { useTemplateDialogStore } from "@/store/use-dialog-template-store";
import { useTranslations } from "@/hooks/use-translations";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ButtonPrimary } from "../ui/button-primary";

export function TemplateProjectsDialog() {
  const params = useParams();
  const locale = params.locale as string;
  const { t } = useTranslations();

  const {
    isOpen,
    isLoading,
    selectedTemplate,
    quarterValue,
    closeDialog,
    setLoading,
    setSelectedTemplate,
    setQuarterValue,
    resetDialog,
  } = useTemplateDialogStore();

  const createMonthly = useMutation(
    api.mutations.templates.createMonthlyTemplate,
  );
  const createQuarterly = useMutation(
    api.mutations.templates.createQuarterlyTemplate,
  );

  const handleCreateTemplate = async () => {
    if (!selectedTemplate) {
      toast.error(t("projects.templates.selectTemplate"));
      return;
    }

    if (selectedTemplate === "quarterly" && !quarterValue) {
      toast.error(t("projects.templates.quarterly.selectQuarter"));
      return;
    }

    setLoading(true);

    try {
      let result;

      if (selectedTemplate === "monthly") {
        result = await createMonthly({ locale });
      } else if (selectedTemplate === "quarterly" && quarterValue) {
        result = await createQuarterly({
          quarter: quarterValue,
          locale,
        });
      }

      if (result?.success) {
        toast.success(t("projects.templates.messages.success"), {
          description: result.message,
        });
        resetDialog();
      }
    } catch (error) {
      console.error("Failed to create template:", error);
      toast.error(t("projects.templates.messages.error"), {
        description: t("projects.templates.messages.errorDescription"),
      });
    } finally {
      setLoading(false);
    }
  };

  const templates = [
    {
      id: "monthly" as const,
      title: t("projects.templates.monthly.title"),
      description: t("projects.templates.monthly.description"),
      icon: Calendar,
      badge: t("projects.templates.monthly.badge"),
      popular: true,
    },
    {
      id: "quarterly" as const,
      title: t("projects.templates.quarterly.title"),
      description: t("projects.templates.quarterly.description"),
      icon: TrendingUp,
      badge: null,
      popular: false,
    },
  ];

  const quarters = [
    { value: 1 as const, label: t("projects.templates.quarterly.q1") },
    { value: 2 as const, label: t("projects.templates.quarterly.q2") },
    { value: 3 as const, label: t("projects.templates.quarterly.q3") },
    { value: 4 as const, label: t("projects.templates.quarterly.q4") },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t("projects.templates.title")}
          </DialogTitle>
          <DialogDescription>
            {t("projects.templates.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Options */}
          <div className="space-y-3">
            {templates.map((template) => {
              const Icon = template.icon;
              const isSelected = selectedTemplate === template.id;

              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={cn(
                    "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary/50",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 bg-white",
                  )}
                >
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute right-3 top-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {template.title}
                        </h3>
                        {template.popular && (
                          <Badge variant="secondary" className="text-xs">
                            {template.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quarter Selection for Quarterly Template */}
          {selectedTemplate === "quarterly" && (
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <label className="text-sm font-medium text-gray-900">
                {t("projects.templates.quarterly.selectQuarter")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {quarters.map((quarter) => {
                  const isSelected = quarterValue === quarter.value;

                  return (
                    <button
                      key={quarter.value}
                      type="button"
                      onClick={() => setQuarterValue(quarter.value)}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-md border-2 px-4 py-2.5 text-sm font-medium transition-all",
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-primary/50",
                      )}
                    >
                      <CalendarDays className="h-4 w-4" />
                      {quarter.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <ButtonPrimary
            tone="outline"
            onClick={closeDialog}
            disabled={isLoading}
          >
            {t("projects.templates.button.cancel")}
          </ButtonPrimary>
          <ButtonPrimary
            onClick={handleCreateTemplate}
            disabled={
              !selectedTemplate ||
              isLoading ||
              (selectedTemplate === "quarterly" && !quarterValue)
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("projects.templates.button.creating")}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t("projects.templates.button.create")}
              </>
            )}
          </ButtonPrimary>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
