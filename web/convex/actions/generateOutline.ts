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

/**
 * Build the prompt for outline generation.
 * If hasPdf is true, we instruct Gemini to extract topics from the attached PDF.
 */
const buildPrompt = (prompt: string, hasPdf: boolean) => {
  // If we have a PDF attached, use a different prompt that strictly follows the PDF outline
  if (hasPdf) {
    return [
      "You are an expert curriculum designer and educational content specialist.",
      "",
      "The user has uploaded a PDF document that contains a COURSE OUTLINE or SYLLABUS.",
      "Your task is to STRICTLY FOLLOW this outline and extract the topics exactly as they appear.",
      "",
      "IMPORTANT RULES:",
      "- DO NOT create your own topics or reorganize the content",
      "- Extract topics EXACTLY as they appear in the PDF outline",
      "- Preserve the EXACT order from the document",
      "- Include ALL topics from the outline, even if some seem redundant",
      "- If the PDF contains numbered sections (e.g., '1.1 Introduction'), extract the topic title",
      "- If subtopics are listed, include them as separate items",
      "",
      "For each topic extracted from the PDF, provide:",
      "1. The exact title as it appears in the document (cleaned up if needed)",
      "2. A specific YouTube search query optimized to find educational short-form videos on that topic",
      "   - Include the course subject for context (e.g., 'calculus limits explained')",
      "   - Add terms like 'explained', 'tutorial', or 'introduction' as appropriate",
      "",
      "Respond in JSON with an array named 'items', each item having 'title' and 'searchQuery'.",
      "",
      "User's additional context/instructions:",
      prompt,
    ].join("\n");
  }

  // Default prompt when no PDF is provided
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

/**
 * Convert a Blob to base64 string for Gemini API
 */
async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString("base64");
}

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
    attachmentId: v.optional(v.string()),
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

    // If we have an attachment, get it as base64 for Gemini
    let pdfBase64: string | undefined;
    let isFromPdf = false;
    
    if (args.attachmentId) {
      try {
        // Get the PDF from Convex storage
        const pdfBlob = await ctx.storage.get(args.attachmentId as Id<"_storage">);
        if (pdfBlob) {
          pdfBase64 = await blobToBase64(pdfBlob);
          isFromPdf = true;
          console.log(`Successfully loaded PDF, ${pdfBase64.length} base64 characters`);
        }
      } catch (error) {
        console.error("Failed to load PDF:", error);
        // Continue without PDF if loading fails
      }
    }

    // Build the request parts - include PDF as inline data if available
    const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [];
    
    if (pdfBase64) {
      // Add PDF as inline data first
      parts.push({
        inline_data: {
          mime_type: "application/pdf",
          data: pdfBase64,
        },
      });
      // Then add the prompt that references the PDF
      parts.push({ text: buildPrompt(args.prompt, true) });
    } else {
      // Just text prompt without PDF
      parts.push({ text: buildPrompt(args.prompt, false) });
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
              parts,
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: isFromPdf ? 0.2 : 0.4, // Lower temperature when following PDF outline
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

    // Update the prompt to track that it came from a PDF (for expansion logic)
    if (isFromPdf) {
      await ctx.runMutation(api.mutations.updatePromptProgress.updatePromptProgress, {
        promptId: args.promptId,
        updates: {
          isFromPdf: true,
          originalTopicCount: items.length,
        },
      });
    }

    return items.map((item, index) => ({
      ...item,
      outlineItemId: outlineIds[index],
    }));
  },
});
