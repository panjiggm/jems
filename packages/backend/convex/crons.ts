import { internal } from "./_generated/api";
import { cronJobs } from "convex/server";

const crons = cronJobs();

// Run daily at 00:00 UTC to generate new content suggestions
crons.interval(
  "regenerateDailySuggestions",
  { hours: 24 }, // Run every 24 hours
  internal.crons.dailySuggestions.regenerateForAllUsers,
  {},
);

export default crons;
