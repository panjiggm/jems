import React from "react";

import {
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Plus,
  FileText,
  User,
  Bell,
  MoreHorizontal,
  ArrowLeft,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "../ui/button";

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

const ProjectStats = () => {
  return (
    <div className="p-6 border-b">
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
          <AvatarFallback>{userInfo.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-lg">{userInfo.name}</h2>
          <p className="text-sm text-muted-foreground">
            Created On {userInfo.createdDate}
          </p>
        </div>
      </div>

      {/* Assigned Users */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex -space-x-2">
          {userInfo.assignedUsers.map((user, index) => (
            <Avatar key={user.id} className="h-8 w-8 border-2 border-white">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
          <div className="h-8 w-8 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white">
            +2
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <Mail className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Mail</span>
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <Phone className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Call</span>
        </Button>
        <Button variant="outline" size="sm">
          <MoreHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">More</span>
        </Button>
      </div>
    </div>
  );
};

export default ProjectStats;
