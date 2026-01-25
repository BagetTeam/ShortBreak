import { action } from "convex/server";
import { v } from "convex/values";

import { api } from "../_generated/api";

type OutlineItem = {
  title: string;
  searchQuery: string;
  order: number;
};

const buildPrompt = (prompt: string) => {
  return [
    "You are a curriculum designer.",
    "Break the topic into 5 engaging short-form video concepts.",
    "For each concept, provide a specific YouTube search query.",
    "Respond in JSON with an array named items, each item having title and searchQuery.",
    "",
    `Topic: ${prompt}`,
  ].join("\n");
};

const normalizeOutline = (payload: unknown): Omit<OutlineItem, "order">[] => {
  if (typeof payload !== "object" || !payload) {
    return [];
  }

  const items = (payload as { items?: unknown }).items;
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (typeof item !== "object" || !item) {
        return null;
      }
      const title = (item as { title?: string }).title?.trim();
      const searchQuery = (item as { searchQuery?: string }).searchQuery?.trim();
      if (!title || !searchQuery) {
        return null;
      }
      return { title, searchQuery };
    })
    .filter((item): item is { title: string; searchQuery: string } => !!item);
};

export const generateOutline = action({
  args: {
    promptId: v.id("prompts"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY.");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: buildPrompt(args.prompt) }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.4,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed: ${response.status}`);
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      data?.candidates?.[0]?.content?.parts?.[0] ??
      "";
    let parsed: unknown = text;
    if (typeof text === "string") {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { items: [] };
      }
    }
    const items = normalizeOutline(parsed).map((item, index) => ({
      ...item,
      order: index,
    }));

    await ctx.runMutation(api.mutations.appendOutlineItems, {
      promptId: args.promptId,
      items,
    });

    return items;
  },
});
