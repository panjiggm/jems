import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { CheckCircle2 } from "lucide-react";

const recentActivity = [
  {
    id: 1,
    user: "Content Creator",
    action: "published TikTok video",
    time: "Today 12:00 PM",
    status: "Published",
    type: "content",
  },
  {
    id: 2,
    user: "Video Editor",
    action: "updated content status",
    time: "Today 14:30 PM",
    status: "Draft → In Progress",
    type: "progress",
  },
  {
    id: 3,
    user: "Social Media Manager",
    action: "completed task for Instagram post",
    time: "Today 12:00 PM",
    type: "task",
  },
];

const RecentActivity = () => {
  return (
    <div className="p-6">
      <h3 className="font-medium text-sm text-muted-foreground mb-4">
        RECENT ACTIVITY
      </h3>
      <div className="space-y-4">
        {recentActivity.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/images/profile.png" alt={activity.user} />
              <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{activity.user}</span>{" "}
                {activity.action}
              </p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
              {activity.status && (
                <div className="mt-1">
                  {activity.type === "progress" ? (
                    <Badge variant="secondary" className="text-xs">
                      {activity.status}
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600">
                        {activity.status}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
