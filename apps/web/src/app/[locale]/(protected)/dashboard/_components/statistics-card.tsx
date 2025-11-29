import type { ReactNode } from "react";

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { cn } from "@/lib/utils";

// Format number with K/M abbreviations
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

// Statistics card data type
export type StatisticsCardProps = {
  icon: ReactNode;
  trend?: "up" | "down";
  changePercentage?: string;
  value: string;
  title: string;
  badgeContent: string;
  className?: string;
  iconClassName?: string;
  // New props for social media cards
  status?: "available" | "connected" | "unavailable";
  onConnectClick?: () => void;
};

const StatisticsCard = ({
  icon,
  value,
  title,
  trend,
  changePercentage,
  badgeContent,
  className,
  iconClassName,
  status = "connected",
  onConnectClick,
}: StatisticsCardProps) => {
  const isUnavailable = status === "unavailable";
  const isAvailable = status === "available";
  const isConnected = status === "connected";

  return (
    <Card className={cn("gap-4 border rounded-lg", className)}>
      <CardHeader className="flex items-center justify-between">
        <Avatar className="size-9.5 rounded-md">
          <AvatarFallback
            className={cn(
              "bg-primary/10 text-primary size-9.5 shrink-0 rounded-md [&>svg]:size-4.75 [&>img]:size-4.75",
              iconClassName,
            )}
          >
            {icon}
          </AvatarFallback>
        </Avatar>
        {isConnected && trend && changePercentage && (
          <p className="flex items-center gap-1">
            {changePercentage}{" "}
            {trend === "up" ? (
              <ChevronUpIcon className="size-4" />
            ) : (
              <ChevronDownIcon className="size-4" />
            )}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <p className="flex flex-col gap-1">
          <span className="text-lg font-semibold">{value}</span>
          <span className="text-muted-foreground text-xs">{title}</span>
        </p>
        <div className="flex flex-col gap-2">
          <Badge
            className={cn(
              "bg-primary/10 text-primary text-[11px]",
              isUnavailable && "bg-muted text-muted-foreground text-[11px]",
              isAvailable &&
                "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-[11px]",
            )}
          >
            {badgeContent}
          </Badge>
          {isAvailable && onConnectClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onConnectClick}
              className="w-full"
            >
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsCard;
export { formatNumber };
