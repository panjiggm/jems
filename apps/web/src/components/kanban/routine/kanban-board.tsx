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
import { KanbanColumn } from "../kanban-column";
import { KanbanCard } from "../kanban-card";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { FilterState } from "@/app/[locale]/(protected)/projects/[year]/[projectId]/_components/search-filter-content";
import { ContentRoutineStatus, Platform } from "@/types/status";
import { useTranslations } from "@/hooks/use-translations";

// Routine content type
interface RoutineContent {
  _id: Id<"contentRoutines">;
  userId: string;
  projectId: Id<"projects">;
  title: string;
  slug?: string;
  notes?: string;
  platform: Platform;
  status: ContentRoutineStatus;
  statusHistory: Array<{
    status: string;
    timestamp: number;
    scheduledAt?: string;
    publishedAt?: string;
    note?: string;
  }>;
  createdAt: number;
  updatedAt: number;
}

interface KanbanRoutineBoardProps {
  projectId: Id<"projects">;
  userId: string;
  filters: FilterState;
}

export function KanbanRoutineBoard({
  projectId,
  userId,
  filters,
}: KanbanRoutineBoardProps) {
  const { t } = useTranslations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [routines, setRoutines] = useState<RoutineContent[]>([]);
  const [activeContentOriginalStatus, setActiveContentOriginalStatus] =
    useState<string | null>(null);

  // Routine status columns
  const routineColumns = [
    { id: "plan", title: t("kanban.status.plan"), color: "bg-blue-200" },
    {
      id: "in_progress",
      title: t("kanban.status.inProgress"),
      color: "bg-yellow-200",
    },
    {
      id: "scheduled",
      title: t("kanban.status.scheduled"),
      color: "bg-purple-200",
    },
    {
      id: "published",
      title: t("kanban.status.published"),
      color: "bg-green-200",
    },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Fetch routines
  const fetchedRoutines = useQuery(api.queries.contentRoutines.getByProject, {
    projectId,
    search: filters.search || undefined,
    status: filters.status.length > 0 ? filters.status : undefined,
    platform: filters.platform.length > 0 ? filters.platform : undefined,
  });

  const updateRoutineStatus = useMutation(
    api.mutations.contentRoutines.setStatus,
  );

  useEffect(() => {
    if (fetchedRoutines) {
      setRoutines(fetchedRoutines);
    }
  }, [fetchedRoutines]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const draggedContent = routines.find(
      (content) => content._id === (event.active.id as string),
    );
    setActiveContentOriginalStatus(draggedContent?.status ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const activeContentId = active.id as string;
    setActiveId(null);

    if (!over) {
      // Reset to original status if dropped outside
      if (activeContentOriginalStatus) {
        setRoutines((prev) =>
          prev.map((content) =>
            content._id === activeContentId
              ? {
                  ...content,
                  status: activeContentOriginalStatus as ContentRoutineStatus,
                }
              : content,
          ),
        );
      }
      setActiveContentOriginalStatus(null);
      return;
    }

    const overId = over.id as string;
    let targetStatus: string | null = null;

    // Check if dropped on a column
    const overColumn = routineColumns.find((col) => col.id === overId);
    if (overColumn) {
      targetStatus = overColumn.id;
    } else {
      // Check if dropped on another content item
      const overContent = routines.find((content) => content._id === overId);
      if (overContent) {
        targetStatus = overContent.status;
      }
    }

    if (!targetStatus || targetStatus === activeContentOriginalStatus) {
      setActiveContentOriginalStatus(null);
      return;
    }

    // Update status
    try {
      // Optimistic update
      setRoutines((prev) =>
        prev.map((content) =>
          content._id === activeContentId
            ? { ...content, status: targetStatus as ContentRoutineStatus }
            : content,
        ),
      );

      await updateRoutineStatus({
        id: activeContentId as Id<"contentRoutines">,
        status: targetStatus as ContentRoutineStatus,
      });
    } catch (error) {
      console.error("Failed to update routine status:", error);
      // Revert on error
      setRoutines((prev) =>
        prev.map((content) =>
          content._id === activeContentId
            ? {
                ...content,
                status: activeContentOriginalStatus as ContentRoutineStatus,
              }
            : content,
        ),
      );
    }

    setActiveContentOriginalStatus(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if hovering over a column
    const overColumn = routineColumns.find((col) => col.id === overId);
    if (overColumn) {
      const newStatus = overColumn.id;
      const activeContent = routines.find(
        (content) => content._id === activeId,
      );
      if (activeContent && activeContent.status !== newStatus) {
        setRoutines((prev) =>
          prev.map((content) =>
            content._id === activeId
              ? { ...content, status: newStatus as ContentRoutineStatus }
              : content,
          ),
        );
      }
    }
  };

  const getContentsByStatus = (status: string) => {
    return routines.filter((content) => content.status === status);
  };

  const activeContent = activeId
    ? routines.find((content) => content._id === activeId)
    : null;

  if (fetchedRoutines === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">{t("kanban.loading")}</div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-w-0">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        {routineColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            contents={getContentsByStatus(column.id) as any}
          />
        ))}
        <DragOverlay>
          {activeContent ? (
            <KanbanCard
              id={activeContent._id}
              title={activeContent.title}
              slug={activeContent.slug || activeContent._id}
              platform={activeContent.platform}
              status={activeContent.status}
              type={undefined} // Routines don't have type
              notes={activeContent.notes}
              createdAt={activeContent.createdAt}
              updatedAt={activeContent.updatedAt}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
