"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ButtonPrimary } from "@/components/ui/button-primary";

export default function NichePersona() {
  const persona = useQuery(api.queries.persona.getPersona);
  const niches = useQuery(
    api.queries.niches.getNichesByIds,
    persona?.nicheIds ? { nicheIds: persona.nicheIds } : "skip",
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Niche & Persona</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your niches and persona settings
        </p>
      </div>

      <div className="space-y-4">
        {/* Selected Niches */}
        <div className="space-y-2">
          <Label>Selected Niches</Label>
          <div className="flex flex-wrap gap-2">
            {niches && niches.length > 0 ? (
              niches.map((niche, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {niche?.emoji && <span>{niche.emoji}</span>}
                  <span>{niche?.label || "Loading..."}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No niches selected yet
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            defaultValue={persona?.bio || ""}
            placeholder="Tell us about yourself..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Describe yourself and your interests
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <ButtonPrimary tone="outline">Cancel</ButtonPrimary>
        <ButtonPrimary>Save Changes</ButtonPrimary>
      </div>
    </div>
  );
}
