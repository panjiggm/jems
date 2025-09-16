import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all niches grouped by category
export const getNichesByCategory = query({
  args: {},
  handler: async (ctx) => {
    const niches = await ctx.db.query("niches").collect();

    // Group niches by category
    const nichesByCategory = niches.reduce(
      (acc, niche) => {
        if (!acc[niche.category]) {
          acc[niche.category] = [];
        }
        acc[niche.category].push(niche);
        return acc;
      },
      {} as Record<string, typeof niches>,
    );

    return nichesByCategory;
  },
});

// Get unique categories
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const niches = await ctx.db.query("niches").collect();
    const categories = [...new Set(niches.map((niche) => niche.category))];
    return categories.sort();
  },
});

// Get niches by specific categories
export const getNichesByCategories = query({
  args: {
    categories: v.array(v.string()),
  },
  handler: async (ctx, { categories }) => {
    const niches = await ctx.db.query("niches").collect();
    return niches.filter((niche) => categories.includes(niche.category));
  },
});

// Get niches by IDs
export const getNichesByIds = query({
  args: {
    nicheIds: v.array(v.id("niches")),
  },
  handler: async (ctx, { nicheIds }) => {
    const niches = await Promise.all(nicheIds.map((id) => ctx.db.get(id)));
    return niches.filter(Boolean);
  },
});

// Get single niche by ID (internal function for OpenAI)
export const getNicheById = query({
  args: {
    id: v.id("niches"),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getInternalNicheById = internalQuery({
  args: {
    id: v.id("niches"),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// Seed initial niches data (for development)
export const seedNiches = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if niches already exist
    const existingNiches = await ctx.db.query("niches").first();
    if (existingNiches) {
      return "Niches already seeded";
    }

    const sampleNiches = [
      // Technology
      {
        slug: "web-development",
        label: "Web Development",
        category: "Technology",
        description: "Building websites and web applications",
      },
      {
        slug: "mobile-development",
        label: "Mobile Development",
        category: "Technology",
        description: "Creating mobile apps for iOS and Android",
      },
      {
        slug: "ai-machine-learning",
        label: "AI & Machine Learning",
        category: "Technology",
        description: "Artificial intelligence and machine learning",
      },
      {
        slug: "data-science",
        label: "Data Science",
        category: "Technology",
        description: "Data analysis and insights",
      },
      {
        slug: "cybersecurity",
        label: "Cybersecurity",
        category: "Technology",
        description: "Digital security and protection",
      },
      {
        slug: "blockchain",
        label: "Blockchain",
        category: "Technology",
        description: "Distributed ledger technology",
      },

      // Business
      {
        slug: "entrepreneurship",
        label: "Entrepreneurship",
        category: "Business",
        description: "Starting and running businesses",
      },
      {
        slug: "marketing",
        label: "Marketing",
        category: "Business",
        description: "Promoting products and services",
      },
      {
        slug: "sales",
        label: "Sales",
        category: "Business",
        description: "Selling products and services",
      },
      {
        slug: "finance",
        label: "Finance",
        category: "Business",
        description: "Financial management and investment",
      },
      {
        slug: "project-management",
        label: "Project Management",
        category: "Business",
        description: "Managing projects and teams",
      },
      {
        slug: "consulting",
        label: "Consulting",
        category: "Business",
        description: "Providing expert advice",
      },

      // Creative
      {
        slug: "graphic-design",
        label: "Graphic Design",
        category: "Creative",
        description: "Visual design and branding",
      },
      {
        slug: "photography",
        label: "Photography",
        category: "Creative",
        description: "Capturing moments and stories",
      },
      {
        slug: "writing",
        label: "Writing",
        category: "Creative",
        description: "Content creation and storytelling",
      },
      {
        slug: "video-production",
        label: "Video Production",
        category: "Creative",
        description: "Creating video content",
      },
      {
        slug: "music",
        label: "Music",
        category: "Creative",
        description: "Music creation and performance",
      },
      {
        slug: "art",
        label: "Art",
        category: "Creative",
        description: "Visual and fine arts",
      },

      // Health & Wellness
      {
        slug: "fitness",
        label: "Fitness",
        category: "Health & Wellness",
        description: "Physical fitness and exercise",
      },
      {
        slug: "nutrition",
        label: "Nutrition",
        category: "Health & Wellness",
        description: "Diet and healthy eating",
      },
      {
        slug: "mental-health",
        label: "Mental Health",
        category: "Health & Wellness",
        description: "Mental wellness and therapy",
      },
      {
        slug: "yoga",
        label: "Yoga",
        category: "Health & Wellness",
        description: "Yoga practice and teaching",
      },
      {
        slug: "meditation",
        label: "Meditation",
        category: "Health & Wellness",
        description: "Mindfulness and meditation",
      },

      // Education
      {
        slug: "teaching",
        label: "Teaching",
        category: "Education",
        description: "Education and instruction",
      },
      {
        slug: "online-courses",
        label: "Online Courses",
        category: "Education",
        description: "Creating educational content",
      },
      {
        slug: "tutoring",
        label: "Tutoring",
        category: "Education",
        description: "One-on-one instruction",
      },
      {
        slug: "language-learning",
        label: "Language Learning",
        category: "Education",
        description: "Learning and teaching languages",
      },
    ];

    await Promise.all(
      sampleNiches.map((niche) => ctx.db.insert("niches", niche)),
    );

    return `Seeded ${sampleNiches.length} niches`;
  },
});
