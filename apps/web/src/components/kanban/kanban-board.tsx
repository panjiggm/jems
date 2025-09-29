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
import { FilterState } from "../project/search-filter-content";

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
  status:
    | "confirmed"
    | "shipped"
    | "received"
    | "shooting"
    | "drafting"
    | "editing"
    | "done"
    | "pending_payment"
    | "paid"
    | "canceled"
    | "ideation"
    | "scripting"
    | "scheduled"
    | "published"
    | "archived"
    | "planned"
    | "skipped";
  type: "campaign" | "series" | "routine";
  phase: "plan" | "production" | "review" | "published" | "done";
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
  userId: string;
  filters: FilterState;
}

const phaseColumns = [
  { id: "plan", title: "Plan", color: "bg-gray-300" },
  { id: "production", title: "Production", color: "bg-blue-300" },
  { id: "review", title: "Review", color: "bg-yellow-300" },
  { id: "published", title: "Published", color: "bg-green-300" },
  { id: "done", title: "Done", color: "bg-purple-300" },
];

export function KanbanBoard({ projectId, userId, filters }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [activeContentOriginalPhase, setActiveContentOriginalPhase] = useState<
    Content["phase"] | null
  >(null);

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
    search: filters.search || undefined,
    status: filters.status.length > 0 ? filters.status : undefined,
    priority: filters.priority.length > 0 ? filters.priority : undefined,
    platform: filters.platform.length > 0 ? filters.platform : undefined,
  });

  const updateContentPhase = useMutation(api.mutations.contents.setPhase);

  useEffect(() => {
    if (fetchedContents) {
      setContents(fetchedContents);
    }
  }, [fetchedContents]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const draggedContent = contents.find(
      (content) => content._id === (event.active.id as string),
    );
    setActiveContentOriginalPhase(draggedContent?.phase ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeContentId = active.id as string;
    setActiveId(null);

    if (!over) {
      if (activeContentOriginalPhase) {
        setContents((prev) =>
          prev.map((content) =>
            content._id === activeContentId
              ? { ...content, phase: activeContentOriginalPhase }
              : content,
          ),
        );
      }
      setActiveContentOriginalPhase(null);
      return;
    }

    const overId = over.id as string;

    const activeContent = contents.find(
      (content) => content._id === activeContentId,
    );
    if (!activeContent) {
      setActiveContentOriginalPhase(null);
      return;
    }

    const originalPhase = activeContentOriginalPhase ?? activeContent.phase;

    let targetPhase: Content["phase"] | null = null;

    const overColumn = phaseColumns.find((col) => col.id === overId);
    if (overColumn) {
      targetPhase = overColumn.id as Content["phase"];
    } else {
      const overContent = contents.find((content) => content._id === overId);
      if (overContent) {
        targetPhase = overContent.phase;
      }
    }

    if (!targetPhase) {
      setContents((prev) =>
        prev.map((content) =>
          content._id === activeContentId
            ? { ...content, phase: originalPhase }
            : content,
        ),
      );
      setActiveContentOriginalPhase(null);
      return;
    }

    if (targetPhase !== originalPhase) {
      setContents((prev) =>
        prev.map((content) =>
          content._id === activeContentId
            ? { ...content, phase: targetPhase as Content["phase"] }
            : content,
        ),
      );

      updateContentPhase({
        id: activeContentId as any,
        phase: targetPhase,
      }).catch((error) => {
        console.error("Failed to update content phase:", error);
        setContents((prev) =>
          prev.map((content) =>
            content._id === activeContentId
              ? { ...content, phase: originalPhase }
              : content,
          ),
        );
      });
    } else if (activeContent.phase !== originalPhase) {
      setContents((prev) =>
        prev.map((content) =>
          content._id === activeContentId
            ? { ...content, phase: originalPhase }
            : content,
        ),
      );
    }

    setActiveContentOriginalPhase(null);
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
    const overColumn = phaseColumns.find((col) => col.id === overId);
    if (overColumn) {
      const newPhase = overColumn.id as Content["phase"];
      if (activeContent.phase !== newPhase) {
        // Update local state for visual feedback
        setContents((prev) =>
          prev.map((content) =>
            content._id === activeId
              ? { ...content, phase: newPhase }
              : content,
          ),
        );
      }
    }
  };

  const getContentsByPhase = (phase: Content["phase"]) => {
    return contents.filter((content) => content.phase === phase);
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
    <div className="flex gap-4 overflow-x-auto pb-4 min-w-0">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        {phaseColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            contents={getContentsByPhase(column.id as Content["phase"])}
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
              type={activeContent.type}
              phase={activeContent.phase}
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
