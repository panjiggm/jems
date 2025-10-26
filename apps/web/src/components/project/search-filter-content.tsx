"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { useQueryState } from "nuqs";
import {
  Search,
  CheckCircle,
  Package,
  Wrench,
  Send,
  DollarSign,
  X as XIcon,
  Calendar,
  Target,
  Play,
  Tag,
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
import { STATUS_LABELS } from "@/types/status";
import { useTranslations } from "@/hooks/use-translations";

// Campaign statuses (from schema)
export type CampaignStatus =
  | "product_obtained"
  | "production"
  | "published"
  | "payment"
  | "done";

// Routine statuses (from schema)
export type RoutineStatus = "plan" | "in_progress" | "scheduled" | "published";

// Combined for backward compatibility
export type Status = CampaignStatus | RoutineStatus;

// Platform types (from schema)
export type Platform =
  | "tiktok"
  | "instagram"
  | "youtube"
  | "x"
  | "facebook"
  | "threads"
  | "other";

// Campaign types (from schema - only for campaigns)
export type CampaignType = "barter" | "paid";

// Content type (campaign or routine)
export type ContentType = "campaign" | "routine";

export interface FilterState {
  search: string;
  status: Status[];
  campaignTypes: CampaignType[]; // Changed from 'types' to 'campaignTypes'
  platform: Platform[];
}

interface SearchFilterContentProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

// Platform config will be created dynamically with translations

// Campaign type config will be created dynamically with translations

// Status config will be created dynamically with translations

// Status order per content type
const campaignStatusOrder: CampaignStatus[] = [
  "product_obtained",
  "production",
  "published",
  "payment",
  "done",
];

const routineStatusOrder: RoutineStatus[] = [
  "plan",
  "in_progress",
  "scheduled",
  "published",
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

const campaignTypeOrder: CampaignType[] = ["barter", "paid"];

// Dynamic configuration functions with translations
const getPlatformConfig = (t: (key: string) => string) => ({
  tiktok: {
    label: t("project.platforms.tiktok"),
    className: "bg-pink-100 text-pink-800 border-pink-200",
    icon: "/icons/tiktok.svg",
  },
  instagram: {
    label: t("project.platforms.instagram"),
    className:
      "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200",
    icon: "/icons/instagram.svg",
  },
  youtube: {
    label: t("project.platforms.youtube"),
    className: "bg-red-100 text-red-800 border-red-200",
    icon: "/icons/youtube.svg",
  },
  x: {
    label: t("project.platforms.x"),
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "/icons/x.svg",
  },
  facebook: {
    label: t("project.platforms.facebook"),
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "/icons/facebook.svg",
  },
  threads: {
    label: t("project.platforms.threads"),
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "/icons/thread.svg",
  },
  other: {
    label: t("project.platforms.other"),
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: null,
  },
});

const getCampaignTypeConfig = (t: (key: string) => string) => ({
  barter: {
    label: t("project.campaignTypes.barter"),
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: Package,
  },
  paid: {
    label: t("project.campaignTypes.paid"),
    className: "bg-amber-100 text-amber-800 border-amber-200",
    icon: DollarSign,
  },
});

const getCampaignStatusConfig = (t: (key: string) => string) => ({
  product_obtained: {
    label:
      STATUS_LABELS.product_obtained || t("project.status.productObtained"),
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Package,
  },
  production: {
    label: STATUS_LABELS.production || t("project.status.production"),
    className: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Wrench,
  },
  published: {
    label: STATUS_LABELS.published || t("project.status.published"),
    className: "bg-green-100 text-green-800 border-green-200",
    icon: Send,
  },
  payment: {
    label: STATUS_LABELS.payment || t("project.status.payment"),
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: DollarSign,
  },
  done: {
    label: STATUS_LABELS.done || t("project.status.done"),
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: CheckCircle,
  },
});

const getRoutineStatusConfig = (t: (key: string) => string) => ({
  plan: {
    label: STATUS_LABELS.plan || t("project.status.plan"),
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Target,
  },
  in_progress: {
    label: STATUS_LABELS.in_progress || t("project.status.inProgress"),
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Play,
  },
  scheduled: {
    label: STATUS_LABELS.scheduled || t("project.status.scheduled"),
    className: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Calendar,
  },
  published: {
    label: STATUS_LABELS.published || t("project.status.published"),
    className: "bg-green-100 text-green-800 border-green-200",
    icon: Send,
  },
});

export default function SearchFilterContent({
  filters,
  onFiltersChange,
}: SearchFilterContentProps) {
  // Get contentType from URL params
  const [contentType] = useQueryState("contentType", {
    defaultValue: "campaign",
  });
  const { t } = useTranslations();

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

  const handlePlatformToggle = (value: Platform) => {
    updateFilter("platform", toggleValue(filters.platform, value));
  };

  const handleCampaignTypeToggle = (value: CampaignType) => {
    updateFilter("campaignTypes", toggleValue(filters.campaignTypes, value));
  };

  const clearCategory = (key: keyof Omit<FilterState, "search">) => {
    updateFilter(key, [] as never);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      status: [],
      campaignTypes: [],
      platform: [],
    });
  };

  // Get current status config and order based on contentType
  const isCampaign = contentType === "campaign";
  const platformConfig = getPlatformConfig(t);
  const campaignTypeConfig = getCampaignTypeConfig(t);
  const currentStatusConfig = isCampaign
    ? getCampaignStatusConfig(t)
    : getRoutineStatusConfig(t);
  const currentStatusOrder = isCampaign
    ? campaignStatusOrder
    : routineStatusOrder;

  const activeFiltersCount =
    (filters.search ? 1 : 0) +
    filters.status.length +
    (isCampaign ? filters.campaignTypes.length : 0) +
    filters.platform.length;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Mobile Layout */}
      <div className="flex md:hidden items-center gap-2 w-full">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder={t("project.search.placeholder")}
            value={filters.search}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="pl-6 h-7 text-xs py-0.5 placeholder:text-xs"
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="xs" className="px-3 shrink-0">
              <Filter className="h-3 w-3 mr-1" />
              {t("project.search.filters")}
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1.5 px-1.5 py-0 text-[10px] h-3"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[40vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{t("project.search.filters")}</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 p-4">
              {/* Grid 2x2 for filters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("project.search.platform")}
                  </label>
                  <FilterSelect
                    label={t("project.search.platform")}
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
                  <label className="text-sm font-medium">
                    {t("project.search.status")}
                  </label>
                  <FilterSelect
                    label={t("project.search.status")}
                    icon={BadgeCheck}
                    selectedValues={filters.status}
                    options={currentStatusOrder.map((status) => {
                      const config =
                        currentStatusConfig[
                          status as keyof typeof currentStatusConfig
                        ];
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

                {/* Campaign Type Filter - Only show for campaigns */}
                {isCampaign && (
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">
                      {t("project.search.campaignType")}
                    </label>
                    <FilterSelect
                      label={t("project.search.type")}
                      icon={Tag}
                      selectedValues={filters.campaignTypes}
                      options={campaignTypeOrder.map((type) => {
                        const config = campaignTypeConfig[type];
                        const Icon = config.icon;
                        return {
                          value: type,
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
                      onToggle={handleCampaignTypeToggle}
                      onClear={() => clearCategory("campaignTypes")}
                    />
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={clearAllFilters}
                disabled={activeFiltersCount === 0}
              >
                {t("project.search.clearAll")}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder={t("project.search.placeholder")}
            value={filters.search}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="pl-6 h-7 text-xs py-0.5 placeholder:text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label={t("project.search.platform")}
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
            label={t("project.search.status")}
            icon={BadgeCheck}
            selectedValues={filters.status}
            options={currentStatusOrder.map((status) => {
              const config =
                currentStatusConfig[status as keyof typeof currentStatusConfig];
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

          {/* Campaign Type Filter - Only show for campaigns */}
          {isCampaign && (
            <FilterSelect
              label={t("project.search.type")}
              icon={Tag}
              selectedValues={filters.campaignTypes}
              options={campaignTypeOrder.map((type) => {
                const config = campaignTypeConfig[type];
                const Icon = config.icon;
                return {
                  value: type,
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
              onToggle={handleCampaignTypeToggle}
              onClear={() => clearCategory("campaignTypes")}
            />
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs px-3"
            onClick={clearAllFilters}
            disabled={activeFiltersCount === 0}
          >
            {t("project.search.clearAll")}
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
            const config = isCampaign
              ? getCampaignStatusConfig(t)[status as CampaignStatus]
              : getRoutineStatusConfig(t)[status as RoutineStatus];
            if (!config) return null;
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

          {isCampaign &&
            (filters.campaignTypes || []).map((type) => {
              const config = getCampaignTypeConfig(t)[type];
              const Icon = config.icon;
              return (
                <Badge
                  key={type}
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
                    onClick={() => handleCampaignTypeToggle(type)}
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
        <SelectTrigger className="justify-start gap-1.5">
          <Icon className="h-3 w-3" />
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs text-muted-foreground">
              {label.toLowerCase()}{" "}
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
                className={`cursor-pointer text-xs py-1 px-2 ${
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
