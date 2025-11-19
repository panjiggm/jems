"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ChatStatus } from "ai";
import { Loader2Icon, SendIcon, SquareIcon, XIcon } from "lucide-react";
import type {
  ComponentProps,
  HTMLAttributes,
  KeyboardEventHandler,
} from "react";
import { Children, useCallback, useEffect, useRef } from "react";
import { ButtonPrimary } from "../button-primary";

export type PromptInputProps = HTMLAttributes<HTMLFormElement>;

export const PromptInput = ({ className, ...props }: PromptInputProps) => (
  <form
    className={cn(
      "w-full divide-y overflow-hidden rounded-xl border bg-background shadow-sm",
      className,
    )}
    {...props}
  />
);

export type PromptInputTextareaProps = ComponentProps<typeof Textarea> & {
  minHeight?: number;
  maxHeight?: number;
};

export const PromptInputTextarea = ({
  onChange,
  className,
  placeholder = "What would you like to know?",
  minHeight = 48,
  maxHeight = 192,
  ...props
}: PromptInputTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    // Calculate the new height based on scrollHeight
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

    textarea.style.height = `${newHeight}px`;

    // Show scrollbar only when content exceeds maxHeight
    if (scrollHeight > maxHeight) {
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.overflowY = "hidden";
    }
  }, [minHeight, maxHeight]);

  useEffect(() => {
    adjustHeight();
  }, [props.value, adjustHeight]);

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Allow newline
        setTimeout(adjustHeight, 0);
        return;
      }

      // Submit on Enter (without Shift)
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    } else {
      // Adjust height on other key presses
      setTimeout(adjustHeight, 0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    setTimeout(adjustHeight, 0);
  };

  return (
    <Textarea
      ref={textareaRef}
      className={cn(
        "w-full resize-none rounded-none border-none p-3 pb-0 shadow-none outline-none ring-0",
        "bg-transparent dark:bg-transparent",
        "focus-visible:ring-0",
        className,
      )}
      style={{
        minHeight: `${minHeight}px`,
        maxHeight: `${maxHeight}px`,
        height: `${minHeight}px`,
        overflowY: "hidden",
      }}
      name="message"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      {...props}
    />
  );
};

export type PromptInputToolbarProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputToolbar = ({
  className,
  ...props
}: PromptInputToolbarProps) => (
  <div
    className={cn("flex items-center justify-between p-1", className)}
    {...props}
  />
);

export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTools = ({
  className,
  ...props
}: PromptInputToolsProps) => (
  <div
    className={cn(
      "flex items-center gap-1",
      "[&_button:first-child]:rounded-bl-xl",
      className,
    )}
    {...props}
  />
);

export type PromptInputButtonProps = ComponentProps<typeof ButtonPrimary>;

export const PromptInputButton = ({
  tone = "solid",
  className,
  size,
  ...props
}: PromptInputButtonProps) => {
  const newSize =
    (size ?? Children.count(props.children) > 1) ? "default" : "icon";

  return (
    <ButtonPrimary
      className={cn(
        "shrink-0 gap-1.5 rounded-lg",
        tone === "ghost" && "text-muted-foreground",
        newSize === "default" && "px-3",
        className,
      )}
      size={newSize}
      type="button"
      tone={tone}
      {...props}
    />
  );
};

export type PromptInputSubmitProps = ComponentProps<typeof ButtonPrimary> & {
  status?: ChatStatus;
};

export const PromptInputSubmit = ({
  className,
  tone = "solid",
  size = "icon",
  status,
  children,
  ...props
}: PromptInputSubmitProps) => {
  let Icon = <SendIcon className="size-4" />;

  if (status === "submitted") {
    Icon = <Loader2Icon className="size-4 animate-spin" />;
  } else if (status === "streaming") {
    Icon = <SquareIcon className="size-4" />;
  } else if (status === "error") {
    Icon = <XIcon className="size-4" />;
  }

  return (
    <ButtonPrimary
      className={cn("gap-1.5 rounded-full", className)}
      size={size}
      type="submit"
      tone={tone}
      {...props}
    >
      {children ?? Icon}
    </ButtonPrimary>
  );
};

export type PromptInputModelSelectProps = ComponentProps<typeof Select>;

export const PromptInputModelSelect = (props: PromptInputModelSelectProps) => (
  <Select {...props} />
);

export type PromptInputModelSelectTriggerProps = ComponentProps<
  typeof SelectTrigger
>;

export const PromptInputModelSelectTrigger = ({
  className,
  ...props
}: PromptInputModelSelectTriggerProps) => (
  <SelectTrigger
    className={cn(
      "border-none bg-transparent font-medium text-muted-foreground shadow-none transition-colors",
      'hover:bg-accent hover:text-foreground [&[aria-expanded="true"]]:bg-accent [&[aria-expanded="true"]]:text-foreground',
      className,
    )}
    {...props}
  />
);

export type PromptInputModelSelectContentProps = ComponentProps<
  typeof SelectContent
>;

export const PromptInputModelSelectContent = ({
  className,
  ...props
}: PromptInputModelSelectContentProps) => (
  <SelectContent className={cn(className)} {...props} />
);

export type PromptInputModelSelectItemProps = ComponentProps<typeof SelectItem>;

export const PromptInputModelSelectItem = ({
  className,
  ...props
}: PromptInputModelSelectItemProps) => (
  <SelectItem className={cn(className)} {...props} />
);

export type PromptInputModelSelectValueProps = ComponentProps<
  typeof SelectValue
>;

export const PromptInputModelSelectValue = ({
  className,
  ...props
}: PromptInputModelSelectValueProps) => (
  <SelectValue className={cn(className)} {...props} />
);
