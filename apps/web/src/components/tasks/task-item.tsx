"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export interface TaskItemModel {
  _id: Id<"tasks">;
  _creationTime: number;
  userId: string;
  projectId: Id<"projects">;
  contentId?: string;
  contentType?: "campaign" | "routine";
  title: string;
  status: "todo" | "doing" | "done" | "skipped";
  dueDate?: string; // ISO date string (YYYY-MM-DD)
  createdAt: number;
  updatedAt: number;
}

const statusLabel: Record<TaskItemModel["status"], string> = {
  todo: "TODO",
  doing: "DOING",
  done: "DONE",
  skipped: "SKIP",
};

function containerBgClass(status: TaskItemModel["status"]) {
  switch (status) {
    case "todo":
      return "bg-blue-50 hover:bg-blue-100";
    case "doing":
      return "bg-yellow-50 hover:bg-yellow-100";
    case "done":
      return "bg-green-50 hover:bg-green-100";
    case "skipped":
      return "bg-gray-50 hover:bg-gray-100";
    default:
      return "bg-card";
  }
}

export function TaskItem({ task }: { task: TaskItemModel }) {
  const [title, setTitle] = useState(task.title);
  const lastCommittedTitle = useRef(task.title);

  const updateTask = useMutation(api.mutations.tasks.update);
  const setStatus = useMutation(api.mutations.tasks.setStatus);
  const removeTask = useMutation(api.mutations.tasks.remove);

  const handleToggleDone = async () => {
    try {
      const next = task.status === "done" ? "todo" : "done";
      await setStatus({ id: task._id, status: next });
    } catch (error) {
      toast.error("Failed to update task status");
      console.error(error);
    }
  };

  const commitTitleIfChanged = async () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== lastCommittedTitle.current) {
      try {
        await updateTask({ id: task._id, patch: { title: trimmed } });
        lastCommittedTitle.current = trimmed;
        toast.success("Title updated");
      } catch (error) {
        toast.error("Failed to update title");
        console.error(error);
      }
    }
  };

  const handleStatusChange = async (
    value: "todo" | "doing" | "done" | "skipped",
  ) => {
    try {
      if (value === "skipped") {
        // Backend setStatus doesn't support "skipped"; map to "done" for now
        await setStatus({ id: task._id, status: "done" });
        return;
      }
      await setStatus({ id: task._id, status: value });
    } catch (error) {
      toast.error("Failed to change status");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await removeTask({ id: task._id });
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
      console.error(error);
    }
  };

  const formattedDueDate = task.dueDate
    ? (() => {
        try {
          const date = parseISO(task.dueDate);
          return format(date, "MMM d, yyyy");
        } catch {
          return task.dueDate;
        }
      })()
    : undefined;

  return (
    <div
      onMouseLeave={commitTitleIfChanged}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-lg transition-colors",
        containerBgClass(task.status),
        task.status === "done" && "opacity-60",
      )}
    >
      {/* Checkbox */}
      <Checkbox
        checked={task.status === "done"}
        onCheckedChange={handleToggleDone}
        className="flex-shrink-0"
      />

      {/* Title Input - borderless */}
      <div className="flex-1 min-w-0">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitTitleIfChanged}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") setTitle(lastCommittedTitle.current);
          }}
          className={cn(
            "h-8 text-sm border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2",
            task.status === "done" && "line-through",
          )}
        />
      </div>

      {/* Status Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="xs"
            className="w-full sm:w-auto flex-shrink-0"
          >
            {statusLabel[task.status]}
            <ChevronDown className="h-4 w-4 ml-1 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[10rem]">
          {(["todo", "doing", "done", "skipped"] as const).map((s) => (
            <DropdownMenuItem key={s} onSelect={() => handleStatusChange(s)}>
              {statusLabel[s]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Due Date */}
      {formattedDueDate && (
        <p className="text-xs text-muted-foreground flex-shrink-0 px-2">
          {formattedDueDate}
        </p>
      )}

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        className="h-7 w-full sm:w-8 p-0 text-destructive hover:text-destructive flex-shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function TaskList({ tasks }: { tasks: TaskItemModel[] }) {
  if (!tasks.length) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No tasks yet. Add your first task above.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {tasks.map((t) => (
        <TaskItem key={t._id} task={t} />
      ))}
    </div>
  );
}
