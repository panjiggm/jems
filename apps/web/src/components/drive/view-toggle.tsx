"use client";

import * as React from "react";
import { LayoutGrid, List } from "lucide-react";
import { ButtonPrimary } from "../ui/button-primary";

interface ViewToggleProps {
  view: "table" | "grid";
  onViewChange: (view: "table" | "grid") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-border p-1">
      <ButtonPrimary
        tone={view === "grid" ? "solid" : "ghost"}
        size="xs"
        onClick={() => onViewChange("grid")}
      >
        <LayoutGrid className="h-3 w-3" />
        <span className="sr-only">Grid view</span>
      </ButtonPrimary>
      <ButtonPrimary
        tone={view === "table" ? "solid" : "ghost"}
        size="xs"
        onClick={() => onViewChange("table")}
      >
        <List className="h-3 w-3" />
        <span className="sr-only">Table view</span>
      </ButtonPrimary>
    </div>
  );
}
