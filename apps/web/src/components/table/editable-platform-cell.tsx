"use client";

import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Id } from "@packages/backend/convex/_generated/dataModel";

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
  contentId: Id<"contentRoutines"> | Id<"contentCampaigns">;
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs text-muted-foreground">
              <Badge
                variant="outline"
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium hover:opacity-80 transition-opacity",
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
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {Object.entries(platformConfig).map(([key, config]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => handleChange(key as Platform)}
            className="p-1"
          >
            <Badge
              variant="outline"
              className={cn(
                "inline-flex items-center gap-2 text-xs font-medium w-full justify-center",
                config.className,
              )}
            >
              {config.icon && (
                <Image
                  src={config.icon}
                  alt={config.label}
                  width={14}
                  height={14}
                  className="w-3 h-3"
                />
              )}
              {config.label}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
