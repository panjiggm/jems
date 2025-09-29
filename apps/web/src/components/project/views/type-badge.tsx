import { Badge } from "@/components/ui/badge";

interface TypeBadgeProps {
  type: "campaign" | "series" | "routine";
}

const typeConfig = {
  campaign: {
    label: "Campaign",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    dotColor: "bg-purple-500",
  },
  series: {
    label: "Series",
    color: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
  },
  routine: {
    label: "Routine",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-blue-500",
  },
};

export function TypeBadge({ type }: TypeBadgeProps) {
  const config = typeConfig[type];

  return (
    <Badge className={`text-xs px-2 py-1 ${config.color} border`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor} mr-1`} />
      {config.label}
    </Badge>
  );
}
