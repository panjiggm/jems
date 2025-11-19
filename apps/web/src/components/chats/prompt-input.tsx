"use client";

import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
} from "@/components/ui/ai/prompt-input";
import { MicIcon, PaperclipIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import type { ChatStatus } from "ai";

interface ChatPromptInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  threadId: Id<"aiAssistantThreads"> | null;
  status?: ChatStatus;
  variant?: "initial" | "thread";
}

export function ChatPromptInput({
  input,
  onInputChange,
  onSubmit,
  disabled = false,
  threadId,
  status,
  variant = "thread",
}: ChatPromptInputProps) {
  return (
    <PromptInput
      className={cn(
        "bg-background shadow-lg w-full",
        variant === "thread"
          ? "rounded-t-xl rounded-b-none border-b-0"
          : "rounded-2xl border",
      )}
      onSubmit={onSubmit}
    >
      <PromptInputTextarea
        value={input}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onInputChange(e.currentTarget.value)
        }
        placeholder="Ask whatever you want..."
        disabled={disabled}
        minHeight={48}
        maxHeight={192}
      />
      <PromptInputToolbar>
        <PromptInputTools>
          <PromptInputButton tone="ghost" disabled={!threadId || disabled}>
            <PaperclipIcon size={16} />
          </PromptInputButton>
          <PromptInputButton tone="ghost" disabled={!threadId || disabled}>
            <MicIcon size={16} />
            <span>Voice</span>
          </PromptInputButton>
        </PromptInputTools>
        <PromptInputSubmit
          disabled={!input.trim() || disabled}
          status={status}
        />
      </PromptInputToolbar>
    </PromptInput>
  );
}
