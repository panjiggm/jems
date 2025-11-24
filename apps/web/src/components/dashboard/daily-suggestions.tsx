"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Lightbulb, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Id } from "@packages/backend/convex/_generated/dataModel";

interface Suggestion {
  _id: Id<"contentIdeas">;
  title: string;
  description: string;
  platform?: string | null; // Changed to allow null based on schema usage
}

export function DailySuggestions({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-8"
    >
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-1">
        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm" />
        <Card className="relative border-0 bg-transparent shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  Daily AI Suggestions
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fresh ideas curated for your audience today
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3 pt-4">
            {suggestions.slice(0, 3).map((idea, i) => {
              if (!idea || !idea._id) return null;
              return (
                <motion.div
                  key={idea._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="group relative overflow-hidden rounded-lg border bg-background/50 p-4 hover:bg-background hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h3 className="font-medium leading-none group-hover:text-primary transition-colors">
                        {idea.title || ""}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {idea.description || ""}
                      </p>
                      {idea.platform && (
                        <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium capitalize mt-2">
                          {idea.platform}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
