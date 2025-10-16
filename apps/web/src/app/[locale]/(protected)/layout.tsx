"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../../packages/backend/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { SidebarLeft } from "@/components/sidebar-left";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/navbar/theme-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const hasTriedFixRef = useRef(false);

  const onboardingStatus = useQuery(api.queries.profile.getOnboardingStatus);
  const fixOnboardingStatus = useMutation(
    api.mutations.profile.fixOnboardingStatus,
  );

  useEffect(() => {
    if (isLoaded && user && onboardingStatus !== undefined) {
      // If user has profile and persona but onboarding is not marked complete, try to fix it
      if (
        onboardingStatus.hasProfile &&
        onboardingStatus.hasPersona &&
        !onboardingStatus.isCompleted &&
        !hasTriedFixRef.current
      ) {
        hasTriedFixRef.current = true;
        fixOnboardingStatus().catch(console.error);
        return; // Don't show onboarding dialog while fixing
      }

      if (!onboardingStatus.isCompleted) {
        setShowOnboarding(true);
      }
    }
  }, [isLoaded, user, onboardingStatus, fixOnboardingStatus]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

  // Show loading state while checking onboarding status
  if (!isLoaded || onboardingStatus === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f7a641] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SidebarProvider>
        <SidebarLeft />
        <SidebarInset>
          <header className="bg-background sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 px-3">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Badge className="bg-gradient-to-r from-[#f7a641] to-[#4a2e1a] text-white border-0 font-bold animate-pulse hover:animate-none">
                ✨ Alpha Version
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </header>
          <div>{children}</div>
        </SidebarInset>
      </SidebarProvider>

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
