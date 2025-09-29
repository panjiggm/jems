"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface FilterState {
  search: string;
  status: string[];
  phase: string[];
  priority: string[];
  platform: string[];
}

interface SearchFilterContentProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const statusOptions = [
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "received", label: "Received" },
  { value: "shooting", label: "Shooting" },
  { value: "drafting", label: "Drafting" },
  { value: "editing", label: "Editing" },
  { value: "done", label: "Done" },
  { value: "pending_payment", label: "Pending Payment" },
  { value: "paid", label: "Paid" },
  { value: "canceled", label: "Canceled" },
  { value: "ideation", label: "Ideation" },
  { value: "scripting", label: "Scripting" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
  { value: "planned", label: "Planned" },
  { value: "skipped", label: "Skipped" },
];

const phaseOptions = [
  { value: "plan", label: "Plan" },
  { value: "production", label: "Production" },
  { value: "review", label: "Review" },
  { value: "published", label: "Published" },
  { value: "done", label: "Done" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const platformOptions = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X (Twitter)" },
  { value: "facebook", label: "Facebook" },
  { value: "threads", label: "Threads" },
  { value: "other", label: "Other" },
];

export default function SearchFilterContent({
  filters,
  onFiltersChange,
}: SearchFilterContentProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    const currentStatus = filters.status || [];
    const newStatus = currentStatus.includes(value)
      ? currentStatus.filter((s) => s !== value)
      : [...currentStatus, value];
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handlePhaseChange = (value: string) => {
    const currentPhase = filters.phase || [];
    const newPhase = currentPhase.includes(value)
      ? currentPhase.filter((p) => p !== value)
      : [...currentPhase, value];
    onFiltersChange({ ...filters, phase: newPhase });
  };

  const handlePriorityChange = (value: string) => {
    const currentPriority = filters.priority || [];
    const newPriority = currentPriority.includes(value)
      ? currentPriority.filter((p) => p !== value)
      : [...currentPriority, value];
    onFiltersChange({ ...filters, priority: newPriority });
  };

  const handlePlatformChange = (value: string) => {
    const currentPlatform = filters.platform || [];
    const newPlatform = currentPlatform.includes(value)
      ? currentPlatform.filter((p) => p !== value)
      : [...currentPlatform, value];
    onFiltersChange({ ...filters, platform: newPlatform });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      status: [],
      phase: [],
      priority: [],
      platform: [],
    });
  };

  const getActiveFiltersCount = () => {
    return (
      (filters.search ? 1 : 0) +
      (filters.status?.length || 0) +
      (filters.phase?.length || 0) +
      (filters.priority?.length || 0) +
      (filters.platform?.length || 0)
    );
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="flex items-center gap-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search contents..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Button */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      (filters.status || []).includes(option.value)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleStatusChange(option.value)}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Phase Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Phase</label>
              <div className="flex flex-wrap gap-2">
                {phaseOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      (filters.phase || []).includes(option.value)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handlePhaseChange(option.value)}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      (filters.priority || []).includes(option.value)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handlePriorityChange(option.value)}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Platform Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <div className="flex flex-wrap gap-2">
                {platformOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      (filters.platform || []).includes(option.value)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handlePlatformChange(option.value)}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          {(filters.status || []).map((status) => (
            <Badge key={status} variant="secondary" className="text-xs">
              {statusOptions.find((s) => s.value === status)?.label}
              <button
                onClick={() => handleStatusChange(status)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {(filters.phase || []).map((phase) => (
            <Badge key={phase} variant="secondary" className="text-xs">
              {phaseOptions.find((p) => p.value === phase)?.label}
              <button
                onClick={() => handlePhaseChange(phase)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {(filters.priority || []).map((priority) => (
            <Badge key={priority} variant="secondary" className="text-xs">
              {priorityOptions.find((p) => p.value === priority)?.label}
              <button
                onClick={() => handlePriorityChange(priority)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {(filters.platform || []).map((platform) => (
            <Badge key={platform} variant="secondary" className="text-xs">
              {platformOptions.find((p) => p.value === platform)?.label}
              <button
                onClick={() => handlePlatformChange(platform)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
