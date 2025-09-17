"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../../packages/backend/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Step0Welcome } from "./step0-welcome";
import { Step1Profile } from "./step1-profile";
import { Step2Categories } from "./step2-categories";
import { Step3Niches } from "./step3-niches";
import { Step4Bio } from "./step4-bio";
import { toast } from "sonner";
import type { Id } from "@/../../packages/backend/convex/_generated/dataModel";

interface OnboardingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OnboardingData {
  profile?: { full_name: string; phone: string };
  categories?: string[];
  nicheIds?: Id<"niches">[];
  bio?: string;
}

export function OnboardingDialog({ isOpen, onClose }: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isCompleting, setIsCompleting] = useState(false);

  const completeOnboarding = useMutation(api.onboarding.completeOnboarding);

  const totalSteps = 5;

  const handleClose = () => {
    // Reset state when closing
    setCurrentStep(0);
    setOnboardingData({});
    setIsCompleting(false);
    onClose();
  };

  const handleStep0Next = () => {
    setCurrentStep(1);
  };

  const handleStep1Next = (data: { full_name: string; phone: string }) => {
    setOnboardingData((prev) => ({ ...prev, profile: data }));
    setCurrentStep(2);
  };

  const handleStep2Next = (data: { categories: string[] }) => {
    setOnboardingData((prev) => ({ ...prev, categories: data.categories }));
    setCurrentStep(3);
  };

  const handleStep3Next = (data: { nicheIds: Id<"niches">[] }) => {
    setOnboardingData((prev) => ({ ...prev, nicheIds: data.nicheIds }));
    setCurrentStep(4);
  };

  const handleStep4Next = async (data: { bio: string }) => {
    setOnboardingData((prev) => ({ ...prev, bio: data.bio }));
    setIsCompleting(true);

    try {
      // Complete onboarding with all collected data
      await completeOnboarding({
        full_name: onboardingData.profile!.full_name,
        phone: onboardingData.profile!.phone,
        categories: onboardingData.categories!,
        nicheIds: onboardingData.nicheIds!,
        bio: data.bio,
      });

      toast.success("🎉 Welcome to Holobiont!", {
        description:
          "Your profile has been set up successfully. We're generating your personalized AI assistant in the background.",
        duration: 5000,
      });

      // Close dialog after a short delay to ensure toast is visible
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      console.error("Onboarding completion error:", error);
      toast.error("Failed to complete setup", {
        description:
          "Please try again or contact support if the problem persists.",
      });
      setIsCompleting(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step0Welcome onNext={handleStep0Next} onPrevious={handlePrevious} />
        );
      case 1:
        return (
          <Step1Profile
            onNext={handleStep1Next}
            onPrevious={handlePrevious}
            initialData={onboardingData.profile}
          />
        );
      case 2:
        return (
          <Step2Categories
            onNext={handleStep2Next}
            onPrevious={handlePrevious}
            initialData={{ categories: onboardingData.categories || [] }}
          />
        );
      case 3:
        return (
          <Step3Niches
            onNext={handleStep3Next}
            onPrevious={handlePrevious}
            categories={onboardingData.categories || []}
            initialData={{ nicheIds: onboardingData.nicheIds || [] }}
          />
        );
      case 4:
        return (
          <Step4Bio
            onNext={handleStep4Next}
            onPrevious={handlePrevious}
            categories={onboardingData.categories || []}
            nicheIds={onboardingData.nicheIds || []}
            initialData={{ bio: onboardingData.bio || "" }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Getting Started</DialogTitle>
          <DialogDescription>
            Complete your setup to get the most out of Holobiont
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Progress indicator - hide on welcome step */}
          {currentStep > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Step {currentStep} of {totalSteps - 1}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((currentStep / (totalSteps - 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(currentStep / (totalSteps - 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Step content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isCompleting ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <div className="text-center">
                  <h3 className="font-semibold">Setting up your profile...</h3>
                  <p className="text-sm text-muted-foreground">
                    We're creating your personalized AI assistant
                  </p>
                </div>
              </div>
            ) : (
              renderStepContent()
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
