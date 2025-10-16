"use client";

import { useState, useEffect } from "react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface EditableNotesCellProps {
  value: string;
  contentId: string;
  onUpdate: (newNotes: string) => void;
}

export function EditableNotesCell({
  value,
  contentId,
  onUpdate,
}: EditableNotesCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleBlur = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue !== value) {
      onUpdate(trimmedValue);
    }
    setIsEditing(false);
  };

  const truncateText = (text: string) => {
    if (!text) return "";

    // Split by words
    const words = text.split(/\s+/);

    // Truncate by 5 words
    const wordsTruncated = words.slice(0, 5).join(" ");

    // Truncate by 25 characters
    const charTruncated = text.slice(0, 25);

    // Use whichever is shorter
    const result =
      wordsTruncated.length < charTruncated.length
        ? wordsTruncated
        : charTruncated;

    // Add ellipsis if text was truncated
    return result.length < text.length ? result + "..." : result;
  };

  if (isEditing) {
    return (
      <Textarea
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        className="min-h-20 resize-none border-0 shadow-none focus-visible:ring-1 focus-visible:ring-ring"
        placeholder="Add notes..."
        autoFocus
      />
    );
  }

  return (
    <div
      className="min-h-8 px-3 py-2 cursor-pointer hover:bg-muted/50 rounded transition-colors flex items-center"
      onClick={() => setIsEditing(true)}
    >
      <span className={cn("text-sm", !value && "text-muted-foreground italic")}>
        {value ? truncateText(value) : "No notes"}
      </span>
    </div>
  );
}
