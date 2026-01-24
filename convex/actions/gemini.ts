/**
 * Gemini API Integration
 *
 * This action handles communication with Google's Gemini 1.5 Pro API
 * to generate course outlines from user prompts or PDF documents.
 *
 * The Gemini model generates a hierarchical course outline with:
 * - Topic titles
 * - YouTube search queries for each topic
 * - Logical progression through the subject
 */

"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

// Types for course outline
interface TopicOutline {
  title: string;
  searchQuery: string;
  description: string;
}

interface CourseOutline {
  courseTitle: string;
  topics: TopicOutline[];
}

/**
 * Generate a course outline from a text prompt.
 * Uses Gemini 1.5 Pro to create a structured learning path.
 */
export const generateCourseOutline = action({
  args: {
    prompt: v.string(),
    numTopics: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<CourseOutline> => {
    const { prompt, numTopics = 5 } = args;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    const systemPrompt = `You are a curriculum designer specializing in creating engaging short-form video learning paths. Your task is to break down educational topics into bite-sized concepts suitable for 60-second educational videos (like YouTube Shorts).

For the given topic, create exactly ${numTopics} sequential learning concepts. Each concept should:
1. Be specific and focused enough to be covered in a 60-second video
2. Build logically on the previous concept
3. Have an engaging, searchable title
4. Include a YouTube search query that would find relevant short educational content

Respond with valid JSON only, no markdown formatting or code blocks. Use this exact structure:
{
  "courseTitle": "A catchy course title",
  "topics": [
    {
      "title": "Topic 1 Title",
      "searchQuery": "specific youtube search query for shorts",
      "description": "Brief description of what this topic covers"
    }
  ]
}`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            { text: `Create a learning path for: ${prompt}` },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", errorText);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();

      // Extract the text content from Gemini's response
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textContent) {
        throw new Error("No content in Gemini response");
      }

      // Parse the JSON response
      const courseOutline: CourseOutline = JSON.parse(textContent);

      // Validate the response structure
      if (!courseOutline.courseTitle || !Array.isArray(courseOutline.topics)) {
        throw new Error("Invalid course outline structure from Gemini");
      }

      console.log(`Generated course: ${courseOutline.courseTitle} with ${courseOutline.topics.length} topics`);

      return courseOutline;
    } catch (error) {
      console.error("Error generating course outline:", error);
      throw error;
    }
  },
});

/**
 * Generate additional topics for an existing course (pagination).
 * Uses context from previous topics to continue the learning path.
 */
export const generateMoreTopics = action({
  args: {
    originalPrompt: v.string(),
    existingTopics: v.array(v.string()),
    numNewTopics: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<TopicOutline[]> => {
    const { originalPrompt, existingTopics, numNewTopics = 5 } = args;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    const existingTopicsText = existingTopics
      .map((t, i) => `${i + 1}. ${t}`)
      .join("\n");

    const systemPrompt = `You are a curriculum designer continuing an educational video series. The user has already covered these topics:

${existingTopicsText}

Now create ${numNewTopics} NEW topics that logically continue this learning path. Each topic should:
1. Build on what was already covered
2. Be specific enough for a 60-second video
3. Have an engaging, searchable title
4. Include a YouTube search query for finding relevant short content

Respond with valid JSON only, no markdown. Use this exact structure:
{
  "topics": [
    {
      "title": "Next Topic Title",
      "searchQuery": "specific youtube search query",
      "description": "Brief description"
    }
  ]
}`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            { text: `Original learning goal: ${originalPrompt}\n\nGenerate the next ${numNewTopics} topics.` },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", errorText);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        throw new Error("No content in Gemini response");
      }

      const parsed = JSON.parse(textContent);
      return parsed.topics || [];
    } catch (error) {
      console.error("Error generating more topics:", error);
      throw error;
    }
  },
});

/**
 * Extract course outline from a PDF document.
 * Uses Gemini's document understanding capabilities.
 */
export const generateOutlineFromPDF = action({
  args: {
    pdfStorageId: v.id("_storage"),
  },
  handler: async (ctx, args): Promise<CourseOutline> => {
    const { pdfStorageId } = args;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    // Get the PDF file URL from Convex storage
    const pdfUrl = await ctx.storage.getUrl(pdfStorageId);
    if (!pdfUrl) {
      throw new Error("Could not get PDF URL from storage");
    }

    // Fetch the PDF content
    const pdfResponse = await fetch(pdfUrl);
    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

    const systemPrompt = `You are a curriculum designer. Analyze this document (likely a syllabus or course outline) and extract the key learning topics. Create a structured video learning path with 5-10 topics.

Each topic should:
1. Be specific enough for a 60-second educational video
2. Follow the logical order from the document
3. Have an engaging title
4. Include a YouTube search query for finding relevant short content

Respond with valid JSON only:
{
  "courseTitle": "Course title based on the document",
  "topics": [
    {
      "title": "Topic Title",
      "searchQuery": "youtube search query",
      "description": "Brief description"
    }
  ]
}`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            {
              inline_data: {
                mime_type: "application/pdf",
                data: pdfBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", errorText);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        throw new Error("No content in Gemini response");
      }

      const courseOutline: CourseOutline = JSON.parse(textContent);

      if (!courseOutline.courseTitle || !Array.isArray(courseOutline.topics)) {
        throw new Error("Invalid course outline structure from Gemini");
      }

      return courseOutline;
    } catch (error) {
      console.error("Error generating outline from PDF:", error);
      throw error;
    }
  },
});
