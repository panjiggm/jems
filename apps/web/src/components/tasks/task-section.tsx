"use client";

import * as React from "react";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ButtonPrimary } from "../ui/button-primary";

interface Task {
  _id: Id<"tasks">;
  _creationTime: number;
  userId: string;
  projectId: Id<"projects">;
  contentId?: string;
  contentType?: "campaign" | "routine";
  title: string;
  status: "todo" | "doing" | "done" | "skipped";
  dueDate?: string;
  createdAt: number;
  updatedAt: number;
}

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
    contentId ? { contentId, pageSize: 100 } : "skip",
  );

  // Mutations
  const createTask = useMutation(api.mutations.tasks.create);
  const updateTaskStatus = useMutation(api.mutations.tasks.setStatus);
  const deleteTask = useMutation(api.mutations.tasks.remove);

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

  const handleToggleTaskStatus = async (
    taskId: Id<"tasks">,
    currentStatus: "todo" | "doing" | "done" | "skipped",
  ) => {
    try {
      const newStatus = currentStatus === "done" ? "todo" : "done";
      await updateTaskStatus({ id: taskId, status: newStatus });
    } catch (error) {
      toast.error("Failed to update task status");
      console.error(error);
    }
  };

  const handleStatusChange = async (
    taskId: Id<"tasks">,
    newStatus: "todo" | "doing" | "done" | "skipped",
  ) => {
    try {
      // Only update if status is supported by the mutation
      if (newStatus === "skipped") {
        // For now, we'll treat skipped as done for the mutation
        // You might want to create a separate mutation for skipped status
        await updateTaskStatus({ id: taskId, status: "done" });
      } else {
        await updateTaskStatus({ id: taskId, status: newStatus });
      }
      toast.success("Task status updated");
    } catch (error) {
      toast.error("Failed to update task status");
      console.error(error);
    }
  };

  const handleDeleteTask = async (taskId: Id<"tasks">) => {
    try {
      await deleteTask({ id: taskId });
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
      console.error(error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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

  const statusOptions = [
    {
      value: "todo",
      label: "TODO",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      value: "doing",
      label: "DOING",
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    {
      value: "done",
      label: "DONE",
      color: "bg-green-50 text-green-700 border-green-200",
    },
    {
      value: "skipped",
      label: "SKIP",
      color: "bg-gray-50 text-gray-700 border-gray-200",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Tasks</h3>
        <Badge variant="secondary">
          {taskStats.byStatus.done}/{taskStats.total}
        </Badge>
      </div>

      {/* Add Task Form */}
      <div className="flex gap-2">
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
        >
          {isAddingTask ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </ButtonPrimary>
      </div>

      {/* Task Stats */}
      {taskStats.total > 0 && (
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="flex flex-col items-center p-2 bg-blue-50 rounded-md">
            <span className="font-semibold text-blue-900">
              {taskStats.byStatus.todo}
            </span>
            <span className="text-blue-600">To Do</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-yellow-50 rounded-md">
            <span className="font-semibold text-yellow-900">
              {taskStats.byStatus.doing}
            </span>
            <span className="text-yellow-600">Doing</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-green-50 rounded-md">
            <span className="font-semibold text-green-900">
              {taskStats.byStatus.done}
            </span>
            <span className="text-green-600">Done</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
            <span className="font-semibold text-gray-900">
              {taskStats.byStatus.skipped}
            </span>
            <span className="text-gray-600">Skipped</span>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {taskList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No tasks yet. Add your first task above.
          </div>
        ) : (
          taskList.map((task) => (
            <div
              key={task._id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border bg-card transition-colors hover:bg-accent/50",
                task.status === "done" && "opacity-60",
              )}
            >
              <Checkbox
                checked={task.status === "done"}
                onCheckedChange={() =>
                  handleToggleTaskStatus(task._id, task.status)
                }
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium break-words",
                    task.status === "done" && "line-through",
                  )}
                >
                  {task.title}
                </p>
                {task.dueDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Due: {formatDate(task.dueDate)}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Select
                    value={task.status}
                    onValueChange={(
                      value: "todo" | "doing" | "done" | "skipped",
                    ) => handleStatusChange(task._id, value)}
                  >
                    <SelectTrigger className="h-6 w-28 text-xs">
                      <div className="flex items-center gap-1.5">
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "w-3 h-3 rounded-full border-2 border-white shadow-sm",
                                option.value === "todo" && "bg-blue-500",
                                option.value === "doing" && "bg-yellow-500",
                                option.value === "done" && "bg-green-500",
                                option.value === "skipped" && "bg-gray-500",
                              )}
                            />
                            <span className="whitespace-nowrap">
                              {option.label}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteTask(task._id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
