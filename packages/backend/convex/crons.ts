import { internal } from "./_generated/api";
import { cronJobs } from "convex/server";

const crons = cronJobs();

// Cron 1: Generate 3 content suggestions daily for all users
// Run daily at 00:00 UTC to generate new content suggestions
crons.interval(
  "regenerateDailySuggestions",
  { hours: 24 }, // Run every 24 hours
  internal.crons.dailySuggestions.regenerateForAllUsers,
  {},
);

// Cron 2: Delete old content suggestions that are older than 24 hours
// Run every hour to clean up old suggestions
crons.interval(
  "deleteOldSuggestions",
  { hours: 1 }, // Run every hour to catch suggestions that passed 24 hours
  internal.crons.dailySuggestions.deleteOldSuggestionsForAllUsers,
  {},
);

export default crons;
