"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import React from "react";

const tabs = [
  { id: "info", label: "Projects", active: false, badge: "7" },
  { id: "activity", label: "Contents", active: true, badge: "17" },
  { id: "content", label: "Tasks", active: false, badge: "27" },
  { id: "calendar", label: "Calendar", active: false },
];

const ProjectTabs = () => {
  const [activeTab, setActiveTab] = useState("activity");

  return (
    <div className="bg-white border-b">
      <div className="flex items-center px-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab.active || activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.badge && (
              <Badge variant="secondary" className="ml-2 h-5 text-xs">
                {tab.badge}
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProjectTabs;
