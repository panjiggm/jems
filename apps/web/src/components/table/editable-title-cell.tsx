"use client";

import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Id } from "@packages/backend/convex/_generated/dataModel";

interface EditableTitleCellProps {
  value: string;
  contentId: Id<"contentRoutines"> | Id<"contentCampaigns">;
  onUpdate: (newTitle: string) => void;
}

export function EditableTitleCell({
  value,
  contentId,
  onUpdate,
}: EditableTitleCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleBlur = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== value) {
      onUpdate(trimmedValue);
    } else if (!trimmedValue) {
      setEditValue(value);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setEditValue(value);
      e.currentTarget.blur();
    }
  };

  const truncateText = (text: string) => {
    if (!text) return "";

    // Truncate by 20 characters
    const truncated = text.slice(0, 20);

    // Add ellipsis if text was truncated
    return truncated.length < text.length ? truncated + "..." : truncated;
  };

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="h-7 text-xs border-0 shadow-none focus-visible:ring-1 focus-visible:ring-ring"
        autoFocus
      />
    );
  }

  return (
    <div
      className="h-7 px-3 py-2 cursor-pointer hover:bg-muted/50 rounded transition-colors flex items-center"
      onClick={() => setIsEditing(true)}
    >
      <span className={cn("text-sm", !value && "text-muted-foreground")}>
        {value ? truncateText(value) : "No title"}
      </span>
    </div>
  );
}
