"use node";

import { action } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { v } from "convex/values";

import { api } from "../_generated/api";

type OutlineItem = {
  title: string;
  searchQuery: string;
  order: number;
};

const buildExpansionPrompt = (
  originalPrompt: string,
  existingTopics: string[],
  expansionCount: number,
  isFromPdf: boolean = false
) => {
  // For PDF-based outlines, always expand with related/deeper topics
  // For regular outlines, alternate between deeper and broader
  const direction = isFromPdf 
    ? (expansionCount === 1 ? "related" : expansionCount % 2 === 0 ? "deeper" : "broader")
    : (expansionCount % 2 === 0 ? "deeper" : "broader");
  
  const pdfContext = isFromPdf
    ? [
        "IMPORTANT CONTEXT: The original outline was extracted from a PDF course syllabus.",
        "The user has completed ALL topics from their course outline.",
        "Now they want to continue learning beyond the original syllabus.",
        "",
      ].join("\n")
    : "";
  
  const directionInstructions = {
    related: [
      "Now generate 5-8 RELATED or MORE SPECIFIC topics to continue their learning journey.",
      "Focus on:",
      "- Topics that naturally follow from the completed course",
      "- More specific deep-dives into concepts that were only briefly covered",
      "- Practical applications and real-world examples",
      "- Advanced techniques building on the fundamentals",
      "- Common interview questions or exam topics in this area",
      "",
      "Example after completing a Data Structures course:",
      "- Red-black trees deep dive",
      "- Graph algorithms: Dijkstra's and A* explained",
      "- Dynamic programming patterns",
      "- System design: when to use which data structure",
      "- Complexity analysis practice problems",
    ].join("\n"),
    deeper: [
      "Now generate 5-8 DEEPER topics that explore specific concepts in more detail.",
      "Focus on:",
      "- Advanced techniques and edge cases",
      "- Common pitfalls and how to avoid them",
      "- Real-world applications and examples",
      "- Special theorems, rules, or formulas that weren't covered",
      "- Practice problems and worked examples",
      "",
      "Example for Calculus after covering basics:",
      "- Squeeze theorem explained with examples",
      "- Implicit differentiation step by step",
      "- Related rates word problems",
      "- Logarithmic differentiation techniques",
      "- Integration by substitution basics",
    ].join("\n"),
    broader: [
      "Now generate 5-8 RELATED topics that expand into adjacent areas.",
      "Focus on:",
      "- The next level of this subject (e.g., Calculus 2 after Calculus 1)",
      "- Prerequisites that might need reinforcement",
      "- Practical applications in different fields",
      "- Connections to other subjects",
      "- Historical context or famous problems",
      "",
      "Example for Calculus 1:",
      "- Introduction to integrals (Calculus 2 preview)",
      "- Applications of derivatives in physics",
      "- Calculus in economics and optimization",
      "- History of calculus: Newton vs Leibniz",
      "- Precalculus review: trigonometric identities",
    ].join("\n"),
  };
  
  return [
    "You are an expert curriculum designer and educational content specialist.",
    "",
    pdfContext,
    `The user is learning about: "${originalPrompt}"`,
    "",
    "They have already covered these topics:",
    existingTopics.map((t, i) => `${i + 1}. ${t}`).join("\n"),
    "",
    directionInstructions[direction],
    "",
    "IMPORTANT: Do NOT repeat any topics already covered.",
    "",
    "For each new topic, provide:",
    "1. A clear, concise title",
    "2. A specific YouTube search query optimized for short educational videos",
    "",
    "Respond in JSON with an array named 'items', each having 'title' and 'searchQuery'.",
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

export const expandOutline = action({
  args: {
    promptId: v.id("prompts"),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY.");
    }

    // Get the original prompt
    const prompt = await ctx.runQuery(api.queries.getPrompt.getPrompt, {
      promptId: args.promptId,
    });
    if (!prompt) {
      throw new Error("Prompt not found.");
    }

    // Get existing outline items
    const existingOutlineItems = await ctx.runQuery(
      api.queries.listOutlineItems.listOutlineItems,
      { promptId: args.promptId }
    );

    const existingTopics = existingOutlineItems?.map((item) => item.title) ?? [];
    const maxOrder = existingOutlineItems?.length
      ? Math.max(...existingOutlineItems.map((item) => item.order))
      : -1;

    // Increment expansion count and get new value
    const newExpansionCount = await ctx.runMutation(
      api.mutations.appendOutlineItems.incrementExpansionCount,
      { promptId: args.promptId }
    );

    // Generate new topics with Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: buildExpansionPrompt(
                    prompt.prompt,
                    existingTopics,
                    newExpansionCount ?? 1,
                    prompt.isFromPdf ?? false
                  ),
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.5, // Slightly higher for more creative expansion
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
    const parsed = parseGeminiPayload(text);
    
    // Filter out any topics that already exist (case-insensitive)
    const existingTitlesLower = new Set(existingTopics.map((t) => t.toLowerCase()));
    const newItems = normalizeOutline(parsed)
      .filter((item) => !existingTitlesLower.has(item.title.toLowerCase()))
      .map((item, index) => ({
        ...item,
        order: maxOrder + 1 + index,
        isExpansion: true,
        expansionRound: newExpansionCount ?? 1,
      }));

    if (newItems.length === 0) {
      return { status: "no_new_topics", items: [] };
    }

    // Add new outline items to database
    const outlineIds: Array<Id<"outlineItems">> = await ctx.runMutation(
      api.mutations.appendOutlineItems.appendOutlineItems,
      {
        promptId: args.promptId,
        items: newItems,
      }
    );

    return {
      status: "success",
      expansionRound: newExpansionCount,
      items: newItems.map((item, index) => ({
        ...item,
        outlineItemId: outlineIds[index],
      })),
    };
  },
});
