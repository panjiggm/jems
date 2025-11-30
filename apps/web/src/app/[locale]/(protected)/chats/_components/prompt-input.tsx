"use client";

import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
} from "@/components/ui/ai/prompt-input";
import { PaperclipIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import type { ChatStatus } from "ai";
import { useTranslations } from "@/hooks/use-translations";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface ChatPromptInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  threadId: Id<"aiAssistantThreads"> | null;
  status?: ChatStatus;
}

export function ChatPromptInput({
  input,
  onInputChange,
  onSubmit,
  disabled = false,
  threadId,
  status,
}: ChatPromptInputProps) {
  const { t } = useTranslations();

  return (
    <PromptInput
      className={cn(
        "bg-background shadow-lg w-full mb-2",
        "rounded-2xl border",
      )}
      onSubmit={onSubmit}
    >
      <PromptInputTextarea
        value={input}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onInputChange(e.currentTarget.value)
        }
        placeholder={t("chats.input.placeholder")}
        disabled={disabled}
        minHeight={40}
        maxHeight={192}
      />
      <PromptInputToolbar>
        <PromptInputTools>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <PromptInputButton
                  tone="ghost"
                  disabled={!threadId || disabled}
                >
                  <PaperclipIcon size={16} />
                </PromptInputButton>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("chats.input.attachmentTooltip")}</p>
            </TooltipContent>
          </Tooltip>
        </PromptInputTools>
        <PromptInputSubmit
          disabled={!input.trim() || disabled}
          status={status}
        />
      </PromptInputToolbar>
    </PromptInput>
  );
}
