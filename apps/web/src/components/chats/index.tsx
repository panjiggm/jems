"use client";

import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
} from "@/components/ui/ai/prompt-input";
import {
  Conversation,
  ConversationContent,
} from "@/components/ui/ai/conversation";
import { Message, MessageContent } from "@/components/ui/ai/message";
import { useState, useEffect } from "react";
import { MicIcon, PaperclipIcon, Loader2Icon } from "lucide-react";
import { ButtonPrimary } from "../ui/button-primary";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import { ThreadSidebar } from "./thread-sidebar";

export default function ChatsComponent() {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadIdParam = searchParams.get("threadId");
  const threadId = threadIdParam
    ? (threadIdParam as Id<"aiAssistantThreads">)
    : null;

  // Queries
  const thread = useQuery(
    api.queries.aiAssistant.getThread,
    threadId ? { threadId } : "skip",
  );

  // Mutations
  const createThread = useMutation(api.mutations.aiAssistant.createThread);
  const sendMessage = useMutation(api.mutations.aiAssistant.sendMessage);

  // Actions
  const chatWithAI = useAction(api.actions.aiAssistant.chatWithAI);

  // Create initial thread if none exists
  useEffect(() => {
    if (!threadId && !thread) {
      createThread({ title: "New Chat" }).then((newThreadId) => {
        router.push(`?threadId=${newThreadId}`);
      });
    }
  }, [threadId, thread, createThread, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !threadId || isStreaming) return;

    const messageText = input.trim();
    setInput("");
    setIsStreaming(true);

    try {
      // Send user message
      await sendMessage({
        threadId,
        content: messageText,
      });

      // Get AI response
      const response = await chatWithAI({
        threadId,
        message: messageText,
      });

      if (response.response) {
        // Response is already saved in the database by the action
        toast.success("AI responded successfully");
      }
    } catch (error) {
      console.error("Error chatting with AI:", error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsStreaming(false);
    }
  };

  const messages = thread?.messages || [];
  const status: "streaming" | "submitted" | undefined = isStreaming
    ? "streaming"
    : undefined;

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <MicIcon className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    Start a conversation
                  </h3>
                  <p className="text-muted-foreground text-xs max-w-md mx-auto">
                    Ask me anything! I&apos;m here to help you with your
                    questions, brainstorm ideas, or have a friendly chat.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center pt-4">
                  <ButtonPrimary
                    tone={"outline"}
                    size={"sm"}
                    onClick={() => {
                      setInput("What can you help me with?");
                    }}
                  >
                    What can you help me with?
                  </ButtonPrimary>
                  <ButtonPrimary
                    tone={"outline"}
                    size={"sm"}
                    onClick={() => {
                      setInput("Tell me a creative story");
                    }}
                  >
                    Tell me a creative story
                  </ButtonPrimary>
                  <ButtonPrimary
                    tone={"outline"}
                    size={"sm"}
                    onClick={() => {
                      setInput("Help me brainstorm ideas");
                    }}
                  >
                    Help me brainstorm ideas
                  </ButtonPrimary>
                </div>
              </div>
            </div>
          ) : (
            <Conversation>
              <ConversationContent>
                {messages.map((message) => (
                  <Message from={message.role} key={message._id}>
                    <MessageContent>{message.content}</MessageContent>
                  </Message>
                ))}
                {isStreaming && (
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
          )}
        </div>

        <PromptInput
          className="shadow-lg border-t bg-background rounded-t-xl rounded-b-none border-b-0"
          onSubmit={handleSubmit}
        >
          <PromptInputTextarea
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setInput(e.currentTarget.value)
            }
            placeholder="Type your message..."
            disabled={!threadId || isStreaming}
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputButton
                tone="ghost"
                disabled={!threadId || isStreaming}
              >
                <PaperclipIcon size={16} />
              </PromptInputButton>
              <PromptInputButton
                tone="ghost"
                disabled={!threadId || isStreaming}
              >
                <MicIcon size={16} />
                <span>Voice</span>
              </PromptInputButton>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!input.trim() || !threadId || isStreaming}
              status={status}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>

      {/* Thread Sidebar */}
      <ThreadSidebar currentThreadId={threadId} />
    </div>
  );
}
