/**
 * Content Types
 * Based on schema: contentCampaigns & contentRoutines
 */
export type ContentType = "campaign" | "routine";

/**
 * Campaign Types (barter/paid)
 * From schema.contentCampaigns.type
 */
export type ContentCampaignType = "barter" | "paid";

/**
 * Campaign Status Flow
 * From schema.contentCampaigns.status
 * Flow: product_obtained → production → published → payment → done
 */
export type ContentCampaignStatus =
  | "product_obtained" // Product received from brand
  | "production" // Creating the content
  | "published" // Content is live
  | "payment" // Awaiting/processing payment
  | "done"; // Campaign completed

/**
 * Routine Status Flow
 * From schema.contentRoutines.status
 * Flow: plan → in_progress → scheduled → published
 */
export type ContentRoutineStatus =
  | "plan" // Planning stage
  | "in_progress" // Actively working on it
  | "scheduled" // Scheduled for posting
  | "published"; // Content is live

/**
 * Campaign statuses in workflow order
 */
export const CAMPAIGN_STATUSES: readonly ContentCampaignStatus[] = [
  "product_obtained",
  "production",
  "published",
  "payment",
  "done",
] as const;

/**
 * Routine statuses in workflow order
 */
export const ROUTINE_STATUSES: readonly ContentRoutineStatus[] = [
  "plan",
  "in_progress",
  "scheduled",
  "published",
] as const;

/**
 * Status mapping by content type
 */
export const STATUS_BY_TYPE: Record<ContentType, readonly string[]> = {
  campaign: CAMPAIGN_STATUSES,
  routine: ROUTINE_STATUSES,
} as const;

// Labels for UI (can be i18n)
export const STATUS_LABELS: Record<string, string> = {
  // Campaign statuses
  product_obtained: "Product Obtained",
  production: "Production",
  payment: "Payment",

  // Routine statuses
  plan: "Plan",
  in_progress: "In Progress",

  // Shared statuses
  scheduled: "Scheduled",
  published: "Published",
  done: "Done",
};

/**
 * Campaign type labels for UI
 */
export const CAMPAIGN_TYPE_LABELS: Record<ContentCampaignType, string> = {
  barter: "Barter",
  paid: "Paid",
};

/**
 * Platform types
 * From schema (used in both campaigns and routines)
 */
export type Platform =
  | "tiktok"
  | "instagram"
  | "youtube"
  | "x"
  | "facebook"
  | "threads"
  | "other";

/**
 * Helper type to get status type based on content type
 */
export type StatusForContentType<T extends ContentType> = T extends "campaign"
  ? ContentCampaignStatus
  : ContentRoutineStatus;

/**
 * Combined status type (all possible statuses)
 */
export type AllContentStatus = ContentCampaignStatus | ContentRoutineStatus;

/**
 * Status transition mapping (for statusDurations feature)
 * Example: "product_obtained->production" means transition from product_obtained to production
 */
export type CampaignStatusTransition =
  | "product_obtained->production"
  | "production->published"
  | "published->payment"
  | "payment->done";

export type RoutineStatusTransition =
  | "plan->in_progress"
  | "in_progress->scheduled"
  | "scheduled->published";

/**
 * Status history entry structure
 * Matches schema.contentCampaigns.statusHistory and schema.contentRoutines.statusHistory
 */
export interface StatusHistoryEntry {
  status: string;
  timestamp: number;
  scheduledAt?: string; // For routines when status=scheduled
  publishedAt?: string; // For campaigns/routines when status=published
  note?: string;
}

/**
 * Status duration format: number + unit (d=days, h=hours, m=minutes)
 * Examples: "2d", "4h", "30m"
 */
export type DurationString = `${number}${"d" | "h" | "m"}`;

/**
 * Status durations mapping
 * Maps status transitions to expected duration
 */
export type StatusDurations = Record<string, DurationString>;

/**
 * Platform labels for UI
 */
export const PLATFORM_LABELS: Record<Platform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X (Twitter)",
  facebook: "Facebook",
  threads: "Threads",
  other: "Other",
};
