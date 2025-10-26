"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "@/hooks/use-translations";

interface KanbanCardProps {
  id: string;
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
  slug,
  platform,
  status,
  type,
  notes,
}: KanbanCardProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const handleNavigate = () => {
    // Determine content type: campaigns have type field, routines don't
    const contentType = type !== undefined ? "campaign" : "routine";

    // If no slug, fallback to using ID
    const identifier = slug || id;
    router.push(`/${locale}/${contentType}s/${identifier}`);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      // Campaign statuses
      case "product_obtained":
        return "bg-blue-100 text-blue-800";
      case "production":
        return "bg-orange-100 text-orange-800";
      case "payment":
        return "bg-yellow-100 text-yellow-800";
      // Routine statuses
      case "plan":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "scheduled":
        return "bg-purple-100 text-purple-800";
      // Shared
      case "published":
        return "bg-green-100 text-green-800";
      case "done":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      product_obtained: t("kanban.status.productObtained"),
      production: t("kanban.status.production"),
      published: t("kanban.status.published"),
      payment: t("kanban.status.payment"),
      done: t("kanban.status.done"),
      plan: t("kanban.status.plan"),
      in_progress: t("kanban.status.inProgress"),
      scheduled: t("kanban.status.scheduled"),
    };
    return (
      statusMap[status] ||
      status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
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
        onClick={handleNavigate}
      >
        {/* Header with title and status */}
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-semibold text-sm text-foreground line-clamp-2">
            {title}
          </h4>
          <Badge className={cn("text-xs", getStatusColor(status))}>
            {getStatusLabel(status)}
          </Badge>
        </div>

        {/* Notes preview */}
        {notes && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {notes}
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
          {type && (
            <Badge className="text-xs bg-purple-100 text-purple-800">
              {t(`kanban.type.${type}`)}
            </Badge>
          )}
        </div>

        {/* Content type badge */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            {type !== undefined ? t("kanban.campaign") : t("kanban.routine")}
          </Badge>
        </div>
      </div>
    </>
  );
}
