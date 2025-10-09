"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Label } from "@/components/ui/label";
import { Sparkles, Info } from "lucide-react";

export default function AISystem() {
  const persona = useQuery(api.queries.persona.getPersona);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI System
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View your AI assistant&apos;s system prompt
        </p>
      </div>

      <div className="space-y-4">
        {/* Info Box */}
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-2">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Auto-Generated Prompt</h3>
              <p className="text-sm text-muted-foreground">
                This AI system prompt is automatically generated based on your{" "}
                <strong>bio</strong> and <strong>selected niches</strong>. It
                updates automatically whenever you change your profile or
                persona settings.
              </p>
            </div>
          </div>
        </div>

        {/* AI Prompt Display */}
        <div className="space-y-3">
          <Label>Current AI System Prompt</Label>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            {persona?.ai_prompt ? (
              <div className="space-y-2">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground">
                  {persona.ai_prompt}
                </pre>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  No AI prompt generated yet. Complete your bio and select
                  niches to generate your personalized AI prompt.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
