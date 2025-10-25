"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, Clock } from "lucide-react";
import { DurationInput } from "@/components/ui/duration-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/use-translations";

export type ContentType = "campaign" | "routine";

export interface CampaignDurations {
  product_obtained_to_production?: string;
  production_to_published?: string;
  published_to_payment?: string;
  payment_to_done?: string;
}

export interface RoutineDurations {
  plan_to_in_progress?: string;
  in_progress_to_scheduled?: string;
  scheduled_to_published?: string;
}

export type StatusDurations = CampaignDurations | RoutineDurations;

export interface DurationSettingsProps {
  contentType: ContentType;
  durations?: StatusDurations;
  onChange?: (durations: StatusDurations) => void;
  disabled?: boolean;
  className?: string;
}

const getCampaignTransitions = (t: (key: string) => string) => [
  {
    key: "product_obtained_to_production" as const,
    label: t(
      "contents.duration.transitions.campaign.productObtainedToProduction",
    ),
    description: t(
      "contents.duration.transitions.campaign.productObtainedToProductionDesc",
    ),
  },
  {
    key: "production_to_published" as const,
    label: t("contents.duration.transitions.campaign.productionToPublished"),
    description: t(
      "contents.duration.transitions.campaign.productionToPublishedDesc",
    ),
  },
  {
    key: "published_to_payment" as const,
    label: t("contents.duration.transitions.campaign.publishedToPayment"),
    description: t(
      "contents.duration.transitions.campaign.publishedToPaymentDesc",
    ),
  },
  {
    key: "payment_to_done" as const,
    label: t("contents.duration.transitions.campaign.paymentToDone"),
    description: t("contents.duration.transitions.campaign.paymentToDoneDesc"),
  },
];

const getRoutineTransitions = (t: (key: string) => string) => [
  {
    key: "plan_to_in_progress" as const,
    label: t("contents.duration.transitions.routine.planToInProgress"),
    description: t(
      "contents.duration.transitions.routine.planToInProgressDesc",
    ),
  },
  {
    key: "in_progress_to_scheduled" as const,
    label: t("contents.duration.transitions.routine.inProgressToScheduled"),
    description: t(
      "contents.duration.transitions.routine.inProgressToScheduledDesc",
    ),
  },
  {
    key: "scheduled_to_published" as const,
    label: t("contents.duration.transitions.routine.scheduledToPublished"),
    description: t(
      "contents.duration.transitions.routine.scheduledToPublishedDesc",
    ),
  },
];

export function DurationSettings({
  contentType,
  durations = {},
  onChange,
  disabled = false,
  className,
}: DurationSettingsProps) {
  const { t } = useTranslations();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const transitions =
    contentType === "campaign"
      ? getCampaignTransitions(t)
      : getRoutineTransitions(t);

  const handleDurationChange = (key: string, value: string) => {
    const newDurations = {
      ...durations,
      [key]: value || undefined,
    };

    // Remove undefined values to clean up the object
    Object.keys(newDurations).forEach((k) => {
      if (newDurations[k as keyof StatusDurations] === undefined) {
        delete newDurations[k as keyof StatusDurations];
      }
    });

    onChange?.(newDurations);
  };

  const hasAnyDuration = Object.values(durations).some((v) => v);

  return (
    <div className={cn("space-y-3", className)}>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        className="w-full justify-between p-0 h-auto hover:bg-transparent"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {t("contents.duration.title")}
          </span>
          {hasAnyDuration && !isExpanded && (
            <span className="text-xs text-muted-foreground">
              {t("contents.duration.configured")}
            </span>
          )}
        </div>
      </Button>

      {isExpanded && (
        <div className="space-y-3 pl-6 border-l-2 border-muted">
          <p className="text-xs text-muted-foreground">
            {t("contents.duration.description")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {transitions.map((transition) => (
              <div
                key={transition.key}
                className="space-y-1.5 p-3 rounded-md border border-muted"
              >
                <div>
                  <Label
                    htmlFor={transition.key}
                    className="text-xs font-medium"
                  >
                    {transition.label}
                  </Label>
                </div>
                <DurationInput
                  value={
                    durations[transition.key as keyof StatusDurations] || ""
                  }
                  onChange={(value) =>
                    handleDurationChange(transition.key, value)
                  }
                  disabled={disabled}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
