export const table = {
  loading: "Loading...",
  noData: {
    campaigns: "No campaigns found. Create your first campaign to get started.",
    routines: "No routines found. Create your first routine to get started.",
  },
  columns: {
    select: "Select",
    name: "Name",
    platform: "Platform",
    type: "Type",
    status: "Status",
    notes: "Notes",
    actions: "Actions",
  },
  pagination: {
    selected: "row(s) selected.",
    of: "of",
    previous: "Previous",
    next: "Next",
  },
  aria: {
    selectAll: "Select all",
    selectRow: "Select row",
  },
} as const;
