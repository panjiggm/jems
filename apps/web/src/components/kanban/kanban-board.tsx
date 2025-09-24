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
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

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

interface KanbanBoardProps {
  projectId: string;
  userId: string;
}

export function KanbanBoard({ projectId, userId }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [contents, setContents] = useState<Content[]>([]);

  // Fetch contents from Convex
  const contentsData = useQuery(api.queries.contents.getByProject, {
    projectId: projectId as any,
  });

  // Mutation to update content status
  const updateContentStatus = useMutation(api.mutations.contents.setStatus);

  useEffect(() => {
    if (contentsData) {
      setContents(contentsData);
    }
  }, [contentsData]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Group contents by status
  const contentsByStatus = contents.reduce(
    (acc, content) => {
      if (!acc[content.status]) {
        acc[content.status] = [];
      }
      acc[content.status].push(content);
      return acc;
    },
    {} as Record<string, Content[]>,
  );

  const columns = [
    {
      id: "draft",
      title: "To-do",
      status: "draft" as const,
      contents: contentsByStatus.draft || [],
      color: "bg-blue-100",
    },
    {
      id: "in_progress",
      title: "On Progress",
      status: "in_progress" as const,
      contents: contentsByStatus.in_progress || [],
      color: "bg-purple-100",
    },
    {
      id: "scheduled",
      title: "Scheduled",
      status: "scheduled" as const,
      contents: contentsByStatus.scheduled || [],
      color: "bg-yellow-100",
    },
    {
      id: "published",
      title: "Completed",
      status: "published" as const,
      contents: contentsByStatus.published || [],
      color: "bg-green-100",
    },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over logic if needed
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active content
    const activeContent = contents.find((content) => content._id === activeId);
    if (!activeContent) return;

    // Find the target column
    const targetColumn = columns.find((column) => column.id === overId);
    if (!targetColumn) return;

    // If the content is already in the target column, just reorder
    if (activeContent.status === targetColumn.status) {
      const columnContents = contentsByStatus[targetColumn.status] || [];
      const oldIndex = columnContents.findIndex(
        (item) => item._id === activeId,
      );
      const newIndex = columnContents.length - 1; // Move to end for now

      if (oldIndex !== newIndex) {
        const newContents = arrayMove(columnContents, oldIndex, newIndex);
        // Update local state
        setContents((prev) =>
          prev.map((content) => {
            if (content.status === targetColumn.status) {
              const newIndex = newContents.findIndex(
                (item) => item._id === content._id,
              );
              return { ...content, updatedAt: Date.now() };
            }
            return content;
          }),
        );
      }
      return;
    }

    // Move content to different column (status change)
    setContents((prev) =>
      prev.map((content) =>
        content._id === activeId
          ? {
              ...content,
              status: targetColumn.status,
              updatedAt: Date.now(),
            }
          : content,
      ),
    );

    // Call Convex mutation to update the content status
    updateContentStatus({
      id: activeId as any,
      status: targetColumn.status,
    });
  };

  const handleAddContent = (
    status: "draft" | "in_progress" | "scheduled" | "published",
  ) => {
    // TODO: Open create content dialog with pre-selected status
    console.log(`Add content to ${status} column`);
  };

  const activeContent = contents.find((content) => content._id === activeId);

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 min-w-0">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              status={column.status}
              contents={column.contents}
              color={column.color}
              onAddContent={handleAddContent}
            />
          ))}
        </div>

        <DragOverlay>
          {activeContent ? (
            <div className="rotate-3 opacity-90">
              <KanbanCard
                id={activeContent._id}
                title={activeContent.title}
                description={activeContent.notes}
                platform={activeContent.platform}
                status={activeContent.status}
                dueDate={activeContent.dueDate}
                scheduledAt={activeContent.scheduledAt}
                publishedAt={activeContent.publishedAt}
                notes={activeContent.notes}
                assetIds={activeContent.assetIds}
                createdAt={activeContent.createdAt}
                updatedAt={activeContent.updatedAt}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
