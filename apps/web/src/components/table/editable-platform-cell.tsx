"use client";

import { Id } from "@packages/backend/convex/_generated/dataModel";
import Image from "next/image";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
    icon: "/icons/tiktok.svg",
  },
  instagram: {
    label: "Instagram",
    className:
      "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200",
    icon: "/icons/instagram.svg",
  },
  youtube: {
    label: "YouTube",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: "/icons/youtube.svg",
  },
  x: {
    label: "X (Twitter)",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "/icons/x.svg",
  },
  facebook: {
    label: "Facebook",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "/icons/facebook.svg",
  },
  threads: {
    label: "Threads",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "/icons/thread.svg",
  },
  other: {
    label: "Other",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: null,
  },
};

export function EditablePlatformCell({
  value,
  contentId,
  onUpdate,
}: EditablePlatformCellProps) {
  const handleChange = (newPlatform: Platform) => {
    onUpdate(newPlatform);
  };

  const currentConfig = platformConfig[value];

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
              {currentConfig.icon && (
                <Image
                  src={currentConfig.icon}
                  alt={currentConfig.label}
                  width={12}
                  height={12}
                  className="w-3 h-3 shrink-0"
                />
              )}
              {currentConfig.label}
            </Badge>
          </span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(platformConfig).map(([key, config]) => (
          <SelectItem key={key} value={key}>
            <Badge
              variant="outline"
              className={cn(
                "inline-flex items-center gap-2 text-xs font-medium",
                config.className,
              )}
            >
              {config.icon && (
                <Image
                  src={config.icon}
                  alt={config.label}
                  width={14}
                  height={14}
                  className="w-3.5 h-3.5"
                />
              )}
              {config.label}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
