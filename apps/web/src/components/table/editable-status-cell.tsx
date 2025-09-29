"use client";

import React, { useState } from "react";
import {
  Check,
  ChevronDown,
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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

interface EditableStatusCellProps {
  value: Status;
  contentId: Id<"contents">;
  contentType: ContentType;
  onUpdate: (newStatus: Status) => void;
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

export function EditableStatusCell({
  value,
  contentId,
  contentType,
  onUpdate,
}: EditableStatusCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status>(value);

  const handleSave = () => {
    onUpdate(selectedStatus);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedStatus(value);
    setIsEditing(false);
  };

  // Get available statuses for this content type
  const availableStatuses = STATUS_BY_TYPE[contentType];
  const currentIcon = statusIcons[value];
  const currentColor = statusColors[value];
  const currentLabel = STATUS_LABELS[value];

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Select
          value={selectedStatus}
          onValueChange={(value: Status) => setSelectedStatus(value)}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableStatuses.map((status) => {
              const Icon = statusIcons[status];
              const label = STATUS_LABELS[status];
              return (
                <SelectItem key={status} value={status}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {label}
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
          currentColor,
        )}
      >
        {React.createElement(currentIcon, { className: "h-3 w-3" })}
        {currentLabel}
      </Badge>
      <ChevronDown className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
