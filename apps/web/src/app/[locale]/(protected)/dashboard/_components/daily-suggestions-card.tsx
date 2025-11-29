"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { AnimatePresence, motion } from "motion/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/use-translations";
import Person1 from "public/svg/person-1";

// Background color gradients for each suggestion
const suggestionColors = [
  "from-blue-500/20 via-blue-400/15 to-blue-500/20",
  "from-purple-500/20 via-purple-400/15 to-purple-500/20",
  "from-pink-500/20 via-pink-400/15 to-pink-500/20",
  "from-green-500/20 via-green-400/15 to-green-500/20",
  "from-orange-500/20 via-orange-400/15 to-orange-500/20",
  "from-cyan-500/20 via-cyan-400/15 to-cyan-500/20",
];

type DailySuggestionsCardProps = {
  className?: string;
};

const DailySuggestionsCard = ({ className }: DailySuggestionsCardProps) => {
  const { t } = useTranslations();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch daily suggestions
  const dailySuggestions = useQuery(
    api.queries.contentIdeas.getDailySuggestions,
    {},
  );

  const ideas = dailySuggestions?.ideas ?? [];
  const hasSuggestions = ideas.length > 0;

  // Auto-rotate through suggestions
  useEffect(() => {
    if (!hasSuggestions) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ideas.length);
    }, 4000); // Rotate every 4 seconds

    return () => clearInterval(interval);
  }, [hasSuggestions, ideas.length]);

  // Loading state
  if (dailySuggestions === undefined) {
    return (
      <Card
        className={cn(
          "relative justify-between gap-6 border rounded-lg overflow-hidden h-32",
          className,
        )}
      >
        <CardHeader className="flex flex-col gap-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!hasSuggestions) {
    return (
      <Card
        className={cn(
          "relative justify-between gap-6 border rounded-lg overflow-hidden",
          className,
        )}
      >
        <CardHeader className="flex flex-col gap-3">
          <span className="font-medium">
            {t("dashboard.dailySuggestions.title")}
          </span>
          <Badge className="bg-primary/10 text-primary">
            {t("dashboard.dailySuggestions.noSuggestions")}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">
            {t("dashboard.dailySuggestions.emptyMessage")}
          </span>
        </CardContent>
        <div className="absolute right-0.5 bottom-0 opacity-20">
          <Person1 />
        </div>
      </Card>
    );
  }

  const currentIdea = ideas[currentIndex];
  if (!currentIdea) {
    return null;
  }

  const colorIndex = currentIndex % suggestionColors.length;
  const bgGradient = suggestionColors[colorIndex];

  return (
    <Card
      className={cn(
        "relative justify-between gap-6 border rounded-lg overflow-hidden",
        className,
      )}
    >
      <CardHeader className="flex flex-col gap-3 relative z-10">
        <span className="font-medium">
          {t("dashboard.dailySuggestions.title")}
        </span>
        <Badge className="bg-primary/10 text-primary">
          {ideas.length}{" "}
          {ideas.length === 1
            ? t("dashboard.dailySuggestions.suggestion")
            : t("dashboard.dailySuggestions.suggestions")}
        </Badge>
      </CardHeader>

      {/* Stack container with overflow hidden */}
      <div className="relative h-32 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {/* Current suggestion card */}
          <motion.div
            key={currentIndex}
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.6,
            }}
            className={cn(
              "absolute inset-0 rounded-lg bg-gradient-to-br",
              bgGradient,
              "backdrop-blur-sm",
            )}
          >
            <CardContent className="flex flex-col justify-center h-full p-4">
              <h3 className="text-lg font-semibold line-clamp-1 mb-1">
                {currentIdea.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {currentIdea.description}
              </p>
            </CardContent>
          </motion.div>

          {/* Stack preview - next card visible behind */}
          {ideas.length > 1 && (
            <motion.div
              key={`next-${(currentIndex + 1) % ideas.length}`}
              initial={{ y: 100, opacity: 0.3, scale: 0.9 }}
              animate={{ y: 8, opacity: 0.4, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                duration: 0.5,
              }}
              className={cn(
                "absolute inset-x-0 bottom-0 h-24 rounded-lg bg-gradient-to-br",
                suggestionColors[(currentIndex + 1) % suggestionColors.length],
                "backdrop-blur-sm z-0",
              )}
              style={{ transform: "translateY(8px) scale(0.95)" }}
            />
          )}
        </AnimatePresence>

        {/* Indicator dots */}
        {ideas.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {ideas.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-muted-foreground/30",
                )}
                aria-label={t(
                  "dashboard.dailySuggestions.goToSuggestion",
                ).replace("{index}", String(index + 1))}
              />
            ))}
          </div>
        )}
      </div>

      {/* Decorative SVG */}
      <div className="absolute right-0.5 bottom-0 opacity-10 pointer-events-none">
        <Person1 />
      </div>
    </Card>
  );
};

export default DailySuggestionsCard;
