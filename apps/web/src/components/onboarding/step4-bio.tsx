"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/../../packages/backend/convex/_generated/api";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import type { Id } from "@/../../packages/backend/convex/_generated/dataModel";

interface Step4BioProps {
  onNext: (data: { bio: string }) => void;
  onPrevious: () => void;
  categories: string[];
  nicheIds: Id<"niches">[];
  initialData?: { bio: string };
}

export function Step4Bio({
  onNext,
  onPrevious,
  categories,
  nicheIds,
  initialData,
}: Step4BioProps) {
  const [bio, setBio] = useState(initialData?.bio || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const generateBioAction = useAction(api.openai.generateBioAction);

  const minBioLength = 50;
  const maxBioLength = 500;

  const handleGenerateBio = async () => {
    setIsGenerating(true);
    setError("");

    try {
      const generatedBio = await generateBioAction({
        categories,
        nicheIds,
      });

      if (generatedBio) {
        setBio(generatedBio);
      }
    } catch (err) {
      setError("Failed to generate bio. Please try again or write your own.");
      console.error("Bio generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const validateBio = () => {
    if (!bio.trim()) {
      setError("Bio is required");
      return false;
    }
    if (bio.trim().length < minBioLength) {
      setError(`Bio must be at least ${minBioLength} characters long`);
      return false;
    }
    if (bio.trim().length > maxBioLength) {
      setError(`Bio must be no more than ${maxBioLength} characters long`);
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (validateBio()) {
      onNext({ bio: bio.trim() });
    }
  };

  const bioLength = bio.length;
  const isValidLength = bioLength >= minBioLength && bioLength <= maxBioLength;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Tell Us About Yourself ✨</h3>
        <p className="text-muted-foreground text-sm">
          Write a bio that describes your experience, interests, and what makes
          you unique
        </p>
      </div>

      <div className="space-y-4">
        {/* Generate Bio Button */}
        <div className="flex justify-center">
          <ButtonPrimary
            onClick={handleGenerateBio}
            disabled={isGenerating}
            tone="outline"
            size="sm"
            className="gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isGenerating ? "AI Agent is creating..." : "Generate Bio with AI"}
          </ButtonPrimary>
        </div>

        {/* Bio Textarea */}
        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium">
            Your Bio *
          </label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself, your experience, your passions, and what drives you..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={`min-h-32 ${error ? "border-red-500" : ""}`}
            maxLength={maxBioLength}
          />

          {/* Character count */}
          <div className="flex justify-between items-center text-xs">
            <span
              className={`${isValidLength ? "text-green-600" : "text-muted-foreground"}`}
            >
              {bioLength < minBioLength
                ? `${minBioLength - bioLength} more characters needed`
                : `${bioLength}/${maxBioLength} characters`}
            </span>
            {isValidLength && (
              <span className="text-green-600 font-medium">✓ Good length</span>
            )}
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <ButtonPrimary
          tone="outline"
          onClick={onPrevious}
          disabled={isGenerating}
        >
          Previous
        </ButtonPrimary>

        <ButtonPrimary
          onClick={handleNext}
          disabled={!isValidLength || isGenerating}
        >
          Complete Setup
        </ButtonPrimary>
      </div>
    </div>
  );
}
