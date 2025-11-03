"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import { ButtonPrimary } from "../ui/button-primary";
import { PlusIcon, Trash2Icon, MoreHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ThreadSidebarProps {
  currentThreadId: Id<"aiAssistantThreads"> | null;
}

export function ThreadSidebar({ currentThreadId }: ThreadSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const threads = useQuery(api.queries.aiAssistant.listThreads, {
    limit: 50,
  });
  const createThread = useMutation(api.mutations.aiAssistant.createThread);
  const deleteThread = useMutation(api.mutations.aiAssistant.deleteThread);

  const handleCreateThread = async () => {
    try {
      const newThreadId = await createThread({ title: "New Chat" });
      router.push(`?threadId=${newThreadId}`);
      toast.success("New chat created");
    } catch (error) {
      console.error("Error creating thread:", error);
      toast.error("Failed to create new chat");
    }
  };

  const handleDeleteThread = async (threadId: Id<"aiAssistantThreads">) => {
    try {
      await deleteThread({ threadId });
      toast.success("Chat deleted");

      // If we deleted the current thread, redirect to new thread
      if (threadId === currentThreadId) {
        if (threads && threads.length > 1) {
          const otherThread = threads.find((t) => t._id !== threadId);
          if (otherThread) {
            router.push(`?threadId=${otherThread._id}`);
          } else {
            router.push("/");
          }
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Error deleting thread:", error);
      toast.error("Failed to delete chat");
    }
  };

  const handleSelectThread = (threadId: Id<"aiAssistantThreads">) => {
    router.push(`?threadId=${threadId}`);
  };

  return (
    <div className="w-64 border-l bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <ButtonPrimary
          onClick={handleCreateThread}
          className="w-full"
          size="sm"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          New Chat
        </ButtonPrimary>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {threads === undefined ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : threads.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No chats yet. Create a new chat to get started.
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {threads.map((thread) => {
              const isActive = thread._id === currentThreadId;
              return (
                <div
                  key={thread._id}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-lg p-2 text-sm cursor-pointer transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent text-foreground",
                  )}
                  onClick={() => handleSelectThread(thread._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{thread.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(thread.updatedAt, {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className={cn(
                          "opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent transition-opacity",
                          isActive && "opacity-100",
                        )}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                        <span className="sr-only">More options</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteThread(thread._id);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2Icon className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
