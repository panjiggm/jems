"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../../packages/backend/convex/_generated/api";
import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog";
import { useUser } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Query to check onboarding status
  const onboardingStatus = useQuery(api.queries.profile.getOnboardingStatus);

  useEffect(() => {
    // Only check onboarding status when user is loaded and we have the query result
    if (isLoaded && user && onboardingStatus !== undefined) {
      if (!onboardingStatus.isCompleted) {
        setShowOnboarding(true);
      }
    }
  }, [isLoaded, user, onboardingStatus]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    // TODO: In the future, this will trigger the completion of onboarding
    // when the user actually completes all the steps
  };

  // Show loading state while checking authentication and onboarding status
  if (!isLoaded || onboardingStatus === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your projects today.
        </p>
      </div>

      {/* Onboarding status debug info (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>Has Profile: {onboardingStatus.hasProfile ? "Yes" : "No"}</p>
          <p>
            Onboarding Completed: {onboardingStatus.isCompleted ? "Yes" : "No"}
          </p>
          <p>Show Onboarding Dialog: {showOnboarding ? "Yes" : "No"}</p>
        </div>
      )}

      {/* Onboarding Dialog */}
      <OnboardingDialog
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
      />

      {/* Toast notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}
