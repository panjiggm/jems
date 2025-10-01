"use client";

import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectValue,
} from "@/components/ui/ai/prompt-input";
import {
  Conversation,
  ConversationContent,
} from "@/components/ui/ai/conversation";
import { Message, MessageContent } from "@/components/ui/ai/message";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { MicIcon, PaperclipIcon } from "lucide-react";
import { DefaultChatTransport } from "ai";
import { ButtonPrimary } from "../ui/button-primary";

const models = [
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
];

export default function ChatsComponent() {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(models[0].id);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <MicIcon className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Start a conversation</h3>
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
                <Message from={message.role} key={message.id}>
                  {message.parts.map((part, index) =>
                    part.type === "text" ? (
                      <MessageContent key={index}>{part.text}</MessageContent>
                    ) : null,
                  )}
                </Message>
              ))}
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
        />
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputButton tone="ghost">
              <PaperclipIcon size={16} />
            </PromptInputButton>
            <PromptInputButton tone="ghost">
              <MicIcon size={16} />
              <span>Voice</span>
            </PromptInputButton>
            <PromptInputModelSelect
              value={selectedModel}
              onValueChange={setSelectedModel}
            >
              <PromptInputModelSelectTrigger>
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {models.map((model) => (
                  <PromptInputModelSelectItem key={model.id} value={model.id}>
                    {model.name}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect>
          </PromptInputTools>
          <PromptInputSubmit disabled={!input.trim()} status={status} />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}
