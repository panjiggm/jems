"use client";

import {
  Conversation,
  ConversationContent,
} from "@/components/ui/ai/conversation";
import { Message, MessageContent } from "@/components/ui/ai/message";
import { Response } from "@/components/ui/ai/response";
import { useMemo, useState, useEffect, useRef } from "react";
import { Loader2Icon } from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import { toast } from "sonner";
import { useQueryState } from "nuqs";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { ChatPromptInput } from "./prompt-input";

type SuggestionItem = {
  id: string;
  title: string;
  description?: string;
};

const defaultSuggestions: SuggestionItem[] = [
  {
    id: "default-1",
    title: "Write a to-do list for a personal project or task",
    description: "Get a structured plan to accomplish your personal goals.",
  },
  {
    id: "default-2",
    title: "Generate an email to reply to a job offer",
    description: "Craft a professional response tailored to your tone.",
  },
  {
    id: "default-3",
    title: "Summarise this article or text for me in one paragraph",
    description: "Quickly understand the key points from any long read.",
  },
  {
    id: "default-4",
    title: "How does AI work in a technical capacity",
    description: "Explore AI fundamentals explained in simple terms.",
  },
];

export default function ChatsComponent() {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const { user } = useUser();
  const [threadId, setThreadId] =
    useQueryState<Id<"aiAssistantThreads"> | null>("threadId", {
      defaultValue: null,
      parse: (value) => (value ? (value as Id<"aiAssistantThreads">) : null),
    });
  const isInitialView = !threadId;
  const displayName = user?.firstName || user?.fullName || "there";
  const scrollRef = useRef<HTMLDivElement>(null);

  // Queries
  const thread = useQuery(
    api.queries.aiAssistant.getThread,
    threadId ? { threadId } : "skip",
  );
  const contentIdeaSuggestions = useQuery(
    api.queries.contentIdeas.getActiveSuggestions,
    !threadId
      ? {
          limit: 4,
        }
      : "skip",
  );
  const suggestions = useMemo(() => {
    if (contentIdeaSuggestions && contentIdeaSuggestions.length > 0) {
      return contentIdeaSuggestions.slice(0, 4).map((idea) => ({
        id: idea._id,
        title: idea.title,
        description: idea.description,
      }));
    }

    return defaultSuggestions;
  }, [contentIdeaSuggestions]);

  // Mutations
  const sendMessage = useMutation(api.mutations.aiAssistant.sendMessage);
  const createThread = useMutation(api.mutations.aiAssistant.createThread);

  // Actions
  const chatWithAI = useAction(api.actions.aiAssistant.chatWithAI);

  const messages = thread?.messages || [];
  const status: "streaming" | "submitted" | undefined = isStreaming
    ? "streaming"
    : isCreatingThread
      ? "submitted"
      : undefined;

  // Auto-scroll to bottom when messages change or streaming (like ChatGPT)
  useEffect(() => {
    if (scrollRef.current && !isInitialView && messages.length > 0) {
      // Use requestAnimationFrame for smoother scrolling during streaming
      const scrollToBottom = () => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      };

      // Immediate scroll for better UX during streaming
      scrollToBottom();

      // Also use smooth scroll for non-streaming updates
      if (!isStreaming) {
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: "smooth",
            });
          }
        });
      }
    }
  }, [messages.length, isStreaming, isInitialView]);

  // Scroll to bottom on thread change
  useEffect(() => {
    if (scrollRef.current && messages.length > 0 && !isInitialView) {
      // Immediate scroll on thread change
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [threadId, isInitialView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const messageText = input.trim();
    setIsStreaming(true);
    setInput("");

    try {
      let activeThreadId = threadId;

      if (!activeThreadId) {
        setIsCreatingThread(true);
        activeThreadId = await createThread({
          title: messageText.substring(0, 50) || "New Chat",
        });
        setThreadId(activeThreadId);
      }

      if (!activeThreadId) {
        throw new Error("Unable to create thread");
      }

      // Send user message
      await sendMessage({
        threadId: activeThreadId,
        content: messageText,
      });

      // Start streaming AI response (runs in background)
      // The response will be saved incrementally to database and
      // frontend will automatically update via Convex real-time queries
      chatWithAI({
        threadId: activeThreadId,
        message: messageText,
      })
        .then(() => {
          // Streaming completed
          toast.success("AI responded successfully");
        })
        .catch((error) => {
          console.error("Error streaming AI response:", error);
          toast.error("Failed to get AI response. Please try again.");
          setInput(messageText);
        })
        .finally(() => {
          setIsStreaming(false);
          setIsCreatingThread(false);
        });
    } catch (error) {
      console.error("Error chatting with AI:", error);
      toast.error("Failed to get AI response. Please try again.");
      setInput(messageText);
      setIsStreaming(false);
      setIsCreatingThread(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] overflow-y-hidden">
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 min-h-0 overflow-y-auto overscroll-contain",
          isInitialView ? "px-4 py-10" : "p-4",
        )}
      >
        <div
          className={cn(
            "max-w-2xl mx-auto container",
            isInitialView ? "h-full" : "",
          )}
        >
          {isInitialView ? (
            <div className="flex h-full flex-col items-center justify-center text-center gap-8">
              <div className="space-y-4 max-w-2xl">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                  AI Assistant
                </p>
                <h3 className="text-3xl font-semibold sm:text-4xl">
                  Hi there,{" "}
                  <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    {displayName}
                  </span>
                </h3>
                <p className="text-2xl font-semibold text-muted-foreground">
                  What would you like to know?
                </p>
                <p className="text-sm text-muted-foreground">
                  Use one of the most common prompts below or type your own to
                  begin the conversation.
                </p>
              </div>

              <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className="rounded-2xl border bg-card/50 p-4 text-left transition hover:border-primary/40 hover:bg-card"
                    onClick={() => setInput(suggestion.title)}
                  >
                    <p className="text-sm font-medium text-primary/70">
                      Suggested prompt
                    </p>
                    <p className="mt-2 text-base font-semibold">
                      {suggestion.title}
                    </p>
                    {suggestion.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {suggestion.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>

              <div className="w-full max-w-xl">
                <ChatPromptInput
                  input={input}
                  onInputChange={setInput}
                  onSubmit={handleSubmit}
                  disabled={isStreaming}
                  threadId={threadId}
                  status={status}
                />
              </div>
            </div>
          ) : (
            <div className="min-h-full pt-6">
              <Conversation>
                <ConversationContent>
                  {messages.map((message) => (
                    <Message from={message.role} key={message._id}>
                      <MessageContent>
                        {message.role === "assistant" ? (
                          <Response parseIncompleteMarkdown={true}>
                            {message.content}
                          </Response>
                        ) : (
                          message.content
                        )}
                      </MessageContent>
                    </Message>
                  ))}
                  {isStreaming &&
                    (!messages.length ||
                      messages[messages.length - 1]?.role !== "assistant") && (
                      <Message from="assistant">
                        <MessageContent>
                          <div className="flex items-center gap-2">
                            <Loader2Icon className="w-4 h-4 animate-spin" />
                            <span>Thinking...</span>
                          </div>
                        </MessageContent>
                      </Message>
                    )}
                </ConversationContent>
              </Conversation>
            </div>
          )}
        </div>
      </div>

      {/* Fixed prompt input at bottom - stays fixed like ChatGPT */}
      {!isInitialView && (
        <div className="bg-background/95 backdrop-blur-sm z-20 shadow-lg">
          <div className="max-w-2xl mx-auto container px-4">
            <ChatPromptInput
              input={input}
              onInputChange={setInput}
              onSubmit={handleSubmit}
              disabled={isStreaming}
              threadId={threadId}
              status={status}
            />
          </div>
        </div>
      )}
    </div>
  );
}
