"use node";

import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { generateSlug, generateUniqueSlug } from "../utils/slug";

export const addSlugsToExistingContent = action({
  args: {},
  handler: async (ctx) => {
    console.log("Starting migration: Adding slugs to existing content...");

    // Get all campaigns without slugs
    const campaignsWithoutSlugs = await ctx.runQuery(
      api.queries.contentCampaigns.getWithoutSlugs,
    );
    console.log(
      `Found ${campaignsWithoutSlugs.length} campaigns without slugs`,
    );

    // Get all routines without slugs
    const routinesWithoutSlugs = await ctx.runQuery(
      api.queries.contentRoutines.getWithoutSlugs,
    );
    console.log(`Found ${routinesWithoutSlugs.length} routines without slugs`);

    let processedCampaigns = 0;
    let processedRoutines = 0;

    // Process campaigns
    for (const campaign of campaignsWithoutSlugs) {
      try {
        // Generate unique slug
        const baseSlug = generateSlug(campaign.title);

        // Get all existing campaign slugs for this user
        const existingCampaigns = await ctx.runQuery(
          api.queries.contentCampaigns.getAllSlugsForUser,
          { userId: campaign.userId },
        );

        const existingCampaignSlugs = existingCampaigns.filter(
          (s): s is string => typeof s === "string" && s.length > 0,
        );

        const slug = generateUniqueSlug(baseSlug, existingCampaignSlugs);

        // Update campaign with slug
        await ctx.runMutation(api.mutations.contentCampaigns.addSlug, {
          id: campaign._id,
          slug,
        });

        processedCampaigns++;
        console.log(`Updated campaign: ${campaign.title} -> ${slug}`);
      } catch (error) {
        console.error(`Error updating campaign ${campaign._id}:`, error);
      }
    }

    // Process routines
    for (const routine of routinesWithoutSlugs) {
      try {
        // Generate unique slug
        const baseSlug = generateSlug(routine.title);

        // Get all existing routine slugs for this user
        const existingRoutines = await ctx.runQuery(
          api.queries.contentRoutines.getAllSlugsForUser,
          { userId: routine.userId },
        );

        const existingRoutineSlugs = existingRoutines.filter(
          (s): s is string => typeof s === "string" && s.length > 0,
        );

        const slug = generateUniqueSlug(baseSlug, existingRoutineSlugs);

        // Update routine with slug
        await ctx.runMutation(api.mutations.contentRoutines.addSlug, {
          id: routine._id,
          slug,
        });

        processedRoutines++;
        console.log(`Updated routine: ${routine.title} -> ${slug}`);
      } catch (error) {
        console.error(`Error updating routine ${routine._id}:`, error);
      }
    }

    console.log(
      `Migration completed: ${processedCampaigns} campaigns, ${processedRoutines} routines processed`,
    );

    return {
      campaignsProcessed: processedCampaigns,
      routinesProcessed: processedRoutines,
      totalProcessed: processedCampaigns + processedRoutines,
    };
  },
});
