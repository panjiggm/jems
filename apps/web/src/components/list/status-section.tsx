"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Id } from "@packages/backend/convex/_generated/dataModel";

interface StatusSectionProps<T> {
  title: string;
  color: string;
  count: number;
  contents: T[];
  projectId: Id<"projects">;
  userId: string;
  contentType: "campaign" | "routine";
  renderContent: (content: T) => React.ReactNode;
}

export function StatusSection<T>({
  title,
  color,
  count,
  contents,
  projectId,
  userId,
  contentType,
  renderContent,
}: StatusSectionProps<T>) {
  const [isExpanded, setIsExpanded] = useState(count > 0);

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-6 rounded-full ${color}`} />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 hover:bg-muted/50 rounded-md p-1 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
              <h4 className="font-semibold text-foreground text-sm">{title}</h4>
              <span className="text-sm text-muted-foreground">({count})</span>
            </button>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {contents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No {contentType} content in this status</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contents.map((content, index) => (
                <div key={index}>{renderContent(content)}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
