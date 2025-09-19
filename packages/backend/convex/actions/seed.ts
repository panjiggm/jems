"use node";

import { action } from "../_generated/server";

export const seed = action({
  args: {},
  handler: async (ctx) => {
    // This is a placeholder for seeding demo data
    // In a real implementation, you would create sample projects, contents, and tasks
    // For now, we'll just return true to indicate the action exists
    console.log("Seed action called - implement demo data creation here");
    return true;
  },
});
