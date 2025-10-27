import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PlatformBadgeProps {
  platform:
    | "tiktok"
    | "instagram"
    | "youtube"
    | "x"
    | "facebook"
    | "threads"
    | "other";
}

const platformConfig = {
  tiktok: {
    label: "TikTok",
    className: "bg-pink-100 text-pink-800 border-pink-200",
    icon: "/icons/tiktok.svg",
  },
  instagram: {
    label: "Instagram",
    className:
      "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200",
    icon: "/icons/instagram.svg",
  },
  youtube: {
    label: "YouTube",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: "/icons/youtube.svg",
  },
  x: {
    label: "X (Twitter)",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "/icons/x.svg",
  },
  facebook: {
    label: "Facebook",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "/icons/facebook.svg",
  },
  threads: {
    label: "Threads",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "/icons/thread.svg",
  },
  other: {
    label: "Other",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: null,
  },
};

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const config = platformConfig[platform];

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2 py-1 text-xs font-medium transition-colors flex items-center gap-1",
        config.className,
      )}
    >
      {config.icon && (
        <Image
          src={config.icon}
          alt={config.label}
          width={12}
          height={12}
          className="w-3 h-3"
        />
      )}
      {/* Show label on desktop, or always show if no icon */}
      <span className={cn(config.icon ? "hidden md:inline" : "")}>
        {config.label}
      </span>
    </Badge>
  );
}
