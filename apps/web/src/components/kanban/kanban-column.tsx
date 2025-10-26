"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanCard } from "./kanban-card";
import { useTranslations } from "@/hooks/use-translations";

interface Content {
  _id: string;
  title: string;
  slug?: string;
  platform:
    | "tiktok"
    | "instagram"
    | "youtube"
    | "x"
    | "facebook"
    | "threads"
    | "other";
  status: string;
  type?: "barter" | "paid"; // Campaign only
  notes?: string;
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
  const { t } = useTranslations();
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col w-72 min-w-72 flex-shrink-0">
      {/* Column Header */}
      <button
        className="flex items-center justify-between mb-4 bg-muted hover:bg-muted/80 p-2 rounded-lg w-full transition-colors cursor-pointer"
        onClick={() => {
          // TODO: Add functionality for column header click
          console.log(`Clicked on ${title} column`);
        }}
      >
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", color)} />
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
          <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full">
            {contents.length}
          </span>
        </div>
        <div className="h-6 w-6 flex items-center justify-center">
          <Plus className="h-4 w-4 text-muted-foreground" />
        </div>
      </button>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-[200px] p-3 rounded-lg border-2 border-dashed transition-colors",
          isOver
            ? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/20"
            : "border-border bg-muted/30",
        )}
      >
        <SortableContext
          items={contents.map((content) => content._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {contents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Circle className="h-8 w-8 mb-2" />
                <p className="text-sm">{t("kanban.noContent")}</p>
              </div>
            ) : (
              contents.map((content) => (
                <KanbanCard
                  key={content._id}
                  id={content._id}
                  title={content.title}
                  slug={content.slug}
                  platform={content.platform}
                  status={content.status}
                  type={content.type}
                  notes={content.notes}
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
