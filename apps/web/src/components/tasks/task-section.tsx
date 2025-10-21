"use client";

import * as React from "react";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ButtonPrimary } from "../ui/button-primary";
import { TaskList, TaskItemModel } from "./task-item";

interface TaskSectionProps {
  contentId: string;
  contentType: "campaign" | "routine";
  projectId: Id<"projects">;
}

export function TaskSection({
  contentId,
  contentType,
  projectId,
}: TaskSectionProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Queries
  const tasks = useQuery(
    api.queries.tasks.list,
    contentId
      ? {
          contentId: contentId as
            | Id<"contentCampaigns">
            | Id<"contentRoutines">,
          pageSize: 100,
        }
      : "skip",
  );

  // Mutations
  const createTask = useMutation(api.mutations.tasks.create);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    setIsAddingTask(true);
    try {
      await createTask({
        projectId,
        contentId,
        contentType,
        title: newTaskTitle.trim(),
      });
      setNewTaskTitle("");
      toast.success("Task created successfully");
    } catch (error) {
      toast.error("Failed to create task");
      console.error(error);
    } finally {
      setIsAddingTask(false);
    }
  };

  // Per-item interactions (status, delete, edit) are handled in TaskItem

  // Calculate task stats
  const taskStats = {
    total: tasks?.items?.length || 0,
    byStatus: {
      todo: 0,
      doing: 0,
      done: 0,
      skipped: 0,
    },
  };

  if (tasks?.items) {
    tasks.items.forEach((task) => {
      taskStats.byStatus[task.status]++;
    });
  }

  const taskList = tasks?.items || [];

  // Status options moved to TaskItem

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Tasks</h3>
        <Badge variant="secondary">
          {taskStats.byStatus.done}/{taskStats.total}
        </Badge>
      </div>

      {/* Add Task Form */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAddTask();
            }
          }}
          className="flex-1"
        />
        <ButtonPrimary
          size="default"
          onClick={handleAddTask}
          disabled={!newTaskTitle.trim() || isAddingTask}
          className="w-full sm:w-auto"
        >
          {isAddingTask ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </ButtonPrimary>
      </div>

      {/* Task List */}
      <TaskList tasks={taskList as unknown as TaskItemModel[]} />
    </div>
  );
}
