"use client";

import React from "react";
import { Package, Wrench, Send, DollarSign, CheckCircle } from "lucide-react";
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
import {
  ContentCampaignStatus,
  CAMPAIGN_STATUSES,
  STATUS_LABELS,
} from "@/types/status";

interface EditableCampaignStatusBadgeProps {
  value: ContentCampaignStatus;
  campaignId: Id<"contentCampaigns">;
}

const statusIcons: Record<ContentCampaignStatus, any> = {
  product_obtained: Package,
  production: Wrench,
  published: Send,
  payment: DollarSign,
  done: CheckCircle,
};

const statusColors: Record<ContentCampaignStatus, string> = {
  product_obtained: "bg-blue-100 text-blue-800 border-blue-200",
  production: "bg-orange-100 text-orange-800 border-orange-200",
  published: "bg-green-100 text-green-800 border-green-200",
  payment: "bg-yellow-100 text-yellow-800 border-yellow-200",
  done: "bg-gray-100 text-gray-800 border-gray-200",
};

export function EditableCampaignStatusBadge({
  value,
  campaignId,
}: EditableCampaignStatusBadgeProps) {
  const updateStatus = useMutation(api.mutations.contentCampaigns.setStatus);

  const handleChange = async (newStatus: ContentCampaignStatus) => {
    try {
      await updateStatus({
        id: campaignId,
        status: newStatus,
      });
    } catch (error) {
      console.error("Failed to update campaign status:", error);
    }
  };

  const currentIcon = statusIcons[value];
  const currentColor = statusColors[value];
  const currentLabel = STATUS_LABELS[value];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer">
          <Badge
            variant="outline"
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium hover:opacity-80 transition-opacity justify-center",
              currentColor,
            )}
          >
            {React.createElement(currentIcon, {
              className: "h-3 w-3",
            })}
            <span className="leading-none">{currentLabel}</span>
          </Badge>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {CAMPAIGN_STATUSES.map((status) => {
          const Icon = statusIcons[status];
          const label = STATUS_LABELS[status];
          const color = statusColors[status];
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => handleChange(status)}
              className="p-1"
            >
              <Badge
                variant="outline"
                className={cn(
                  "inline-flex items-center gap-2 text-xs font-medium w-full justify-center",
                  color,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Badge>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
