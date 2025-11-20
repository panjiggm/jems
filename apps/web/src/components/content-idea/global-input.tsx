"use client";

import { useState, useRef, useEffect } from "react";
import { IdeaMessage } from "./idea-message";
import { useContentIdeaStore } from "@/store/use-content-idea-store";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";
import { LightbulbIcon, XIcon, ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { ButtonPrimary } from "../ui/button-primary";

export function GlobalContentIdeaInput() {
  const { t } = useTranslations();
  const isOpen = useContentIdeaStore((state) => state.isOpen);
  const closeWidget = useContentIdeaStore((state) => state.closeWidget);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const createIdea = useMutation(api.mutations.contentIdeas.createContentIdea);
  const ideas = useQuery(
    api.queries.contentIdeas.listContentIdeas,
    isOpen
      ? {
          source: "manual",
          limit: 20,
        }
      : "skip",
  );

  // Auto-scroll to bottom when new ideas are added
  useEffect(() => {
    if (scrollRef.current && isOpen && ideas?.items) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [ideas?.items?.length, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    const ideaText = input.trim();
    setIsSubmitting(true);
    setInput("");

    try {
      await createIdea({
        title: ideaText,
        description: ideaText, // Backend requires description, so we use same as title
      });
      toast.success(t("contentIdea.messages.createSuccess"));
    } catch (error) {
      console.error("Error creating content idea:", error);
      toast.error(t("contentIdea.messages.createError"));
      setInput(ideaText); // Restore input on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const recentIdeas = ideas?.items || [];

  return (
    <>
      {/* Chat Widget */}
      <div
        className={cn(
          "fixed z-40 transition-all duration-300 ease-in-out",
          "bg-background border-2 rounded-2xl shadow-xl flex flex-col",
          // Position: menggantung di bawah header, dekat dengan trigger button
          "top-[calc(theme(spacing.14)+theme(spacing.2))]",
          "right-3 sm:right-6",
          // Width: responsive
          "w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-md",
          // Height: responsive
          "h-[500px] sm:h-[600px] max-h-[calc(100vh-theme(spacing.14)-theme(spacing.4))]",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        {/* Header */}
        <div className="flex flex-col gap-1 p-2 sm:p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <LightbulbIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-primary" />
              <h3 className="text-sm sm:text-lg font-semibold">
                {t("contentIdea.title")}
              </h3>
            </div>
            <button
              onClick={closeWidget}
              className="rounded-full p-1 sm:p-1.5 hover:bg-muted transition-colors"
              aria-label={t("contentIdea.closeButton.ariaLabel")}
            >
              <XIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </button>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {t("contentIdea.description")}
          </p>
        </div>

        {/* Messages Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain min-h-0"
        >
          {recentIdeas.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4 sm:p-8">
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                {t("contentIdea.emptyState")}
              </p>
            </div>
          ) : (
            <div className="py-1 sm:py-2">
              {recentIdeas.map((idea) => (
                <IdeaMessage
                  key={idea._id}
                  ideaId={idea._id}
                  title={idea.title}
                  createdAt={idea.createdAt}
                />
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-2 sm:p-4 bg-background rounded-b-2xl">
          <form onSubmit={handleSubmit} className="flex gap-1.5 sm:gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("contentIdea.input.placeholder")}
              disabled={isSubmitting}
              className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
            />
            <ButtonPrimary
              type="submit"
              disabled={!input.trim() || isSubmitting}
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              {isSubmitting ? (
                <Loader2Icon className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <ArrowUpIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </ButtonPrimary>
          </form>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={closeWidget}
          aria-hidden="true"
        />
      )}
    </>
  );
}
