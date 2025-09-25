"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";

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

interface KanbanBoardProps {
  projectId: Id<"projects">;
}

const statusColumns = [
  { id: "draft", title: "To Do", color: "bg-gray-300" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-300" },
  { id: "scheduled", title: "Scheduled", color: "bg-yellow-300" },
  { id: "published", title: "Published", color: "bg-green-300" },
];

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [contents, setContents] = useState<Content[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Fetch contents
  const fetchedContents = useQuery(api.queries.contents.getByProject, {
    projectId,
  });

  const updateContentStatus = useMutation(api.mutations.contents.setStatus);

  useEffect(() => {
    if (fetchedContents) {
      setContents(fetchedContents);
    }
  }, [fetchedContents]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the content being dragged
    const activeContent = contents.find((content) => content._id === activeId);
    if (!activeContent) return;

    // Check if dropped on a column
    const overColumn = statusColumns.find((col) => col.id === overId);
    if (overColumn) {
      const newStatus = overColumn.id as Content["status"];
      if (activeContent.status !== newStatus) {
        // Update local state immediately for better UX
        setContents((prev) =>
          prev.map((content) =>
            content._id === activeId
              ? { ...content, status: newStatus }
              : content,
          ),
        );

        // Update in database
        updateContentStatus({
          id: activeId as any,
          status: newStatus,
        }).catch((error) => {
          console.error("Failed to update content status:", error);
          // Revert local state on error
          setContents((prev) =>
            prev.map((content) =>
              content._id === activeId
                ? { ...content, status: activeContent.status }
                : content,
            ),
          );
        });
      }
      return;
    }

    // Check if dropped on another content (reordering within same column)
    const overContent = contents.find((content) => content._id === overId);
    if (overContent && activeContent.status === overContent.status) {
      // For now, we'll just update the status if it's different
      // In a full implementation, you might want to handle reordering
      return;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the content being dragged
    const activeContent = contents.find((content) => content._id === activeId);
    if (!activeContent) return;

    // Check if hovering over a column
    const overColumn = statusColumns.find((col) => col.id === overId);
    if (overColumn) {
      const newStatus = overColumn.id as Content["status"];
      if (activeContent.status !== newStatus) {
        // Update local state for visual feedback
        setContents((prev) =>
          prev.map((content) =>
            content._id === activeId
              ? { ...content, status: newStatus }
              : content,
          ),
        );
      }
    }
  };

  const getContentsByStatus = (status: Content["status"]) => {
    return contents.filter((content) => content.status === status);
  };

  const activeContent = activeId
    ? contents.find((content) => content._id === activeId)
    : null;

  if (fetchedContents === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-2 min-w-0">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        {statusColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            contents={getContentsByStatus(column.id as Content["status"])}
          />
        ))}
        <DragOverlay>
          {activeContent ? (
            <KanbanCard
              id={activeContent._id}
              title={activeContent.title}
              description={activeContent.description}
              platform={activeContent.platform}
              status={activeContent.status}
              priority={activeContent.priority}
              dueDate={activeContent.dueDate}
              scheduledAt={activeContent.scheduledAt}
              publishedAt={activeContent.publishedAt}
              notes={activeContent.notes}
              assetIds={activeContent.assetIds}
              createdAt={activeContent.createdAt}
              updatedAt={activeContent.updatedAt}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
