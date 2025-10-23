"use client";

import * as React from "react";
import { Search, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DriveHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onUploadClick: () => void;
  totalFiles: number;
}

export function DriveHeader({
  searchValue,
  onSearchChange,
  onUploadClick,
  totalFiles,
}: DriveHeaderProps) {
  const [localSearch, setLocalSearch] = React.useState(searchValue);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div className="flex-1 w-full sm:max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search content..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-sm text-muted-foreground">
          {totalFiles} {totalFiles === 1 ? "file" : "files"}
        </span>
        <Button onClick={onUploadClick} size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>
    </div>
  );
}
