"use client";

import * as React from "react";
import { Search, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { useTranslations } from "@/hooks/use-translations";

interface DriveHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onUploadClick: () => void;
}

export function DriveHeader({
  searchValue,
  onSearchChange,
  onUploadClick,
}: DriveHeaderProps) {
  const { t } = useTranslations();
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
            placeholder={t("drive.header.searchPlaceholder")}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <ButtonPrimary onClick={onUploadClick} className="gap-2" size="sm">
          <Upload className="h-4 w-4" />
          {t("drive.header.upload")}
        </ButtonPrimary>
      </div>
    </div>
  );
}
