"use client";

import { Table, Kanban, List, Calendar, Monitor } from "lucide-react";
import { useQueryState } from "nuqs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-translations";

export function ViewDisplayDropdown() {
  const [currentView, setCurrentView] = useQueryState("view", {
    defaultValue: "table",
  });
  const { t } = useTranslations();

  const viewOptions = [
    { value: "table", label: t("project.views.table"), icon: Table },
    { value: "kanban", label: t("project.views.kanban"), icon: Kanban },
    { value: "list", label: t("project.views.list"), icon: List },
    { value: "calendar", label: t("project.views.calendar"), icon: Calendar },
  ];

  const currentViewOption = viewOptions.find(
    (opt) => opt.value === currentView,
  );
  const CurrentIcon = currentViewOption?.icon || Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="xs" className="gap-2 text-xs">
          <CurrentIcon className="h-3 w-3" />
          <span className="hidden sm:inline">{t("project.views.display")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuRadioGroup
          value={currentView}
          onValueChange={setCurrentView}
        >
          {viewOptions.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className="cursor-pointer text-xs"
              >
                <Icon className="h-3 w-3 mr-1" />
                {option.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
