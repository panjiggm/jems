"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import { ButtonPrimary } from "./ui/button-primary";
import { PlusIcon, Trash2Icon, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface SidebarRightProps {
  currentThreadId: Id<"aiAssistantThreads"> | null;
}

export function SidebarRight({ currentThreadId }: SidebarRightProps) {
  const router = useRouter();
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
    <Sidebar side="right" className="border-l">
      <SidebarHeader className="p-4 border-b">
        <ButtonPrimary
          onClick={handleCreateThread}
          className="w-full"
          size="sm"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          New Chat
        </ButtonPrimary>
      </SidebarHeader>

      <SidebarContent>
        {threads === undefined ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : threads.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No chats yet. Create a new chat to get started.
          </div>
        ) : (
          <SidebarMenu>
            {threads.map((thread) => {
              const isActive = thread._id === currentThreadId;
              return (
                <SidebarMenuItem key={thread._id}>
                  <SidebarMenuButton
                    onClick={() => handleSelectThread(thread._id)}
                    isActive={isActive}
                    className="flex flex-col items-start gap-1 h-auto py-2"
                  >
                    <span className="font-medium truncate w-full">
                      {thread.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(thread.updatedAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SidebarMenuAction
                        showOnHover
                        className={cn(
                          "opacity-0 group-hover/menu-item:opacity-100 transition-opacity",
                          isActive && "opacity-100",
                        )}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                        <span className="sr-only">More options</span>
                      </SidebarMenuAction>
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
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
