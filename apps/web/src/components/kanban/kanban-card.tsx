"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Calendar, Paperclip, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/components/project/views/priority-badge";

interface KanbanCardProps {
  id: string;
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

const platformColors = {
  tiktok: "bg-pink-100 text-pink-800",
  instagram: "bg-purple-100 text-purple-800",
  youtube: "bg-red-100 text-red-800",
  x: "bg-black text-white",
  facebook: "bg-blue-100 text-blue-800",
  threads: "bg-gray-100 text-gray-800",
  other: "bg-gray-100 text-gray-800",
};

export function KanbanCard({
  id,
  title,
  description,
  platform,
  status,
  priority,
  dueDate,
  scheduledAt,
  publishedAt,
  notes,
  assetIds = [],
  createdAt,
  updatedAt,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getStatusColor = () => {
    if (status === "published") return "bg-green-100 text-green-800";
    if (status === "scheduled") return "bg-yellow-100 text-yellow-800";
    if (status === "in_progress") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = () => {
    if (status === "published") return "Published";
    if (status === "scheduled") return "Scheduled";
    if (status === "in_progress") return "In Progress";
    return "Draft";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "w-full bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 rotate-2 scale-105",
      )}
    >
      {/* Header with title and status */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
          {title}
        </h4>
        <Badge className={cn("text-xs", getStatusColor())}>
          {getStatusLabel()}
        </Badge>
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{description}</p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        <Badge className={cn("text-xs", platformColors[platform])}>
          {platform.charAt(0).toUpperCase() + platform.slice(1)}
        </Badge>
        <PriorityBadge priority={priority} />
        {notes && (
          <Badge variant="secondary" className="text-xs">
            Notes
          </Badge>
        )}
      </div>

      {/* Attachments */}
      {assetIds && assetIds.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Paperclip className="h-3 w-3" />
            <span>{assetIds.length} attachments</span>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        {/* Subtasks */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
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
  );
}
