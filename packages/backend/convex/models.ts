import { type EmbeddingModel } from "ai";
import type { LanguageModelV2 } from "@ai-sdk/provider";
import { openai } from "@ai-sdk/openai";
import { mockModel } from "@convex-dev/agent";

let languageModel: LanguageModelV2;
let textEmbeddingModel: EmbeddingModel<string>;

if (process.env.OPENAI_API_KEY) {
  languageModel = openai.chat("gpt-5-nano");
  textEmbeddingModel = openai.textEmbeddingModel("text-embedding-3-small");
} else {
  languageModel = mockModel({});
  console.warn(
    "Run `npx convex env set OPENAI_API_KEY=<your-api-key>` from the backend directory to set the API key.",
  );
}

export { languageModel, textEmbeddingModel };
