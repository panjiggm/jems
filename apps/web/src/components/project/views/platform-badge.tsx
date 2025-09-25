import { Badge } from "@/components/ui/badge";

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
  tiktok: { label: "TikTok", color: "bg-black text-white" },
  instagram: { label: "Instagram", color: "bg-pink-500 text-white" },
  youtube: { label: "YouTube", color: "bg-red-500 text-white" },
  x: { label: "X", color: "bg-black text-white" },
  facebook: { label: "Facebook", color: "bg-blue-600 text-white" },
  threads: { label: "Threads", color: "bg-black text-white" },
  other: { label: "Other", color: "bg-gray-500 text-white" },
};

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const config = platformConfig[platform];

  return (
    <Badge className={`text-xs px-2 py-1 ${config.color}`}>
      {config.label}
    </Badge>
  );
}
