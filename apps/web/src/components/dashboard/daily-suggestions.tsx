"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ButtonPrimary } from "../ui/button-primary";
import { SuggestionCard } from "./suggestion-card";
import { Loader2, LightbulbIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ConvertDialog } from "../content-idea/convert-dialog";
import type { Id } from "@packages/backend/convex/_generated/dataModel";

export function DailySuggestions() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [convertIdeaId, setConvertIdeaId] = useState<Id<"contentIdeas"> | null>(null);
  const [convertType, setConvertType] = useState<"campaign" | "routine" | null>(null);

  const dailySuggestions = useQuery(api.queries.contentIdeas.getDailySuggestions, {
    date: selectedDate,
  });

  const generateSuggestions = useMutation(
    api.mutations.contentIdeas.generateDailySuggestions,
  );
  const dismissIdea = useMutation(api.mutations.contentIdeas.dismissIdea);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateSuggestions({ date: selectedDate });
      if (result.scheduled) {
        toast.success("Generating suggestions... Please refresh in a moment.");
        // Refetch after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else if (result.ideas) {
        toast.success("Suggestions loaded!");
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast.error("Failed to generate suggestions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDismiss = async (ideaId: any) => {
    try {
      await dismissIdea({ ideaId });
      toast.success("Idea dismissed");
    } catch (error) {
      console.error("Error dismissing idea:", error);
      toast.error("Failed to dismiss idea");
    }
  };

  const ideas = dailySuggestions?.ideas || [];
  const hasSuggestions = ideas.length > 0;
  const today = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === today;

  return (
    <Card className="border-2 border-[#f7a641]/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LightbulbIcon className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-[#4a2e1a] dark:text-white">
                Daily Content Suggestions
              </CardTitle>
              <CardDescription>
                {isToday
                  ? "AI-powered ideas for today"
                  : `Suggestions for ${format(new Date(selectedDate), "MMM d, yyyy")}`}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Selector */}
        <div className="space-y-2">
          <Label htmlFor="suggestion-date">Select Date</Label>
          <div className="flex gap-2">
            <Input
              id="suggestion-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={today}
              className="flex-1"
            />
            <ButtonPrimary
              onClick={handleGenerate}
              disabled={isGenerating}
              size="sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </ButtonPrimary>
          </div>
        </div>

        {/* Suggestions List */}
        {dailySuggestions === undefined ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !hasSuggestions ? (
          <div className="text-center py-8 space-y-4">
            <LightbulbIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                No suggestions yet
              </p>
              <p className="text-xs text-muted-foreground">
                Click &quot;Generate&quot; to get AI-powered content ideas
                tailored to your brand
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((idea) => (
              <SuggestionCard
                key={idea._id}
                idea={idea}
                onDismiss={handleDismiss}
                onConvertToCampaign={(ideaId) => {
                  setConvertIdeaId(ideaId);
                  setConvertType("campaign");
                  setConvertDialogOpen(true);
                }}
                onConvertToRoutine={(ideaId) => {
                  setConvertIdeaId(ideaId);
                  setConvertType("routine");
                  setConvertDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </CardContent>

      <ConvertDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        ideaId={convertIdeaId}
        convertType={convertType}
        onSuccess={() => {
          // Suggestions will automatically refresh via Convex query
        }}
      />
    </Card>
  );
}

