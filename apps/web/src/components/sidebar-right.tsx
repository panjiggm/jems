"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  Sidebar,
} from "@/components/ui/sidebar";
import { ButtonPrimary } from "./ui/button-primary";
import { PlusIcon, Trash2Icon, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type SidebarRightContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setIsOpen: (open: boolean) => void;
};

const SidebarRightContext =
  React.createContext<SidebarRightContextValue | null>(null);

export function SidebarRightProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  const value = React.useMemo(
    () => ({
      isOpen,
      setIsOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [isOpen],
  );

  return (
    <SidebarRightContext.Provider value={value}>
      {children}
    </SidebarRightContext.Provider>
  );
}

const isChatsRoute = (pathname?: string | null) => {
  if (!pathname) return false;
  const segments = pathname.split("/").filter(Boolean);
  return segments.includes("chats");
};

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isChatPage = isChatsRoute(pathname);
  const threadIdParam = searchParams?.get("threadId");
  const currentThreadId = threadIdParam
    ? (threadIdParam as Id<"aiAssistantThreads">)
    : null;
  const locale = (params?.locale as string) || "";
  const chatsBasePath = locale ? `/${locale}/chats` : "/chats";

  const threads = useQuery(
    api.queries.aiAssistant.listThreads,
    isChatPage
      ? {
          limit: 50,
        }
      : "skip",
  );
  const createThread = useMutation(api.mutations.aiAssistant.createThread);
  const deleteThread = useMutation(api.mutations.aiAssistant.deleteThread);

  if (!isChatPage) {
    return null;
  }

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

      if (threadId === currentThreadId) {
        if (threads && threads.length > 1) {
          const otherThread = threads.find((t) => t._id !== threadId);
          if (otherThread) {
            router.push(`?threadId=${otherThread._id}`);
          } else {
            router.push(chatsBasePath);
          }
        } else {
          router.push(chatsBasePath);
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
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex"
      {...props}
    >
      <SidebarHeader className="px-4 py-4 border-b shrink-0">
        <ButtonPrimary
          onClick={handleCreateThread}
          className="w-full"
          size="sm"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          New Chat
        </ButtonPrimary>
      </SidebarHeader>

      <SidebarContent className="w-full flex-1 min-h-0 overflow-y-auto">
        {threads === undefined ? (
          <div className="px-4 py-4 text-center text-sm text-muted-foreground">
            Loading chats...
          </div>
        ) : threads.length === 0 ? (
          <div className="px-4 py-4 text-center text-sm text-muted-foreground">
            No chats yet. Create a new chat to get started.
          </div>
        ) : (
          <SidebarMenu className="w-full">
            {threads.map((thread) => {
              const isActive = thread._id === currentThreadId;
              return (
                <SidebarMenuItem key={thread._id} className="w-full">
                  <SidebarMenuButton
                    onClick={() => handleSelectThread(thread._id)}
                    isActive={isActive}
                    className="flex h-auto flex-col items-start gap-1 px-4 py-2 w-full"
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
                          "opacity-0 transition-opacity group-hover/menu-item:opacity-100",
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
