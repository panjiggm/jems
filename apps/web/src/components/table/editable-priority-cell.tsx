"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { cn } from "@/lib/utils";

interface EditablePriorityCellProps {
  value: "low" | "medium" | "high";
  contentId: Id<"contents">;
  onUpdate?: (newPriority: "low" | "medium" | "high") => void;
}

const priorityOptions = [
  {
    value: "low",
    label: "Low",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-blue-500",
  },
  {
    value: "medium",
    label: "Medium",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dotColor: "bg-yellow-500",
  },
  {
    value: "high",
    label: "High",
    color: "bg-red-100 text-red-800 border-red-200",
    dotColor: "bg-red-500",
  },
];

export function EditablePriorityCell({
  value,
  contentId,
  onUpdate,
}: EditablePriorityCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  const updateContent = useMutation(api.mutations.contents.update);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    try {
      setIsLoading(true);
      await updateContent({
        id: contentId,
        patch: { priority: editValue },
      });
      onUpdate?.(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update priority:", error);
      setEditValue(value); // Reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Select
          value={editValue}
          onValueChange={(value: any) => setEditValue(value)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${option.dotColor}`} />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            className="p-1 hover:bg-green-100 rounded"
            title="Save"
            disabled={isLoading}
          >
            <Check className="h-3 w-3 text-green-600" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-red-100 rounded"
            title="Cancel"
            disabled={isLoading}
          >
            <ChevronDown className="h-3 w-3 text-red-600 rotate-45" />
          </button>
        </div>
      </div>
    );
  }

  const currentConfig = priorityOptions.find(
    (option) => option.value === value,
  );

  return (
    <div
      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors group"
      onClick={() => setIsEditing(true)}
    >
      <Badge
        variant="outline"
        className={cn(
          "px-2 py-1 text-xs font-medium transition-colors flex items-center gap-1",
          currentConfig?.color,
        )}
      >
        <div className={`w-2 h-2 rounded-full ${currentConfig?.dotColor}`} />
        {currentConfig?.label}
      </Badge>
      <ChevronDown className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
