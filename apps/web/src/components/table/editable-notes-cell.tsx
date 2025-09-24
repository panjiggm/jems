"use client";

import { useState } from "react";
import { Check, X, FileText } from "lucide-react";
import { Id } from "@packages/backend/convex/_generated/dataModel";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditableNotesCellProps {
  value: string;
  contentId: Id<"contents">;
  onUpdate: (newNotes: string) => void;
}

export function EditableNotesCell({
  value,
  contentId,
  onUpdate,
}: EditableNotesCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    onUpdate(trimmedValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-16 resize-none"
          placeholder="Add notes..."
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="h-6 px-2"
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="h-6 px-2">
            <Check className="h-3 w-3 mr-1" />
            Save
          </Button>
        </div>
      </div>
    );
  }

  const displayValue = value || "No notes";
  const hasNotes = value && value.trim().length > 0;

  return (
    <div
      className="flex items-start gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors group min-h-8"
      onClick={() => setIsEditing(true)}
    >
      <FileText
        className={cn(
          "h-4 w-4 mt-0.5 flex-shrink-0",
          hasNotes ? "text-blue-600" : "text-muted-foreground",
        )}
      />
      <span
        className={cn(
          "text-sm flex-1",
          hasNotes ? "text-foreground" : "text-muted-foreground italic",
        )}
      >
        {displayValue}
      </span>
    </div>
  );
}
