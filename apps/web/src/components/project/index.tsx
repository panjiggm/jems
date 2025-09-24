"use client";

import { useState } from "react";
import TabsContents from "./tabs-contents";

interface ProjectComponentProps {
  projectId?: string;
  userId?: string;
}

export default function ProjectComponent({
  projectId,
  userId,
}: ProjectComponentProps) {
  const [activeTab, setActiveTab] = useState("kanban");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="w-full">
      <TabsContents
        projectId={projectId}
        userId={userId}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
