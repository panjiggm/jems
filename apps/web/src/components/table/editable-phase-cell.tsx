"use client";

import { Target, Play, Eye, Send, CheckCircle } from "lucide-react";
import { Id } from "@packages/backend/convex/_generated/dataModel";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Phase = "plan" | "production" | "review" | "published" | "done";

interface EditablePhaseCellProps {
  value: Phase;
  contentId: Id<"contents">;
  onUpdate: (newPhase: Phase) => void;
}

const phaseConfig = {
  plan: {
    label: "Plan",
    icon: Target,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  production: {
    label: "Production",
    icon: Play,
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  review: {
    label: "Review",
    icon: Eye,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  published: {
    label: "Published",
    icon: Send,
    className: "bg-green-100 text-green-800 border-green-200",
  },
  done: {
    label: "Done",
    icon: CheckCircle,
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
};

export function EditablePhaseCell({
  value,
  contentId,
  onUpdate,
}: EditablePhaseCellProps) {
  const handleChange = (newPhase: Phase) => {
    onUpdate(newPhase);
  };

  const currentConfig = phaseConfig[value];
  const Icon = currentConfig.icon;

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="h-auto border-0 shadow-none focus:ring-1 focus:ring-ring p-2">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-xs text-muted-foreground">
            <Badge
              variant="outline"
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium",
                currentConfig.className,
              )}
            >
              <Icon className="h-3 w-3 shrink-0" />
              {currentConfig.label}
            </Badge>
          </span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(phaseConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <SelectItem key={key} value={key}>
              <Badge
                variant="outline"
                className={cn(
                  "inline-flex items-center gap-2 text-xs font-medium",
                  config.className,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {config.label}
              </Badge>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
