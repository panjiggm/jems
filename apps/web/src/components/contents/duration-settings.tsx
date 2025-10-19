"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, Clock } from "lucide-react";
import { DurationInput } from "@/components/ui/duration-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

const campaignTransitions = [
  {
    key: "product_obtained_to_production" as const,
    label: "Product Obtained → Production",
    description: "Time to start production after receiving product",
  },
  {
    key: "production_to_published" as const,
    label: "Production → Published",
    description: "Time to publish after production complete",
  },
  {
    key: "published_to_payment" as const,
    label: "Published → Payment",
    description: "Time to receive payment after publishing",
  },
  {
    key: "payment_to_done" as const,
    label: "Payment → Done",
    description: "Time to complete after payment received",
  },
];

const routineTransitions = [
  {
    key: "plan_to_in_progress" as const,
    label: "Plan → In Progress",
    description: "Time to start working after planning",
  },
  {
    key: "in_progress_to_scheduled" as const,
    label: "In Progress → Scheduled",
    description: "Time to schedule after starting work",
  },
  {
    key: "scheduled_to_published" as const,
    label: "Scheduled → Published",
    description: "Time between scheduling and publishing",
  },
];

export function DurationSettings({
  contentType,
  durations = {},
  onChange,
  disabled = false,
  className,
}: DurationSettingsProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const transitions =
    contentType === "campaign" ? campaignTransitions : routineTransitions;

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
          <span className="text-sm font-medium">Duration Settings</span>
          {hasAnyDuration && !isExpanded && (
            <span className="text-xs text-muted-foreground">(configured)</span>
          )}
        </div>
      </Button>

      {isExpanded && (
        <div className="space-y-3 pl-6 border-l-2 border-muted">
          <p className="text-xs text-muted-foreground">
            Set target duration for each status transition. This is optional.
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
