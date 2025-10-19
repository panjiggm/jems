"use client";

import { Id } from "@packages/backend/convex/_generated/dataModel";
import Image from "next/image";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { useQueryState } from "nuqs";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface EditablePlatformBadgeProps {
  value: Platform;
  contentId: Id<"contentCampaigns"> | Id<"contentRoutines">;
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

export function EditablePlatformBadge({
  value,
  contentId,
}: EditablePlatformBadgeProps) {
  const [contentType] = useQueryState("contentType", {
    defaultValue: "campaign",
  });

  const updateCampaign = useMutation(api.mutations.contentCampaigns.update);
  const updateRoutine = useMutation(api.mutations.contentRoutines.update);

  const handleChange = async (newPlatform: Platform) => {
    try {
      if ((contentType || "campaign") === "campaign") {
        await updateCampaign({
          id: contentId as Id<"contentCampaigns">,
          patch: {
            platform: newPlatform,
          },
        });
      } else {
        await updateRoutine({
          id: contentId as Id<"contentRoutines">,
          patch: {
            platform: newPlatform,
          },
        });
      }
    } catch (error) {
      console.error("Failed to update platform:", error);
    }
  };

  const currentConfig = platformConfig[value];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer">
          <Badge
            variant="outline"
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium hover:opacity-80 transition-opacity justify-center",
              currentConfig.className,
            )}
          >
            {currentConfig.icon && (
              <Image
                src={currentConfig.icon}
                alt={currentConfig.label}
                width={12}
                height={12}
                className="w-3 h-3"
              />
            )}
            <span className="leading-none">{currentConfig.label}</span>
          </Badge>
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
                  className="w-3.5 h-3.5"
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
