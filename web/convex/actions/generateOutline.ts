"use node";

import { action } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { v } from "convex/values";

import { api } from "../_generated/api";
import { getClerkId } from "../lib/auth";

type OutlineItem = {
  title: string;
  searchQuery: string;
  order: number;
};

const buildPrompt = (prompt: string) => {
  return [
    "You are an expert curriculum designer and educational content specialist.",
    "",
    "Your task is to create a COMPLETE and COMPREHENSIVE course outline for the given topic.",
    "Think like you're designing a university syllabus or textbook table of contents.",
    "",
    "Guidelines:",
    "- Cover ALL fundamental concepts, not just a few highlights",
    "- Order topics from foundational to advanced (logical learning progression)",
    "- Include both theoretical concepts and practical applications",
    "- Break down complex topics into their component subtopics",
    "- Aim for 8-15 items depending on the breadth of the subject",
    "- Each item should be specific enough to find focused educational content",
    "",
    "For each concept, provide:",
    "1. A clear, concise title (the topic/concept name)",
    "2. A specific YouTube search query optimized to find educational short-form videos",
    "   - Include terms like 'explained', 'tutorial', 'basics', or 'introduction' for foundational topics",
    "   - Include 'examples', 'practice', or 'how to' for applied topics",
    "",
    "Example for 'Calculus 1':",
    "- Limits and limit laws",
    "- Continuity and discontinuities", 
    "- Rate of change and derivatives introduction",
    "- Differentiation rules (power rule, product rule, quotient rule, chain rule)",
    "- Implicit differentiation",
    "- Related rates",
    "- Curve sketching and analysis",
    "- Optimization problems",
    "- L'Hôpital's rule",
    "- Antiderivatives and indefinite integrals",
    "- Definite integrals and area",
    "",
    "Respond in JSON with an array named 'items', each item having 'title' and 'searchQuery'.",
    "",
    `Topic: ${prompt}`,
  ].join("\n");
};

const normalizeOutline = (payload: unknown): Omit<OutlineItem, "order">[] => {
  if (!payload) {
    return [];
  }

  const itemsSource = Array.isArray(payload)
    ? payload
    : (payload as { items?: unknown }).items;
  if (!Array.isArray(itemsSource)) {
    return [];
  }

  return itemsSource
    .map((item) => {
      if (typeof item !== "object" || !item) {
        return null;
      }
      const title = (item as { title?: string }).title?.trim();
      const searchQuery = (
        item as { searchQuery?: string }
      ).searchQuery?.trim();
      if (!title || !searchQuery) {
        return null;
      }
      return { title, searchQuery };
    })
    .filter((item): item is { title: string; searchQuery: string } => !!item);
};

const parseGeminiPayload = (text: unknown): unknown => {
  if (typeof text !== "string") {
    return text;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return {};
  }

  const jsonCandidate = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    return JSON.parse(jsonCandidate);
  } catch {
    return {};
  }
};

export const generateOutline = action({
  args: {
    promptId: v.id("prompts"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const clerkId = await getClerkId(ctx);
    await ctx.runQuery(api.queries.getUserByClerkId.getUserByClerkId, {
      clerkId,
    });
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
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed: ${response.status}`);
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      data?.candidates?.[0]?.content?.parts?.[0] ??
      "";
    const parsed = parseGeminiPayload(text);
    const items = normalizeOutline(parsed).map((item, index) => ({
      ...item,
      order: index,
    }));

    const outlineIds: Array<Id<"outlineItems">> = await ctx.runMutation(
      api.mutations.appendOutlineItems.appendOutlineItems,
      {
        promptId: args.promptId,
        items,
      },
    );

    return items.map((item, index) => ({
      ...item,
      outlineItemId: outlineIds[index],
    }));
  },
});
