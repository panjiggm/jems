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
import {
  ContentCampaignStatus,
  ContentCampaignType,
  Platform,
} from "@/types/status";
import { useTranslations } from "@/hooks/use-translations";

// Campaign content type
interface CampaignContent {
  _id: Id<"contentCampaigns">;
  userId: string;
  projectId: Id<"projects">;
  title: string;
  slug?: string;
  sow?: string;
  platform: Platform;
  type: ContentCampaignType;
  status: ContentCampaignStatus;
  statusHistory: Array<{
    status: string;
    timestamp: number;
    publishedAt?: string;
    note?: string;
  }>;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

interface KanbanCampaignBoardProps {
  projectId: Id<"projects">;
  userId: string;
  filters: FilterState;
}

export function KanbanCampaignBoard({
  projectId,
  userId,
  filters,
}: KanbanCampaignBoardProps) {
  const { t } = useTranslations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignContent[]>([]);
  const [activeContentOriginalStatus, setActiveContentOriginalStatus] =
    useState<string | null>(null);

  // Campaign status columns
  const campaignColumns = [
    {
      id: "product_obtained",
      title: t("kanban.status.productObtained"),
      color: "bg-blue-200",
    },
    {
      id: "production",
      title: t("kanban.status.production"),
      color: "bg-orange-200",
    },
    {
      id: "published",
      title: t("kanban.status.published"),
      color: "bg-green-200",
    },
    {
      id: "payment",
      title: t("kanban.status.payment"),
      color: "bg-yellow-200",
    },
    { id: "done", title: t("kanban.status.done"), color: "bg-gray-200" },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Fetch campaigns
  const fetchedCampaigns = useQuery(api.queries.contentCampaigns.getByProject, {
    projectId,
    search: filters.search || undefined,
    status: filters.status.length > 0 ? filters.status : undefined,
    types: filters.campaignTypes.length > 0 ? filters.campaignTypes : undefined,
    platform: filters.platform.length > 0 ? filters.platform : undefined,
  });

  const updateCampaignStatus = useMutation(
    api.mutations.contentCampaigns.setStatus,
  );

  useEffect(() => {
    if (fetchedCampaigns) {
      setCampaigns(fetchedCampaigns);
    }
  }, [fetchedCampaigns]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const draggedContent = campaigns.find(
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
        setCampaigns((prev) =>
          prev.map((content) =>
            content._id === activeContentId
              ? {
                  ...content,
                  status: activeContentOriginalStatus as ContentCampaignStatus,
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
    const overColumn = campaignColumns.find((col) => col.id === overId);
    if (overColumn) {
      targetStatus = overColumn.id;
    } else {
      // Check if dropped on another content item
      const overContent = campaigns.find((content) => content._id === overId);
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
      setCampaigns((prev) =>
        prev.map((content) =>
          content._id === activeContentId
            ? { ...content, status: targetStatus as ContentCampaignStatus }
            : content,
        ),
      );

      await updateCampaignStatus({
        id: activeContentId as Id<"contentCampaigns">,
        status: targetStatus as ContentCampaignStatus,
      });
    } catch (error) {
      console.error("Failed to update campaign status:", error);
      // Revert on error
      setCampaigns((prev) =>
        prev.map((content) =>
          content._id === activeContentId
            ? {
                ...content,
                status: activeContentOriginalStatus as ContentCampaignStatus,
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
    const overColumn = campaignColumns.find((col) => col.id === overId);
    if (overColumn) {
      const newStatus = overColumn.id;
      const activeContent = campaigns.find(
        (content) => content._id === activeId,
      );
      if (activeContent && activeContent.status !== newStatus) {
        setCampaigns((prev) =>
          prev.map((content) =>
            content._id === activeId
              ? { ...content, status: newStatus as ContentCampaignStatus }
              : content,
          ),
        );
      }
    }
  };

  const getContentsByStatus = (status: string) => {
    return campaigns.filter((content) => content.status === status);
  };

  const activeContent = activeId
    ? campaigns.find((content) => content._id === activeId)
    : null;

  if (fetchedCampaigns === undefined) {
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
        {campaignColumns.map((column) => (
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
              type={activeContent.type}
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
