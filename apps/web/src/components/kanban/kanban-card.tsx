"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Calendar, Paperclip, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { TypeBadge } from "@/components/list/type-badge";
import Image from "next/image";
import { useState } from "react";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { ContentDetailsDrawer } from "../contents";

interface KanbanCardProps {
  id: Id<"contents">;
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

const platformColors = {
  tiktok: "bg-pink-100 text-pink-800",
  instagram: "bg-purple-100 text-purple-800",
  youtube: "bg-red-100 text-red-800",
  x: "bg-gray-100 text-gray-800",
  facebook: "bg-blue-100 text-blue-800",
  threads: "bg-gray-100 text-gray-800",
  other: "bg-gray-100 text-gray-800",
};

const platformIcons = {
  tiktok: "/icons/tiktok.svg",
  instagram: "/icons/instagram.svg",
  youtube: "/icons/youtube.svg",
  x: "/icons/x.svg",
  facebook: "/icons/facebook.svg",
  threads: "/icons/thread.svg",
  other: null,
};

export function KanbanCard({
  id,
  title,
  description,
  platform,
  type,
  phase,
  dueDate,
  scheduledAt,
  assetIds = [],
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Drawer state
  const [selectedContentId, setSelectedContentId] =
    useState<Id<"contents"> | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenDrawer = (contentId: Id<"contents">) => {
    setSelectedContentId(contentId);
    setDrawerOpen(true);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "plan":
        return "bg-gray-100 text-gray-800";
      case "production":
        return "bg-blue-100 text-blue-800";
      case "review":
        return "bg-yellow-100 text-yellow-800";
      case "published":
        return "bg-green-100 text-green-800";
      case "done":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case "plan":
        return "Plan";
      case "production":
        return "Production";
      case "review":
        return "Review";
      case "published":
        return "Published";
      case "done":
        return "Done";
      default:
        return "Plan";
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          "w-full bg-card rounded-lg border border-border p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing",
          isDragging && "opacity-50 rotate-2 scale-105",
        )}
        onClick={() => handleOpenDrawer(id)}
      >
        {/* Header with title and status */}
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-semibold text-sm text-foreground line-clamp-2">
            {title}
          </h4>
          <Badge className={cn("text-xs", getPhaseColor(phase))}>
            {getPhaseLabel(phase)}
          </Badge>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge
            className={cn(
              "text-xs flex items-center gap-1",
              platformColors[platform],
            )}
          >
            {platformIcons[platform] && (
              <Image
                src={platformIcons[platform]}
                alt={platform}
                width={12}
                height={12}
                className="w-3 h-3"
              />
            )}
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </Badge>
          <TypeBadge type={type} />
        </div>

        {/* Attachments */}
        {assetIds && assetIds.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Paperclip className="h-3 w-3" />
              <span>{assetIds.length} attachments</span>
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {/* Subtasks */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckSquare className="h-3 w-3" />
            <span>0 subtasks</span>
          </div>
          {/* Due date */}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {dueDate
                ? new Date(dueDate).toLocaleDateString()
                : scheduledAt
                  ? new Date(scheduledAt).toLocaleDateString()
                  : "No date"}
            </span>
          </div>
        </div>
      </div>

      <ContentDetailsDrawer
        contentId={selectedContentId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onDeleted={() => {
          // Content is deleted, the query will automatically refetch
          // due to Convex's reactive queries
        }}
      />
    </>
  );
}
