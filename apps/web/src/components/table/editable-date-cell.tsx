"use client";

import { useState } from "react";
import { Check, X, Calendar } from "lucide-react";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { format, parseISO, isValid } from "date-fns";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditableDateCellProps {
  value?: string;
  contentId: Id<"contents">;
  onUpdate: (newDate?: string) => void;
}

export function EditableDateCell({
  value,
  contentId,
  onUpdate,
}: EditableDateCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    onUpdate(trimmedValue || undefined);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const getDateDisplay = (dateString?: string) => {
    if (!dateString) return "No date";

    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return dateString;

      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return "Overdue";
      } else if (diffDays === 0) {
        return "Today";
      } else if (diffDays === 1) {
        return "Tomorrow";
      } else if (diffDays <= 7) {
        return `In ${diffDays} days`;
      } else {
        return format(date, "MMM dd, yyyy");
      }
    } catch {
      return dateString;
    }
  };

  const getDateColor = (dateString?: string) => {
    if (!dateString) return "text-muted-foreground";

    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "text-muted-foreground";

      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return "text-red-600"; // Overdue
      } else if (diffDays === 0) {
        return "text-orange-600"; // Today
      } else if (diffDays <= 7) {
        return "text-yellow-600"; // This week
      } else {
        return "text-green-600"; // Future
      }
    } catch {
      return "text-muted-foreground";
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 w-32"
          autoFocus
        />
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            className="h-6 w-6 p-0"
          >
            <Check className="h-3 w-3 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3 text-red-600" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors group"
      onClick={() => setIsEditing(true)}
    >
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <span className={cn("text-sm font-medium", getDateColor(value))}>
        {getDateDisplay(value)}
      </span>
    </div>
  );
}
