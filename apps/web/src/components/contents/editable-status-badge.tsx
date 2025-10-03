"use client";

import React from "react";
import {
  Wrench,
  Send,
  Package,
  PackageOpen,
  DollarSign,
  X,
  Lightbulb,
  FileText,
  Calendar,
  Archive,
  Target,
  SkipForward,
  Clapperboard,
  CheckCircle,
} from "lucide-react";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_BY_TYPE, STATUS_LABELS, ContentType } from "@/types/status";

type Status =
  | "confirmed"
  | "shipped"
  | "received"
  | "shooting"
  | "drafting"
  | "editing"
  | "done"
  | "pending_payment"
  | "paid"
  | "canceled"
  | "ideation"
  | "scripting"
  | "scheduled"
  | "published"
  | "archived"
  | "planned"
  | "skipped";

interface EditableStatusBadgeProps {
  value: Status;
  contentId: Id<"contents">;
  contentType: ContentType;
}

const statusIcons: Record<string, any> = {
  confirmed: CheckCircle,
  shipped: Package,
  received: PackageOpen,
  shooting: Clapperboard,
  drafting: FileText,
  editing: Wrench,
  done: CheckCircle,
  pending_payment: DollarSign,
  paid: CheckCircle,
  canceled: X,
  ideation: Lightbulb,
  scripting: FileText,
  scheduled: Calendar,
  published: Send,
  archived: Archive,
  planned: Target,
  skipped: SkipForward,
};

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800 border-green-200",
  shipped: "bg-blue-100 text-blue-800 border-blue-200",
  received: "bg-purple-100 text-purple-800 border-purple-200",
  shooting: "bg-orange-100 text-orange-800 border-orange-200",
  drafting: "bg-gray-100 text-gray-800 border-gray-200",
  editing: "bg-blue-100 text-blue-800 border-blue-200",
  done: "bg-green-100 text-green-800 border-green-200",
  pending_payment: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  canceled: "bg-red-100 text-red-800 border-red-200",
  ideation: "bg-yellow-100 text-yellow-800 border-yellow-200",
  scripting: "bg-indigo-100 text-indigo-800 border-indigo-200",
  scheduled: "bg-yellow-100 text-yellow-800 border-yellow-200",
  published: "bg-green-100 text-green-800 border-green-200",
  archived: "bg-gray-100 text-gray-800 border-gray-200",
  planned: "bg-blue-100 text-blue-800 border-blue-200",
  skipped: "bg-gray-100 text-gray-600 border-gray-200",
};

export function EditableStatusBadge({
  value,
  contentId,
  contentType,
}: EditableStatusBadgeProps) {
  const updateContent = useMutation(api.mutations.contents.update);

  const handleChange = async (newStatus: Status) => {
    try {
      await updateContent({
        id: contentId,
        status: newStatus,
      });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // Get available statuses for this content type
  const availableStatuses = STATUS_BY_TYPE[contentType];
  const currentIcon = statusIcons[value];
  const currentColor = statusColors[value];
  const currentLabel = STATUS_LABELS[value];

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="h-auto border-0 shadow-none focus:ring-1 focus:ring-ring p-0">
        <Badge
          variant="outline"
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity",
            currentColor,
          )}
        >
          {React.createElement(currentIcon, {
            className: "h-3 w-3 shrink-0",
          })}
          {currentLabel}
        </Badge>
      </SelectTrigger>
      <SelectContent>
        {availableStatuses.map((status) => {
          const Icon = statusIcons[status];
          const label = STATUS_LABELS[status];
          const color = statusColors[status];
          return (
            <SelectItem key={status} value={status}>
              <Badge
                variant="outline"
                className={cn(
                  "inline-flex items-center gap-2 text-xs font-medium",
                  color,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Badge>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
