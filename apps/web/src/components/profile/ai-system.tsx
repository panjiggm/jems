"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

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
          Customize your AI assistant's behavior and prompts
        </p>
      </div>

      <div className="space-y-4">
        {/* AI Prompt */}
        <div className="space-y-2">
          <Label htmlFor="ai_prompt">AI System Prompt</Label>
          <Textarea
            id="ai_prompt"
            defaultValue={persona?.ai_prompt || ""}
            placeholder="Enter custom AI system prompt..."
            rows={8}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            This prompt will be used to customize how the AI assistant responds
            to you. It's automatically generated based on your bio and niches,
            but you can customize it here.
          </p>
        </div>

        {/* Info Box */}
        <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-2">
          <h3 className="text-sm font-semibold">How it works</h3>
          <p className="text-sm text-muted-foreground">
            The AI system prompt is generated based on your bio and selected
            niches. This helps the AI understand your context and provide more
            relevant responses. You can modify it to further customize the AI's
            behavior.
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button>
          <Sparkles className="h-4 w-4 mr-2" />
          Regenerate Prompt
        </Button>
        <Button variant="outline">Save Changes</Button>
      </div>
    </div>
  );
}
