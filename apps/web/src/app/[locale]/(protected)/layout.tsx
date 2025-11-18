import { fetchQuery } from "convex/nextjs";
import { api } from "@/../../packages/backend/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { SidebarLeft } from "@/components/sidebar-left";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/navbar/theme-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ProtectedLayoutProvider } from "@/components/providers/protected-layout-provider";
import { GlobalContentIdeaInput } from "@/components/content-idea/global-input";
import {
  SidebarRight,
  SidebarRightProvider,
  SidebarRightTrigger,
} from "@/components/sidebar-right";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f7a641] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Fetch onboarding status server-side using userId from Clerk
  let onboardingStatus = await fetchQuery(
    api.queries.profile.getOnboardingStatusByUserId,
    { userId },
  );

  return (
    <ProtectedLayoutProvider initialOnboardingStatus={onboardingStatus}>
      <SidebarRightProvider>
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
                <SidebarRightTrigger />
              </div>
            </header>
            <div>{children}</div>
            <GlobalContentIdeaInput />
          </SidebarInset>
          <SidebarRight />
        </SidebarProvider>
      </SidebarRightProvider>
    </ProtectedLayoutProvider>
  );
}
