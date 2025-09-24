"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
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

type Platform =
  | "tiktok"
  | "instagram"
  | "youtube"
  | "x"
  | "facebook"
  | "threads"
  | "other";

interface EditablePlatformCellProps {
  value: Platform;
  contentId: Id<"contents">;
  onUpdate: (newPlatform: Platform) => void;
}

const platformConfig = {
  tiktok: {
    label: "TikTok",
    className: "bg-pink-100 text-pink-800 border-pink-200",
  },
  instagram: {
    label: "Instagram",
    className:
      "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200",
  },
  youtube: {
    label: "YouTube",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  x: {
    label: "X (Twitter)",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  facebook: {
    label: "Facebook",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  threads: {
    label: "Threads",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  other: {
    label: "Other",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

export function EditablePlatformCell({
  value,
  contentId,
  onUpdate,
}: EditablePlatformCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(value);

  const handleSave = () => {
    onUpdate(selectedPlatform);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedPlatform(value);
    setIsEditing(false);
  };

  const currentConfig = platformConfig[value];

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Select
          value={selectedPlatform}
          onValueChange={(value: Platform) => setSelectedPlatform(value)}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(platformConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
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
          "px-2 py-1 text-xs font-medium transition-colors",
          currentConfig.className,
        )}
      >
        {currentConfig.label}
      </Badge>
      <ChevronDown className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
