"use client";

import React from "react";
import { Target, PlayCircle, Calendar, Send } from "lucide-react";
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
  ContentRoutineStatus,
  ROUTINE_STATUSES,
  STATUS_LABELS,
} from "@/types/status";

interface EditableRoutineStatusBadgeProps {
  value: ContentRoutineStatus;
  routineId: Id<"contentRoutines">;
}

const statusIcons: Record<ContentRoutineStatus, any> = {
  plan: Target,
  in_progress: PlayCircle,
  scheduled: Calendar,
  published: Send,
};

const statusColors: Record<ContentRoutineStatus, string> = {
  plan: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
  scheduled: "bg-purple-100 text-purple-800 border-purple-200",
  published: "bg-green-100 text-green-800 border-green-200",
};

export function EditableRoutineStatusBadge({
  value,
  routineId,
}: EditableRoutineStatusBadgeProps) {
  const updateStatus = useMutation(api.mutations.contentRoutines.setStatus);

  const handleChange = async (newStatus: ContentRoutineStatus) => {
    try {
      await updateStatus({
        id: routineId,
        status: newStatus,
      });
    } catch (error) {
      console.error("Failed to update routine status:", error);
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
        {ROUTINE_STATUSES.map((status) => {
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
