"use client";

import { Button } from "../ui/button";
import { LightbulbIcon } from "lucide-react";
import { useContentIdeaStore } from "@/store/use-content-idea-store";
import { useTranslations } from "@/hooks/use-translations";

export function ContentIdeaTrigger() {
  const { t } = useTranslations();
  const toggleWidget = useContentIdeaStore((state) => state.toggleWidget);

  return (
    <Button
      variant="ghost"
      size="xs"
      className="gap-2"
      onClick={toggleWidget}
      aria-label={t("contentIdea.trigger.ariaLabel")}
      title={t("contentIdea.trigger.title")}
    >
      <LightbulbIcon className="h-4 w-4" />
    </Button>
  );
}
