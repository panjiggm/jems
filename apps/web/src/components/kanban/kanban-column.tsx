"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { KanbanCard } from "./kanban-card";

interface Content {
  _id: string;
  title: string;
  description?: string;
  platform:
    | "tiktok"
    | "instagram"
    | "youtube"
    | "x"
    | "facebook"
    | "threads"
    | "other";
  status: "draft" | "in_progress" | "scheduled" | "published";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  scheduledAt?: string;
  publishedAt?: string;
  notes?: string;
  assetIds?: string[];
  createdAt: number;
  updatedAt: number;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  contents: Content[];
}

export function KanbanColumn({
  id,
  title,
  color,
  contents,
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col w-72 min-w-72 max-w-80">
      {/* Column Header */}
      <button
        className="flex items-center justify-between mb-4 bg-gray-100 hover:bg-gray-200 p-2 rounded-lg w-full transition-colors cursor-pointer"
        onClick={() => {
          // TODO: Add functionality for column header click
          console.log(`Clicked on ${title} column`);
        }}
      >
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", color)} />
          <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
            {contents.length}
          </span>
        </div>
        <div className="h-6 w-6 flex items-center justify-center">
          <Plus className="h-4 w-4 text-gray-500" />
        </div>
      </button>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-[200px] p-3 rounded-lg border-2 border-dashed transition-colors",
          isOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50",
        )}
      >
        <SortableContext
          items={contents.map((content) => content._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {contents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <Circle className="h-8 w-8 mb-2" />
                <p className="text-sm">No content</p>
              </div>
            ) : (
              contents.map((content) => (
                <KanbanCard
                  key={content._id}
                  id={content._id}
                  title={content.title}
                  description={content.description}
                  platform={content.platform}
                  status={content.status}
                  priority={content.priority}
                  dueDate={content.dueDate}
                  scheduledAt={content.scheduledAt}
                  publishedAt={content.publishedAt}
                  notes={content.notes}
                  assetIds={content.assetIds}
                  createdAt={content.createdAt}
                  updatedAt={content.updatedAt}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
