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
  status: "draft" | "in_progress" | "scheduled" | "published";
  contents: Content[];
  color: string;
  onAddContent?: (
    status: "draft" | "in_progress" | "scheduled" | "published",
  ) => void;
}

const statusConfig = {
  draft: {
    title: "To-do",
    color: "bg-blue-100 text-blue-800",
    circleColor: "text-blue-500",
  },
  in_progress: {
    title: "On Progress",
    color: "bg-purple-100 text-purple-800",
    circleColor: "text-purple-500",
  },
  scheduled: {
    title: "Scheduled",
    color: "bg-yellow-100 text-yellow-800",
    circleColor: "text-yellow-500",
  },
  published: {
    title: "Completed",
    color: "bg-green-100 text-green-800",
    circleColor: "text-green-500",
  },
};

export function KanbanColumn({
  id,
  title,
  status,
  contents,
  color,
  onAddContent,
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const config = statusConfig[status];
  const contentIds = contents.map((content) => content._id);

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Column Header */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-between mb-4 p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        onClick={() => onAddContent?.(status)}
      >
        <div className="flex items-center gap-2">
          <Circle className={cn("h-4 w-4", config.circleColor)} />
          <span className="font-semibold text-sm text-gray-800">
            {config.title}
          </span>
          <span className={`${config.color} text-xs rounded-full px-2 py-0.5`}>
            {contents.length}
          </span>
        </div>
        <Plus className="h-4 w-4 text-gray-500" />
      </Button>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-[400px] rounded-lg transition-colors",
          isOver ? "bg-blue-50" : "bg-gray-50",
        )}
      >
        <SortableContext
          items={contentIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {contents.map((content) => (
              <KanbanCard
                key={content._id}
                id={content._id}
                title={content.title}
                description={content.notes}
                platform={content.platform}
                status={content.status}
                dueDate={content.dueDate}
                scheduledAt={content.scheduledAt}
                publishedAt={content.publishedAt}
                notes={content.notes}
                assetIds={content.assetIds}
                createdAt={content.createdAt}
                updatedAt={content.updatedAt}
              />
            ))}
          </div>
        </SortableContext>

        {/* Empty state */}
        {contents.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <Circle className="h-8 w-8 mb-2" />
            <p className="text-xs">No {config.title.toLowerCase()} items</p>
          </div>
        )}
      </div>
    </div>
  );
}
