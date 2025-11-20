"use client";

import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { User, Sparkles, Settings, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use nuqs for URL params
  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: "profile",
  });

  // Fetch user profile and persona data
  const profile = useQuery(api.queries.profile.getProfile);
  const persona = useQuery(api.queries.persona.getPersona);
  const updateProfile = useMutation(api.mutations.profile.updateProfile);
  const generateUploadUrl = useAction(api.actions.storage.generateUploadUrl);

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

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setIsUploadingAvatar(true);

      // 1) Get upload URL
      const { uploadUrl } = await generateUploadUrl({});

      // 2) Upload file
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await response.json();

      // 3) Update profile with storageId
      await updateProfile({
        avatarStorageId: storageId as Id<"_storage">,
      });

      toast.success("Avatar updated successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar. Please try again.");
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAvatarClick = () => {
    if (!isUploadingAvatar) {
      fileInputRef.current?.click();
    }
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
                {/* Avatar with upload capability */}
                <div className="relative group">
                  <Avatar className="h-20 w-20 ring-2 ring-border cursor-pointer transition-opacity group-hover:opacity-80">
                    <AvatarImage
                      src={profile?.avatar_url || "/images/profile.png"}
                      alt={profile?.full_name || "User"}
                    />
                    <AvatarFallback className="text-lg font-semibold">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    aria-label="Upload avatar"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isUploadingAvatar}
                  />
                </div>

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
