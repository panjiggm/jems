"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../../packages/backend/convex/_generated/api";
import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog";
import { useUser } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle2,
  BarChart3,
  Instagram,
  Play,
  Calendar,
  MoreVertical,
} from "lucide-react";

// Dummy data
const dummyProjects = [
  {
    id: 1,
    title: "Product Launch Campaign",
    completed: 7,
    total: 12,
    icon: "📱",
    color: "#f7a641",
  },
  {
    id: 2,
    title: "Brand Refresh Series",
    completed: 4,
    total: 8,
    icon: "🎨",
    color: "#4a2e1a",
  },
  {
    id: 3,
    title: "Holiday Content",
    completed: 9,
    total: 15,
    icon: "🎄",
    color: "#f7a641",
  },
];

const dummyContents = [
  {
    id: 1,
    title: "Instagram Reels: Product Unboxing",
    platform: "instagram",
    status: "editing",
    image: "/images/Fantasy.png",
    creator: "Sarah Johnson",
  },
  {
    id: 2,
    title: "TikTok Tutorial: How to Use Features",
    platform: "tiktok",
    status: "shooting",
    image: "/images/hero.png",
    creator: "Mike Chen",
  },
  {
    id: 3,
    title: "Behind the Scenes: Team Culture",
    platform: "instagram",
    status: "scripting",
    image: "/images/goodNews.png",
    creator: "Emma Wilson",
  },
];

const dummyTasks = [
  {
    id: 1,
    title: "Review Q4 Content Strategy",
    project: "Product Launch Campaign",
    status: "doing",
    dueDate: "2024-10-15",
  },
  {
    id: 2,
    title: "Schedule TikTok Posts",
    project: "Holiday Content",
    status: "todo",
    dueDate: "2024-10-18",
  },
  {
    id: 3,
    title: "Update Brand Guidelines",
    project: "Brand Refresh Series",
    status: "done",
    dueDate: "2024-10-12",
  },
];

const socialPlatforms = [
  { name: "Instagram", connected: true, followers: "12.5K", icon: Instagram },
  { name: "TikTok", connected: true, followers: "8.3K", icon: Play },
  { name: "Facebook", connected: false, followers: "-", icon: Calendar },
];

export default function DashboardPage() {
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
  }, [isLoaded, user, onboardingStatus]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

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
    <div className="min-h-screen">
      <div className="container mx-auto p-6 space-y-8">
        {/* Hero Banner */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#f7a641] to-[#4a2e1a] p-8 md:p-12 border-2 border-[#4a2e1a]">
          <div className="relative">
            <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
              CONTENT CREATOR PLATFORM
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Elevate Your Content with
              <br />
              Smart Project Management
            </h1>
            <p className="text-white/90 text-lg mb-6 max-w-2xl">
              Plan, create, and publish amazing content across all platforms
              with powerful tools designed for creators.
            </p>
            <Button
              size="lg"
              className="bg-white text-[#4a2e1a] hover:bg-[#f8e9b0] font-bold border-2 border-white"
            >
              Create New Project
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 right-20 w-48 h-48 bg-[#f8e9b0]/20 rounded-full"></div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 border-[#f7a641]/30 hover:border-[#f7a641] transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-[#f7a641]/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-[#f7a641]" />
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">
                  +12%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-[#4a2e1a] dark:text-white">
                24
              </h3>
              <p className="text-sm text-muted-foreground">Active Projects</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#f7a641]/30 hover:border-[#f7a641] transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-[#f7a641]/10 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-[#f7a641]" />
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0">
                  +8%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-[#4a2e1a] dark:text-white">
                156
              </h3>
              <p className="text-sm text-muted-foreground">Contents Created</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#f7a641]/30 hover:border-[#f7a641] transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-[#f7a641]/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-[#f7a641]" />
                </div>
                <Badge className="bg-purple-100 text-purple-700 border-0">
                  +24%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-[#4a2e1a] dark:text-white">
                89%
              </h3>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#f7a641]/30 hover:border-[#f7a641] transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-[#f7a641]/10 rounded-lg">
                  <Clock className="h-6 w-6 text-[#f7a641]" />
                </div>
                <Badge className="bg-orange-100 text-orange-700 border-0">
                  Due Soon
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-[#4a2e1a] dark:text-white">
                12
              </h3>
              <p className="text-sm text-muted-foreground">Pending Tasks</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Projects & Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Projects */}
            <Card className="border-2 border-[#f7a641]/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[#4a2e1a] dark:text-white">
                  Your Projects
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-[#f7a641]">
                  See all
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {dummyProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 rounded-xl border-2 border-[#f8e9b0] bg-gradient-to-br from-white to-[#f8e9b0]/20 hover:border-[#f7a641] transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">{project.icon}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      <h4 className="font-semibold text-[#4a2e1a] dark:text-white mb-2 text-sm">
                        {project.title}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {project.completed}/{project.total} completed
                          </span>
                          <span>
                            {Math.round(
                              (project.completed / project.total) * 100,
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={(project.completed / project.total) * 100}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Continue Working - Recent Contents */}
            <Card className="border-2 border-[#f7a641]/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[#4a2e1a] dark:text-white">
                  Continue Working
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-[#f7a641] text-white hover:bg-[#f7a641]/90"
                  >
                    ←
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-[#f7a641] text-white hover:bg-[#f7a641]/90"
                  >
                    →
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {dummyContents.map((content) => (
                    <div
                      key={content.id}
                      className="group relative rounded-xl overflow-hidden cursor-pointer border-2 border-[#f8e9b0] hover:border-[#f7a641] transition-all"
                    >
                      <div className="aspect-video bg-gradient-to-br from-[#f7a641]/20 to-[#4a2e1a]/20 relative">
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all"></div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-4 bg-white dark:bg-card">
                        <Badge
                          className="mb-2 bg-[#f7a641]/10 text-[#f7a641] border-0"
                          variant="secondary"
                        >
                          {content.platform.toUpperCase()}
                        </Badge>
                        <h4 className="font-semibold text-sm mb-2 text-[#4a2e1a] dark:text-white">
                          {content.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-[#f7a641] text-white text-xs">
                              {content.creator[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {content.creator}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Your Tasks */}
            <Card className="border-2 border-[#f7a641]/30">
              <CardHeader>
                <CardTitle className="text-[#4a2e1a] dark:text-white">
                  Your Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dummyTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 p-4 rounded-lg border-2 border-[#f8e9b0] hover:border-[#f7a641] hover:bg-[#f8e9b0]/10 transition-all"
                    >
                      <div
                        className={`h-4 w-4 rounded-full ${
                          task.status === "done"
                            ? "bg-green-500"
                            : task.status === "doing"
                              ? "bg-[#f7a641]"
                              : "bg-gray-300"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-[#4a2e1a] dark:text-white">
                          {task.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {task.project}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs border-[#f7a641]/30"
                      >
                        {task.dueDate}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Social */}
          <div className="space-y-8">
            {/* User Stats */}
            <Card className="border-2 border-[#f7a641]/30 bg-gradient-to-br from-white to-[#f8e9b0]/10">
              <CardHeader>
                <CardTitle className="text-[#4a2e1a] dark:text-white">
                  Statistic
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="h-24 w-24 border-4 border-[#f7a641]">
                      <AvatarImage src={user?.imageUrl} />
                      <AvatarFallback className="bg-[#f7a641] text-white text-2xl">
                        {user?.firstName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2 bg-[#f7a641] text-white text-xs font-bold rounded-full h-8 w-8 flex items-center justify-center border-2 border-white">
                      32%
                    </div>
                  </div>
                  <h3 className="mt-4 font-bold text-lg text-[#4a2e1a] dark:text-white">
                    Good Morning {user?.firstName}! 🔥
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Continue your learning to achieve your target!
                  </p>
                </div>

                {/* Simple Bar Chart */}
                <div className="space-y-2">
                  <div className="flex items-end justify-between h-40 gap-2">
                    {[30, 50, 35, 60, 40].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-2"
                      >
                        <div
                          className="w-full rounded-t-lg transition-all hover:opacity-80 relative group"
                          style={{
                            height: `${height}%`,
                            background:
                              i % 2 === 0
                                ? "linear-gradient(to top, #f7a641, #f7a641)"
                                : "linear-gradient(to top, #f8e9b0, #f8e9b0)",
                          }}
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-bold text-[#4a2e1a]">
                              {height}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {["1-10", "11-20", "21-30", "1-10", "11-20"][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media Connections */}
            <Card className="border-2 border-[#f7a641]/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[#4a2e1a] dark:text-white">
                  Social Media
                </CardTitle>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  +
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {socialPlatforms.map((platform, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg border-2 border-[#f8e9b0] hover:border-[#f7a641] transition-all"
                  >
                    <div className="p-2 bg-[#f7a641]/10 rounded-lg">
                      <platform.icon className="h-5 w-5 text-[#f7a641]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-[#4a2e1a] dark:text-white">
                        {platform.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {platform.followers} followers
                      </p>
                    </div>
                    {platform.connected ? (
                      <Badge className="bg-green-100 text-green-700 border-0">
                        Connected
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-[#f7a641] hover:bg-[#f7a641]/90"
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-2 border-[#f7a641] bg-gradient-to-br from-[#4a2e1a] to-[#4a2e1a]/80">
              <CardContent className="pt-6">
                <h3 className="text-white font-bold mb-2">
                  Ready to create something amazing?
                </h3>
                <p className="text-white/80 text-sm mb-4">
                  Start a new project and bring your ideas to life.
                </p>
                <Button className="w-full bg-[#f7a641] hover:bg-[#f7a641]/90 text-white">
                  New Content
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Onboarding Dialog */}
        <OnboardingDialog
          isOpen={showOnboarding}
          onClose={handleCloseOnboarding}
        />

        {/* Toast notifications */}
        <Toaster position="top-right" richColors />
      </div>
    </div>
  );
}
