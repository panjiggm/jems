"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { User, Sparkles, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useQueryState } from "nuqs";

// Import tab components
import PersonalInfo from "@/components/profile/personal-info";
import NichePersona from "@/components/profile/niche-persona";
import AISystem from "@/components/profile/ai-system";

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function ProfilePage() {
  const params = useParams();
  const locale = params.locale as string;
  const [showFullBio, setShowFullBio] = useState(false);

  // Use nuqs for URL params
  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: "profile",
  });

  // Fetch user profile and persona data
  const profile = useQuery(api.queries.profile.getProfile);
  const persona = useQuery(api.queries.persona.getPersona);

  // Menu items
  const menuItems: MenuItem[] = [
    {
      id: "profile",
      title: "Personal Info",
      icon: User,
    },
    {
      id: "niche-persona",
      title: "Niche & Persona",
      icon: Sparkles,
    },
    {
      id: "ai-system",
      title: "AI System",
      icon: Settings,
    },
  ];

  // Get initials from full name
  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <PersonalInfo />;
      case "niche-persona":
        return <NichePersona />;
      case "ai-system":
        return <AISystem />;
      default:
        return <PersonalInfo />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header - Mobile */}
      <div className="lg:hidden bg-card border-b border-border p-4">
        <h1 className="text-lg font-bold">Account Settings</h1>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Sidebar */}
          <aside className="lg:col-span-4">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6 lg:sticky lg:top-20">
              {/* User Profile Section */}
              <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b border-border">
                {/* Avatar */}
                <Avatar className="h-20 w-20 ring-2 ring-border">
                  <AvatarImage
                    src={profile?.avatar_url || "/images/profile.png"}
                    alt={profile?.full_name || "User"}
                  />
                  <AvatarFallback className="text-lg font-semibold">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <div className="space-y-1">
                  <h2 className="text-lg font-bold">
                    {profile?.full_name || "Loading..."}
                  </h2>
                  {profile?.phone && (
                    <p className="text-sm text-muted-foreground">
                      {profile.phone}
                    </p>
                  )}
                </div>

                {/* Bio */}
                {persona?.bio && (
                  <div className="w-full space-y-2">
                    <p
                      className={cn(
                        "text-xs text-muted-foreground leading-relaxed",
                        !showFullBio && "line-clamp-3",
                      )}
                    >
                      {persona.bio}
                    </p>
                    {persona.bio.length > 150 && (
                      <button
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        {showFullBio ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <Button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-11",
                        isActive &&
                          "bg-primary/10 text-primary hover:bg-primary/15",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-semibold">{item.title}</span>
                    </Button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Right Content Area */}
          <main className="lg:col-span-8">
            <div className="bg-card border border-border rounded-lg p-6">
              {renderTabContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
