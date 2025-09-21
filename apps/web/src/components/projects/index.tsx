"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, Plus, User, Bell } from "lucide-react";
import ProjectStats from "./project-stats";
import RecentActivity from "./recent-activity";
import ProjectTabs from "./tabs";
import { ButtonPrimary } from "../ui/button-primary";

// Dummy data based on schema.ts
const userInfo = {
  name: "Alex Johnson",
  avatar: "/images/profile.png",
  createdDate: "15 Oct, 2024",
  lastActivity: "2 Nov, 2024 at 09:00AM",
  role: "Content Creator",
  projectsCount: "5 Projects",
  assignedUsers: [
    { id: 1, name: "Content Creator", avatar: "/images/profile.png" },
    { id: 2, name: "Video Editor", avatar: "/images/profile.png" },
    { id: 3, name: "Social Media Manager", avatar: "/images/profile.png" },
  ],
};

const projects = [
  {
    id: 1,
    title: "Create TikTok dance video content",
    description:
      "Record trending dance video with summer theme for campaign launch.",
    dueDate: "Today 12:00 PM",
    createdBy: "You",
    priority: null,
    completed: true,
  },
  {
    id: 2,
    title: "Edit YouTube product review",
    description:
      "Complete video editing for iPhone 15 Pro review with camera tests",
    dueDate: "Tomorrow 2:00 PM",
    createdBy: "Video Editor",
    priority: "Important",
    completed: false,
  },
  {
    id: 3,
    title: "Schedule Instagram Stories batch",
    description: "Prepare and schedule morning routine stories for next week",
    dueDate: "Nov 28, 10:00 AM",
    createdBy: "Social Media Manager",
    priority: null,
    completed: false,
  },
  {
    id: 4,
    title: "Create TikTok dance video content",
    description: "Prepare and schedule morning routine stories for next week",
    dueDate: "Nov 28, 10:00 AM",
    createdBy: "Social Media Manager",
    priority: null,
    completed: false,
  },
];

export default function ProjectsComponent() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center justify-between w-full px-2">
            <div className="text-sm text-muted-foreground">
              Active Projects &gt; Summer Campaign
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ButtonPrimary size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left Sidebar - User Info */}
        <div className="w-full lg:w-80 bg-white border-r lg:min-h-screen">
          {/* User Header */}
          <ProjectStats />

          {/* Recent Activity */}
          <RecentActivity />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Tabs */}
          <ProjectTabs />

          {/* Content Area */}
          <div className="p-6 space-y-6">
            {/* Header with Create Project Button */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Projects</h2>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="shadow-none border rounded-lg"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm leading-tight">
                            {project.title}
                          </h4>
                          {project.priority && (
                            <Badge
                              variant={
                                project.priority === "Important"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="text-xs ml-2 flex-shrink-0"
                            >
                              {project.priority}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              Due: {project.dueDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              By {project.createdBy}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-center"
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            Set Reminder
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
