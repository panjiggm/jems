export const project = {
  search: {
    placeholder: "Search contents...",
    filters: "Filters",
    clearAll: "Clear all",
    platform: "Platform",
    status: "Status",
    type: "Type",
    campaignType: "Campaign Type",
  },
  views: {
    table: "Table",
    kanban: "Kanban",
    list: "List",
    calendar: "Calendar",
    display: "Display",
  },
  platforms: {
    tiktok: "TikTok",
    instagram: "Instagram",
    youtube: "YouTube",
    x: "X (Twitter)",
    facebook: "Facebook",
    threads: "Threads",
    other: "Other",
  },
  campaignTypes: {
    barter: "Barter",
    paid: "Paid",
  },
  status: {
    productObtained: "Product Obtained",
    production: "Production",
    published: "Published",
    payment: "Payment",
    done: "Done",
    plan: "Plan",
    inProgress: "In Progress",
    scheduled: "Scheduled",
  },
  viewMessages: {
    kanban: {
      title: "Kanban View",
      description:
        "Drag and drop your content across different columns to manage your workflow.",
    },
    list: {
      title: "List View",
      description: "Please select a project to view contents in list format.",
    },
    table: {
      title: "Table View",
      description: "Please select a project to view contents in table format.",
    },
    calendar: {
      title: "Calendar View",
      description: "Calendar view coming soon...",
    },
  },
} as const;
