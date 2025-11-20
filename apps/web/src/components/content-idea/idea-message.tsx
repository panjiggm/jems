"use client";

import { formatDistanceToNow } from "date-fns";
import { Trash2Icon } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useTranslations } from "@/hooks/use-translations";

interface IdeaMessageProps {
  ideaId: Id<"contentIdeas">;
  title: string;
  createdAt: number;
}

export function IdeaMessage({ ideaId, title, createdAt }: IdeaMessageProps) {
  const { t } = useTranslations();
  const formattedTime = formatDistanceToNow(createdAt, { addSuffix: true });
  const deleteIdea = useMutation(api.mutations.contentIdeas.deleteContentIdea);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteIdea({ ideaId });
      toast.success(t("contentIdea.messages.deleteSuccess"));
    } catch (error) {
      console.error("Error deleting content idea:", error);
      toast.error(t("contentIdea.messages.deleteError"));
    }
  };

  return (
    <div className="flex w-full items-end justify-end gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-2 sm:px-4">
      <div className="flex max-w-[80%] flex-col gap-0.5 sm:gap-1">
        <div className="flex items-center gap-1.5 sm:gap-2 group">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-6 w-6 sm:h-7 sm:w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            aria-label={t("contentIdea.deleteButton.ariaLabel")}
          >
            <Trash2Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground hover:text-destructive" />
          </Button>
          <div className="rounded-lg bg-primary px-2.5 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-primary-foreground flex-1">
            {title}
          </div>
        </div>
        <span className="text-[10px] sm:text-xs text-muted-foreground text-right">
          {formattedTime}
        </span>
      </div>
    </div>
  );
}
