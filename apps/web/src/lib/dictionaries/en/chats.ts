export const chats = {
  title: "AI Assistant",
  greeting: "Hi there",
  greetingSuffix: "what would you like to know?",
  subtitle: "Use one of the most common prompts below or type your own to begin the conversation.",
  suggestedPrompt: "Suggested prompt",
  defaultSuggestions: {
    todo: {
      title: "Write a to-do list for a personal project or task",
      description: "Get a structured plan to accomplish your personal goals.",
    },
    email: {
      title: "Generate an email to reply to a job offer",
      description: "Craft a professional response tailored to your tone.",
    },
    summarize: {
      title: "Summarise this article or text for me in one paragraph",
      description: "Quickly understand the key points from any long read.",
    },
  },
  messages: {
    thinking: "Thinking...",
    aiRespondedSuccess: "AI responded successfully",
    aiResponseError: "Failed to get AI response. Please try again.",
    newChat: "New Chat",
  },
  input: {
    placeholder: "Ask whatever you want...",
    attachmentTooltip: "Not Available yet",
  },
} as const;

