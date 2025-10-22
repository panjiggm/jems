"use client";

import { useState } from "react";
import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog";
import { Toaster } from "@/components/ui/sonner";

interface ProtectedLayoutProviderProps {
  children: React.ReactNode;
  initialOnboardingStatus: {
    isCompleted: boolean | unknown;
    hasProfile: boolean;
    hasPersona?: boolean;
  };
}

export function ProtectedLayoutProvider({
  children,
  initialOnboardingStatus,
}: ProtectedLayoutProviderProps) {
  // Normalize isCompleted to boolean and set initial state
  const isCompleted = Boolean(initialOnboardingStatus.isCompleted);
  const [showOnboarding, setShowOnboarding] = useState(!isCompleted);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

  return (
    <>
      {children}

      {/* Onboarding Dialog - shown across all protected pages */}
      <OnboardingDialog
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
      />

      {/* Toast notifications */}
      <Toaster position="top-right" richColors />
    </>
  );
}
