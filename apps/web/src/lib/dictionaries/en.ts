export const dictionary = {
  // Navigation
  nav: {
    title: "Holobiont",
    home: "Home",
    dashboard: "Dashboard",
    projects: "Projects",
    schedules: "Schedules",
    askAI: "Ask AI",
    settings: "Settings",
    templates: "Templates",
    trash: "Trash",
    help: "Help",
    signIn: "Sign In",
    signUp: "Sign Up",
    gettingStarted: "Getting Started",
    blog: "Blog",
    about: "About",
    contactUs: "Contact Us",
  },

  // Homepage
  home: {
    title: "Holobiont",
    subtitle: "Empowering your WHY — with soulful AI",
    hero: {
      badge: "Launch Soon • Version 0.1.0",
      title: "Empowering your",
      titleHighlight: "WHY",
      titleSuffix: ", — with soulful AI",
      description:
        "Holobiont is an AI platform that understands how you think — your most loyal friend that supports your values and goals.",
      cta: "Get Started",
    },
    features: {
      title: "Key Features",
      fileManagement: {
        title: "File Management",
        description:
          "Store briefs, assets, and drafts in one place—searchable, secure, and share-ready.",
      },
      aiAssistant: {
        title: "AI Personal Assistant",
        description:
          "Brainstorm ideas, write scripts/VO, and get smart suggestions tailored to your niche.",
      },
      organizeContent: {
        title: "Organize Content & Scheduling",
        description:
          "Plan projects, track statuses, and schedule posts with reminders that keep you on pace.",
      },
    },
  },

  // Common
  common: {
    loading: "Loading...",
    error: "An error occurred",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    next: "Next",
    previous: "Previous",
    close: "Close",
    open: "Open",
    yes: "Yes",
    no: "No",
    terms: "Terms",
    policy: "Policy",
    contact: "Contact",
    free: "Free",
  },

  // Auth
  auth: {
    signIn: "Sign in to your account",
    signUp: "Create a new account",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot password?",
    rememberMe: "Remember me",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
  },

  // Onboarding
  onboarding: {
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
      description:
        "Please try again or contact support if the problem persists.",
    },
  },
} as const;
