"use client";

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

interface EditableTypeBadgeProps {
  value: "campaign" | "series" | "routine";
  contentId: Id<"contents">;
}

const typeOptions = [
  {
    value: "campaign",
    label: "Campaign",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    dotColor: "bg-purple-500",
  },
  {
    value: "series",
    label: "Series",
    color: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
  },
  {
    value: "routine",
    label: "Routine",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-blue-500",
  },
];

export function EditableTypeBadge({
  value,
  contentId,
}: EditableTypeBadgeProps) {
  const updateContent = useMutation(api.mutations.contents.update);

  const handleChange = async (newType: "campaign" | "series" | "routine") => {
    try {
      await updateContent({
        id: contentId,
        patch: {
          type: newType,
        },
      });
    } catch (error) {
      console.error("Failed to update type:", error);
    }
  };

  const currentConfig = typeOptions.find((option) => option.value === value);

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="h-auto border-0 shadow-none focus:ring-1 focus:ring-ring p-0 w-full">
        <Badge
          variant="outline"
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity w-full justify-center",
            currentConfig?.color,
          )}
        >
          <div
            className={cn("w-2 h-2 rounded-full", currentConfig?.dotColor)}
          />
          <span className="">{currentConfig?.label}</span>
        </Badge>
      </SelectTrigger>
      <SelectContent>
        {typeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <Badge
              variant="outline"
              className={cn(
                "inline-flex items-center gap-2 text-xs font-medium",
                option.color,
              )}
            >
              <div className={cn("w-2 h-2 rounded-full", option.dotColor)} />
              {option.label}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
