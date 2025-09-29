export type ContentType = "campaign" | "series" | "routine";

// kunci status (canonical keys)
export const STATUS_BY_TYPE: Record<ContentType, readonly string[]> = {
  campaign: [
    "confirmed",
    "shipped",
    "received",
    "shooting",
    "editing",
    "drafting",
    "done",
    "pending_payment",
    "paid",
    "canceled",
  ],
  series: [
    "ideation",
    "scripting",
    "shooting",
    "editing",
    "scheduled",
    "published",
    "archived",
    "canceled",
  ],
  routine: [
    "planned",
    "drafting",
    "shooting",
    "editing",
    "scheduled",
    "published",
    "skipped",
    "canceled",
  ],
} as const;

// optional: label untuk UI (bisa di-i18n)
export const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  shipped: "Shipped",
  received: "Received",
  shooting: "Shooting",
  drafting: "Drafting",
  editing: "Editing",
  done: "Done",
  pending_payment: "Pending Payment",
  paid: "Paid",
  canceled: "Canceled",

  ideation: "Ideation",
  scripting: "Scripting",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",

  planned: "Planned",
  skipped: "Skipped",
};
