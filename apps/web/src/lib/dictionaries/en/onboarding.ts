export const onboarding = {
  title: "Onboarding",
  step: "Step",
  of: "of",
  percent: "%",
  settingUp: "Setting up your profile...",
  creatingAssistant: "We're creating your personalized AI assistant",
  welcome: {
    title: "Welcome to Holobiont! 🎉",
    description:
      "This quick setup will help us understand your interests and preferences. It's only takes",
    time: "2-3 minutes",
    cta: "Let's Get Started!",
  },
  profile: {
    title: "Fill Your Profile! 👤",
    description: "Fill basic information to set up your profile",
    fullName: "Full Name",
    fullNamePlaceholder: "Enter your full name",
    fullNameRequired: "Full name is required",
    fullNameMinLength: "Full name must be at least 2 characters",
    phone: "Phone Number",
    phonePlaceholder: "Enter your phone number",
    phoneRequired: "Phone number is required",
    phoneInvalid: "Please enter a valid phone number",
    phoneMinLength: "Phone number must be at least 10 digits",
    phoneHelp:
      "Include country code if outside Indonesia (e.g., +62 812 3456 7890)",
  },
  categories: {
    title: "Choose Your Interest Categories 🎯",
    description: "Select up to",
    maxCategories: "Categories that interest you most",
    selected: "Selected Categories",
    max: "max",
  },
  niches: {
    title: "Select Your Specific Niches 🎭",
    description: "Choose up to",
    maxNiches: "Specific niches you want to focus on",
    selected: "Selected Niches",
  },
  bio: {
    title: "Write Your Bio ✨",
    generateBio: "Generate Bio with AI",
    generating: "AI Agent is creating...",
    label: "Bio",
    placeholder:
      "Tell us about yourself, your experience, your passions, and what drives you...",
    required: "Bio is required",
    minLength: "Bio must be at least",
    maxLength: "Bio must be no more than",
    characters: "characters",
    moreNeeded: "more characters needed",
    goodLength: "✓ Good length",
    generateError:
      "Failed to generate bio. Please try again or write your own.",
  },
  navigation: {
    previous: "Previous",
    next: "Next",
    complete: "Complete Setup",
  },
  success: {
    title: "🎉 Welcome to Holobiont!",
    description: "Your profile has been set up successfully.",
  },
  error: {
    title: "Failed to complete setup",
    description: "Please try again or contact support if the problem persists.",
  },
  logout: "Log out",
} as const;
