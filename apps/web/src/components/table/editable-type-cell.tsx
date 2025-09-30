"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Id } from "@packages/backend/convex/_generated/dataModel";

interface EditableTypeCellProps {
  value: "campaign" | "series" | "routine";
  contentId: Id<"contents">;
  onUpdate?: (newType: "campaign" | "series" | "routine") => void;
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

export function EditableTypeCell({
  value,
  contentId,
  onUpdate,
}: EditableTypeCellProps) {
  const handleChange = (newType: "campaign" | "series" | "routine") => {
    onUpdate?.(newType);
  };

  const currentConfig = typeOptions.find((option) => option.value === value);

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="h-auto border-0 shadow-none focus:ring-1 focus:ring-ring p-2">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-xs text-muted-foreground">
            <Badge
              variant="outline"
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium",
                currentConfig?.color,
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  currentConfig?.dotColor,
                )}
              />
              {currentConfig?.label}
            </Badge>
          </span>
        </div>
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
