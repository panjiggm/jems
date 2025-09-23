"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
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
}

const statusConfig = {
  draft: {
    title: "To-do",
    color: "bg-blue-100 text-blue-800",
    circleColor: "bg-blue-500",
  },
  in_progress: {
    title: "On Progress",
    color: "bg-purple-100 text-purple-800",
    circleColor: "bg-purple-500",
  },
  scheduled: {
    title: "Scheduled",
    color: "bg-yellow-100 text-yellow-800",
    circleColor: "bg-yellow-500",
  },
  published: {
    title: "Completed",
    color: "bg-green-100 text-green-800",
    circleColor: "bg-green-500",
  },
};

export function KanbanColumn({
  id,
  title,
  status,
  contents,
  color,
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const config = statusConfig[status];
  const contentIds = contents.map((content) => content._id);

  return (
    <div className="flex flex-col w-80">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Circle className={cn("h-4 w-4", config.circleColor)} />
          <h3 className="font-semibold text-gray-900">
            {config.title} {contents.length}
          </h3>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
          <Plus className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-[400px] p-2 rounded-lg transition-colors",
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
            <p className="text-sm">No {config.title.toLowerCase()} items</p>
          </div>
        )}
      </div>
    </div>
  );
}
