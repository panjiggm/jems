"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Kanban, Table, List } from "lucide-react";
import { KanbanBoard } from "@/components/kanban";

interface TabsContentsProps {
  className?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  projectId?: string;
  userId?: string;
}

const TabsContents = ({
  className,
  defaultValue = "kanban",
  onValueChange,
  projectId,
  userId,
}: TabsContentsProps) => {
  return (
    <Tabs
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      className={className}
    >
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
        {projectId && userId ? (
          <KanbanBoard projectId={projectId} userId={userId} />
        ) : (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Kanban View</h3>
            <p className="text-muted-foreground">
              Drag and drop your content across different columns to manage your
              workflow.
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="table" className="mt-4">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Table View</h3>
          <p className="text-muted-foreground">
            View your data in a structured table format with sorting and
            filtering options.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="list" className="mt-4">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">List View</h3>
          <p className="text-muted-foreground">
            Browse your items in a simple list format for quick scanning and
            selection.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default TabsContents;
