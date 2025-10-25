"use client";

import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { format, parseISO, isValid } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EditableDateCellProps {
  value?: string;
  contentId: Id<"contentCampaigns"> | Id<"contentRoutines">;
  onUpdate: (newDate?: string) => void;
}

export function EditableDateCell({
  value,
  contentId,
  onUpdate,
}: EditableDateCellProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onUpdate(format(date, "yyyy-MM-dd"));
    } else {
      onUpdate(undefined);
    }
    setOpen(false);
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

  const selectedDate = value ? parseISO(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto w-full justify-start text-left font-normal border-0 shadow-none hover:bg-muted/50 px-2 py-2",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className={cn("text-sm font-medium", getDateColor(value))}>
            {getDateDisplay(value)}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
