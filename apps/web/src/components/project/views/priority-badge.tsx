import { Badge } from "@/components/ui/badge";

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high";
}

const priorityConfig = {
  low: {
    label: "Low",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-blue-500",
  },
  medium: {
    label: "Medium",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dotColor: "bg-yellow-500",
  },
  high: {
    label: "High",
    color: "bg-red-100 text-red-800 border-red-200",
    dotColor: "bg-red-500",
  },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Badge className={`text-xs px-2 py-1 ${config.color} border`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor} mr-1`} />
      {config.label}
    </Badge>
  );
}
