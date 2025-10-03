"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import {
  Search,
  CheckCircle,
  Package,
  PackageOpen,
  Wrench,
  Send,
  DollarSign,
  X as XIcon,
  Lightbulb,
  FileText,
  Calendar,
  Archive,
  Target,
  SkipForward,
  Clapperboard,
  Play,
  Eye,
  Layers,
  BadgeCheck,
  MonitorSmartphone,
  Filter,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, type ContentType } from "@/types/status";

export type Status =
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

export type Phase = "plan" | "production" | "review" | "published" | "done";

export type Platform =
  | "tiktok"
  | "instagram"
  | "youtube"
  | "x"
  | "facebook"
  | "threads"
  | "other";

export interface FilterState {
  search: string;
  status: Status[];
  phase: Phase[];
  types: ContentType[];
  platform: Platform[];
}

interface SearchFilterContentProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const platformConfig: Record<
  Platform,
  { label: string; className: string; icon: string | null }
> = {
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

const phaseConfig: Record<
  Phase,
  { label: string; className: string; icon: LucideIcon }
> = {
  plan: {
    label: "Plan",
    icon: Target,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  production: {
    label: "Production",
    icon: Play,
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  review: {
    label: "Review",
    icon: Eye,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  published: {
    label: "Published",
    icon: Send,
    className: "bg-green-100 text-green-800 border-green-200",
  },
  done: {
    label: "Done",
    icon: CheckCircle,
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
};

const typeConfig: Record<
  ContentType,
  { label: string; color: string; dotColor: string }
> = {
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

const statusConfig: Record<
  Status,
  { label: string; className: string; icon: LucideIcon }
> = {
  confirmed: {
    label: STATUS_LABELS.confirmed,
    className: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  shipped: {
    label: STATUS_LABELS.shipped,
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Package,
  },
  received: {
    label: STATUS_LABELS.received,
    className: "bg-purple-100 text-purple-800 border-purple-200",
    icon: PackageOpen,
  },
  shooting: {
    label: STATUS_LABELS.shooting,
    className: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Clapperboard,
  },
  drafting: {
    label: STATUS_LABELS.drafting,
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: FileText,
  },
  editing: {
    label: STATUS_LABELS.editing,
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Wrench,
  },
  done: {
    label: STATUS_LABELS.done,
    className: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  pending_payment: {
    label: STATUS_LABELS.pending_payment,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: DollarSign,
  },
  paid: {
    label: STATUS_LABELS.paid,
    className: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  canceled: {
    label: STATUS_LABELS.canceled,
    className: "bg-red-100 text-red-800 border-red-200",
    icon: XIcon,
  },
  ideation: {
    label: STATUS_LABELS.ideation,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Lightbulb,
  },
  scripting: {
    label: STATUS_LABELS.scripting,
    className: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: FileText,
  },
  scheduled: {
    label: STATUS_LABELS.scheduled,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Calendar,
  },
  published: {
    label: STATUS_LABELS.published,
    className: "bg-green-100 text-green-800 border-green-200",
    icon: Send,
  },
  archived: {
    label: STATUS_LABELS.archived,
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Archive,
  },
  planned: {
    label: STATUS_LABELS.planned,
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Target,
  },
  skipped: {
    label: STATUS_LABELS.skipped,
    className: "bg-gray-100 text-gray-600 border-gray-200",
    icon: SkipForward,
  },
};

const statusOrder: Status[] = [
  "confirmed",
  "shipped",
  "received",
  "shooting",
  "drafting",
  "editing",
  "done",
  "pending_payment",
  "paid",
  "canceled",
  "ideation",
  "scripting",
  "scheduled",
  "published",
  "archived",
  "planned",
  "skipped",
];

const phaseOrder: Phase[] = [
  "plan",
  "production",
  "review",
  "published",
  "done",
];
const platformOrder: Platform[] = [
  "tiktok",
  "instagram",
  "youtube",
  "x",
  "facebook",
  "threads",
  "other",
];
const typeOrder: ContentType[] = ["campaign", "series", "routine"];

export default function SearchFilterContent({
  filters,
  onFiltersChange,
}: SearchFilterContentProps) {
  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleValue = <T extends string>(values: T[], value: T) =>
    values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value];

  const handleSearchChange = (value: string) => {
    updateFilter("search", value);
  };

  const handleStatusToggle = (value: Status) => {
    updateFilter("status", toggleValue(filters.status, value));
  };

  const handlePhaseToggle = (value: Phase) => {
    updateFilter("phase", toggleValue(filters.phase, value));
  };

  const handlePlatformToggle = (value: Platform) => {
    updateFilter("platform", toggleValue(filters.platform, value));
  };

  const handleTypeToggle = (value: ContentType) => {
    updateFilter("types", toggleValue(filters.types, value));
  };

  const clearCategory = (key: keyof Omit<FilterState, "search">) => {
    updateFilter(key, [] as never);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      status: [],
      phase: [],
      types: [],
      platform: [],
    });
  };

  const activeFiltersCount =
    (filters.search ? 1 : 0) +
    filters.status.length +
    filters.phase.length +
    filters.types.length +
    filters.platform.length;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Mobile Layout */}
      <div className="flex md:hidden items-center gap-2 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search contents..."
            value={filters.search}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="pl-8 h-8 text-xs py-1"
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-3 shrink-0">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1.5 px-1.5 py-0 text-[10px] h-4"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[40vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 p-4">
              {/* Grid 2x2 for filters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform</label>
                  <FilterSelect
                    label="Platform"
                    icon={MonitorSmartphone}
                    selectedValues={filters.platform}
                    options={platformOrder.map((platform) => {
                      const config = platformConfig[platform];
                      return {
                        value: platform,
                        label: (
                          <>
                            {config.icon && (
                              <Image
                                src={config.icon}
                                alt={config.label}
                                width={16}
                                height={16}
                                className="h-4 w-4"
                              />
                            )}
                            {config.label}
                          </>
                        ),
                      } as const;
                    })}
                    onToggle={handlePlatformToggle}
                    onClear={() => clearCategory("platform")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <FilterSelect
                    label="Status"
                    icon={BadgeCheck}
                    selectedValues={filters.status}
                    options={statusOrder.map((status) => {
                      const config = statusConfig[status];
                      const Icon = config.icon;
                      return {
                        value: status,
                        label: (
                          <Badge
                            variant="outline"
                            className={cn(
                              "flex items-center gap-2 text-xs font-medium",
                              config.className,
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {config.label}
                          </Badge>
                        ),
                      } as const;
                    })}
                    onToggle={handleStatusToggle}
                    onClear={() => clearCategory("status")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phase</label>
                  <FilterSelect
                    label="Phase"
                    icon={Target}
                    selectedValues={filters.phase}
                    options={phaseOrder.map((phase) => {
                      const config = phaseConfig[phase];
                      const Icon = config.icon;
                      return {
                        value: phase,
                        label: (
                          <Badge
                            variant="outline"
                            className={cn(
                              "flex items-center gap-2 text-xs font-medium",
                              config.className,
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {config.label}
                          </Badge>
                        ),
                      } as const;
                    })}
                    onToggle={handlePhaseToggle}
                    onClear={() => clearCategory("phase")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <FilterSelect
                    label="Type"
                    icon={Layers}
                    selectedValues={filters.types}
                    options={typeOrder.map((type) => {
                      const config = typeConfig[type];
                      return {
                        value: type,
                        label: (
                          <Badge
                            variant="outline"
                            className={cn(
                              "flex items-center gap-2 text-xs font-medium",
                              config.color,
                            )}
                          >
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                config.dotColor,
                              )}
                            />
                            {config.label}
                          </Badge>
                        ),
                      } as const;
                    })}
                    onToggle={handleTypeToggle}
                    onClear={() => clearCategory("types")}
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={clearAllFilters}
                disabled={activeFiltersCount === 0}
              >
                Clear all filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search contents..."
            value={filters.search}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="pl-8 h-8 text-xs py-1"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Platform"
            icon={MonitorSmartphone}
            selectedValues={filters.platform}
            options={platformOrder.map((platform) => {
              const config = platformConfig[platform];
              return {
                value: platform,
                label: (
                  <>
                    {config.icon && (
                      <Image
                        src={config.icon}
                        alt={config.label}
                        width={16}
                        height={16}
                        className="h-4 w-4"
                      />
                    )}
                    {config.label}
                  </>
                ),
              } as const;
            })}
            onToggle={handlePlatformToggle}
            onClear={() => clearCategory("platform")}
          />

          <FilterSelect
            label="Status"
            icon={BadgeCheck}
            selectedValues={filters.status}
            options={statusOrder.map((status) => {
              const config = statusConfig[status];
              const Icon = config.icon;
              return {
                value: status,
                label: (
                  <Badge
                    variant="outline"
                    className={cn(
                      "flex items-center gap-2 text-xs font-medium",
                      config.className,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </Badge>
                ),
              } as const;
            })}
            onToggle={handleStatusToggle}
            onClear={() => clearCategory("status")}
          />

          <FilterSelect
            label="Phase"
            icon={Target}
            selectedValues={filters.phase}
            options={phaseOrder.map((phase) => {
              const config = phaseConfig[phase];
              const Icon = config.icon;
              return {
                value: phase,
                label: (
                  <Badge
                    variant="outline"
                    className={cn(
                      "flex items-center gap-2 text-xs font-medium",
                      config.className,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </Badge>
                ),
              } as const;
            })}
            onToggle={handlePhaseToggle}
            onClear={() => clearCategory("phase")}
          />

          <FilterSelect
            label="Type"
            icon={Layers}
            selectedValues={filters.types}
            options={typeOrder.map((type) => {
              const config = typeConfig[type];
              return {
                value: type,
                label: (
                  <Badge
                    variant="outline"
                    className={cn(
                      "flex items-center gap-2 text-xs font-medium",
                      config.color,
                    )}
                  >
                    <span
                      className={cn("h-2 w-2 rounded-full", config.dotColor)}
                    />
                    {config.label}
                  </Badge>
                ),
              } as const;
            })}
            onToggle={handleTypeToggle}
            onClear={() => clearCategory("types")}
          />

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs px-3"
            onClick={clearAllFilters}
            disabled={activeFiltersCount === 0}
          >
            Clear all
          </Button>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {(filters.platform || []).map((platform) => {
            const config = platformConfig[platform];
            return (
              <Badge
                key={platform}
                variant="outline"
                className={cn(
                  "text-xs",
                  "flex items-center gap-1 px-2 py-1",
                  config.className,
                )}
              >
                {config.icon && (
                  <Image
                    src={config.icon}
                    alt={config.label}
                    width={12}
                    height={12}
                    className="h-3.5 w-3.5"
                  />
                )}
                {config.label}
                <button
                  type="button"
                  onClick={() => handlePlatformToggle(platform)}
                  className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}

          {(filters.status || []).map((status) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            return (
              <Badge
                key={status}
                variant="outline"
                className={cn(
                  "text-xs",
                  "flex items-center gap-1 px-2 py-1",
                  config.className,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {config.label}
                <button
                  type="button"
                  onClick={() => handleStatusToggle(status)}
                  className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}

          {(filters.phase || []).map((phase) => {
            const config = phaseConfig[phase];
            const Icon = config.icon;
            return (
              <Badge
                key={phase}
                variant="outline"
                className={cn(
                  "text-xs",
                  "flex items-center gap-1 px-2 py-1",
                  config.className,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {config.label}
                <button
                  type="button"
                  onClick={() => handlePhaseToggle(phase)}
                  className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}

          {(filters.types || []).map((type) => {
            const config = typeConfig[type];
            return (
              <Badge
                key={type}
                variant="outline"
                className={cn(
                  "text-xs",
                  "flex items-center gap-1 px-2 py-1",
                  config.color,
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", config.dotColor)} />
                {config.label}
                <button
                  type="button"
                  onClick={() => handleTypeToggle(type)}
                  className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface FilterSelectProps<T extends string> {
  label: string;
  icon: LucideIcon;
  selectedValues: T[];
  options: { value: T; label: ReactNode }[];
  onToggle: (value: T) => void;
  onClear: () => void;
}

function FilterSelect<T extends string>({
  label,
  icon: Icon,
  selectedValues,
  options,
  onToggle,
  onClear,
}: FilterSelectProps<T>) {
  const [open, setOpen] = useState(false);

  const chips = options.filter((option) =>
    selectedValues.includes(option.value),
  );

  return (
    <div className="flex items-center gap-2">
      <Select open={open} onOpenChange={setOpen}>
        <SelectTrigger className="justify-start gap-1.5 h-8 px-2 py-1">
          <Icon className="h-3 w-3" />
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs text-muted-foreground">
              Select {label.toLowerCase()}{" "}
              {chips.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[9px] font-bold ml-1"
                >
                  {chips.length}
                </Badge>
              )}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent align="start">
          <div>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                onPointerUp={(event) => {
                  event.preventDefault();
                  onToggle(option.value);
                }}
                className={`cursor-pointer text-xs py-1.5 px-2 ${
                  selectedValues.includes(option.value)
                    ? "bg-primary/10"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex flex-row gap-1.5">{option.label}</div>
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
