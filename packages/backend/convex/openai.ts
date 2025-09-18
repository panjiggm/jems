import { OpenAI } from "openai";
import {
  action,
  internalAction,
  internalMutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
  baseURL: process.env.OPENAI_BASE_URL as string,
});

export const openaiKeySet = query({
  args: {},
  handler: async () => {
    return !!process.env.OPENAI_API_KEY;
  },
});

// Generate AI prompt for persona
export const generatePersonaPrompt = internalAction({
  args: {
    full_name: v.string(),
    bio: v.string(),
    niches: v.array(
      v.object({
        label: v.string(),
        category: v.string(),
      }),
    ),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, { full_name, bio, niches, locale }) => {
    // Determine language based on locale
    const isIndonesian = locale === "id";

    const nicheDetails = niches
      .map((niche) => `${niche.label} - (${niche.category})`)
      .join("\n");

    const prompt = isIndonesian
      ? `Buatkan prompt persona untuk asisten AI berdasarkan profil pengguna ini:

Nama Lengkap: ${full_name}

Bio: ${bio}

Detail Niche:
${nicheDetails}

Buatkan prompt persona yang detail yang akan membantu asisten AI memahami orang ini:
1. Bantu orang ini menemukan ide yang terkait dengan bio, niche dan kategori mereka untuk membuat konten
2. Pahami nama lengkap, bio dan niche orang ini
3. Berikan saran dan wawasan yang relevan untuk niche dan kategori mereka

Prompt harus komprehensif dan mencakup hal-hal berikut:
- Orang ini adalah Content Creator
- Nama lengkap mereka
- Bio mereka
- Niche dan kategori mereka
- Bagaimana AI harus berinteraksi dengan mereka

Tulis ini sebagai system prompt yang akan digunakan untuk menginstruksikan asisten AI.`
      : `Create a persona prompt for an AI assistant based on this user profile:

Full Name: ${full_name}

Bio: ${bio}

Niche Details:
${nicheDetails}

Generate a detailed persona prompt that will help an AI assistant understand this person:
1. Help this person to find ideas related to their bio, niches and their category to create content
2. Understand this person's full name, bio and niches
3. Provide relevant advice and insights for their niches and their category

The prompt should be comprehensive and include the following:
- This person is Content Creator
- Their full name
- Their bio
- Their niches and their category
- How the AI should interact with them

Write this as a system prompt that will be used to instruct an AI assistant.`;

    const systemPrompt = isIndonesian
      ? "Kamu adalah ahli dalam membuat prompt persona AI yang membantu asisten AI memberikan respons yang dipersonalisasi dan relevan. Maksimal 1500 karakter."
      : "You are an expert at creating AI persona prompts that help AI assistants provide personalized and relevant responses. max 1500 characters";

    const output = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        { role: "user", content: prompt },
      ],
      model: "gpt-4o-mini",
    });

    const aiPrompt = output.choices[0]?.message.content?.trim();

    return aiPrompt || "";
  },
});

// Public action to generate bio (direct call, not scheduled)
export const generateBioAction = action({
  args: {
    categories: v.array(v.string()),
    nicheIds: v.array(v.id("niches")),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    // Get niche names for better context
    const nicheNames =
      args.nicheIds.length > 0
        ? await Promise.all(
            args.nicheIds.map((id) =>
              ctx.runQuery(internal.niches.getInternalNicheById, { id }),
            ),
          ).then((niches) =>
            niches
              .filter(Boolean)
              .map((n: any) => n.label)
              .join(", "),
          )
        : "";

    // Determine language based on locale
    const isIndonesian = args.locale === "id";

    const systemPrompt = isIndonesian
      ? "Kamu adalah penulis bio yang membantu. Buatkan bio untuk profil berdasarkan kategori dan niche yang diberikan. Maksimal 400 karakter. Tulis dalam bahasa Indonesia yang natural dan menarik."
      : "You are a helpful bio writer. Create a bio for a profile based on the categories and niches. Max 400 characters. Write in natural and engaging language.";

    const userPrompt = isIndonesian
      ? `Ini adalah kategoriku: ${args.categories.join(", ")} dan 
${nicheNames ? ` niche-ku: ${nicheNames}` : ""}. Buatkan bio yang menarik dan profesional berdasarkan informasi ini.`
      : `This is my categories: ${args.categories.join(", ")} and 
${nicheNames ? ` my niches: ${nicheNames}` : ""}. Create an engaging and professional bio based on this information.`;

    const output = await openai.chat.completions.create({
      messages: [
        {
          role: "system" as const,
          content: systemPrompt,
        },
        { role: "user" as const, content: userPrompt },
      ],
      model: "gpt-4o-mini",
    });

    const messageContent = output.choices[0]?.message.content?.trim();
    return (
      messageContent ||
      (isIndonesian
        ? "Tidak dapat membuat bio saat ini. Silakan coba lagi."
        : "Unable to generate bio at this time.")
    );
  },
});
