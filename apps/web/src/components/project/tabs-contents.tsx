"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Kanban, Table, List } from "lucide-react";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import KanbanView from "./views/kanban-view";
import TableView from "./views/table-view";
import ListView from "./views/list-view";

interface TabsContentsProps {
  className?: string;
  activeTab: string;
  onTabChange: (value: string) => void;
  projectId?: Id<"projects">;
  userId?: string;
}

const TabsContents = ({
  className,
  activeTab,
  onTabChange,
  projectId,
  userId,
}: TabsContentsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className={className}>
      <TabsList className="inline-flex w-fit rounded-sm">
        <TabsTrigger
          value="kanban"
          className="flex items-center gap-2 px-4 text-xs"
        >
          <Kanban />
          Kanban
        </TabsTrigger>
        <TabsTrigger
          value="table"
          className="flex items-center gap-2 px-4 text-xs"
        >
          <Table />
          Table
        </TabsTrigger>
        <TabsTrigger
          value="list"
          className="flex items-center gap-2 px-4 text-xs"
        >
          <List />
          List
        </TabsTrigger>
      </TabsList>

      <TabsContent value="kanban" className="mt-4">
        <KanbanView projectId={projectId} userId={userId} />
      </TabsContent>

      <TabsContent value="table" className="mt-4">
        <TableView projectId={projectId} userId={userId} />
      </TabsContent>

      <TabsContent value="list" className="mt-4">
        <ListView projectId={projectId} userId={userId} />
      </TabsContent>
    </Tabs>
  );
};

export default TabsContents;
