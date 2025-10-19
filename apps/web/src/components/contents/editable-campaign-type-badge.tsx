"use client";

import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ContentCampaignType } from "@/types/status";

interface EditableCampaignTypeBadgeProps {
  value: ContentCampaignType;
  campaignId: Id<"contentCampaigns">;
}

const typeOptions: Array<{
  value: ContentCampaignType;
  label: string;
  color: string;
  dotColor: string;
}> = [
  {
    value: "barter",
    label: "Barter",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    dotColor: "bg-purple-500",
  },
  {
    value: "paid",
    label: "Paid",
    color: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
  },
];

export function EditableCampaignTypeBadge({
  value,
  campaignId,
}: EditableCampaignTypeBadgeProps) {
  const updateCampaign = useMutation(api.mutations.contentCampaigns.update);

  const handleChange = async (newType: ContentCampaignType) => {
    try {
      await updateCampaign({
        id: campaignId,
        patch: {
          type: newType,
        },
      });
    } catch (error) {
      console.error("Failed to update campaign type:", error);
    }
  };

  const currentConfig = typeOptions.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer">
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 text-xs font-medium hover:opacity-80 transition-opacity justify-center",
              currentConfig?.color,
            )}
          >
            <div
              className={cn("w-2 h-2 rounded-full", currentConfig?.dotColor)}
            />
            <span className="">{currentConfig?.label}</span>
          </Badge>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {typeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleChange(option.value)}
            className="p-1"
          >
            <Badge
              variant="outline"
              className={cn(
                "inline-flex items-center gap-2 text-xs font-medium w-full justify-center",
                option.color,
              )}
            >
              <div className={cn("w-2 h-2 rounded-full", option.dotColor)} />
              {option.label}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
