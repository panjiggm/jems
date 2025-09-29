"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  Target,
  Play,
  Eye,
  Send,
  CheckCircle,
} from "lucide-react";
import { Id } from "@packages/backend/convex/_generated/dataModel";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase>(value);

  const handleSave = () => {
    onUpdate(selectedPhase);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedPhase(value);
    setIsEditing(false);
  };

  const currentConfig = phaseConfig[value];
  const Icon = currentConfig.icon;

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Select
          value={selectedPhase}
          onValueChange={(value: Phase) => setSelectedPhase(value)}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(phaseConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {config.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            className="p-1 hover:bg-green-100 rounded"
            title="Save"
          >
            <Check className="h-3 w-3 text-green-600" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-red-100 rounded"
            title="Cancel"
          >
            <ChevronDown className="h-3 w-3 text-red-600 rotate-45" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors group"
      onClick={() => setIsEditing(true)}
    >
      <Badge
        variant="outline"
        className={cn(
          "flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors",
          currentConfig.className,
        )}
      >
        <Icon className="h-3 w-3" />
        {currentConfig.label}
      </Badge>
      <ChevronDown className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
