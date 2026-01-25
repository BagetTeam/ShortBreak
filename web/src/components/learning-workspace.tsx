"use client";

import * as React from "react";
import { useAction, useMutation } from "convex/react";
import type { FunctionReference } from "convex/server";

import { PromptInput } from "@/components/prompt-input";
import { ShortsFeed, type ShortsItem } from "@/components/shorts-feed";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";

type LearningWorkspaceProps = {
  feedItems?: Array<{
    _id: Id<"feedItems">;
    videoId: string;
    topicTitle: string;
    order: number;
    metaData?: {
      duration?: string;
    };
  }>;
  outlineItems?: Array<{
    _id: Id<"outlineItems">;
    title: string;
    searchQuery: string;
    order: number;
  }>;
  activePromptId?: Id<"prompts"> | null;
  onPromptCreated?: (promptId: Id<"prompts">) => void;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  onNearEnd?: () => void;
  isFeedLoading?: boolean;
};

export function LearningWorkspace({
  feedItems,
  outlineItems,
  activePromptId,
  onPromptCreated,
  activeIndex,
  onActiveIndexChange,
  onNearEnd,
  isFeedLoading = false,
}: LearningWorkspaceProps) {
  const isMobile = useIsMobile();
  const [prompt, setPrompt] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const generateUploadUrl = useMutation(
    "storage:generateUploadUrl" as unknown as FunctionReference<
      "mutation",
      "public",
      {},
      string
    >,
  );
  const createPrompt = useMutation(api.mutations.createPrompt.createPrompt);
  const generateOutline = useAction(api.actions.generateOutline.generateOutline);
  const fetchShorts = useAction(api.actions.fetchShorts.fetchShorts);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      return;
    }
    setErrorMessage(null);
    setStatusMessage("Generating subjects with Gemini...");
    setIsSubmitting(true);
    try {
      let attachmentId: string | undefined;
      if (file) {
        const uploadUrl = await generateUploadUrl();
        const upload = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!upload.ok) {
          throw new Error("File upload failed.");
        }
        const json = await upload.json();
        attachmentId = json.storageId as string | undefined;
      }

      const promptId = await createPrompt({
        prompt,
        attachmentId,
      });
      onPromptCreated?.(promptId);

      // Step 1: Generate outline from Gemini
      setStatusMessage("Generating learning outline with Gemini...");
      const outlineItems = await generateOutline({
        promptId,
        prompt,
      });
      if (!outlineItems.length) {
        setErrorMessage(
          "No outline items were generated. Try a shorter or more specific prompt."
        );
        setStatusMessage(null);
        return;
      }

      // Step 2: Fetch initial batch of YouTube Shorts (all topics at once for infinite feed)
      setStatusMessage("Finding videos for all topics...");
      
      const fetchedItems = await fetchShorts({
        promptId,
        items: outlineItems, // Fetch all topics at once - each topic gets multiple videos
      });

      if (fetchedItems.length === 0) {
        setErrorMessage(
          "No videos were found for any topics. Try tweaking the prompt."
        );
      } else {
        setStatusMessage(null);
      }

      setPrompt("");
      setFile(null);
    } catch (error) {
      console.error(error);
      setErrorMessage("Something went wrong while building the feed.");
    } finally {
      setStatusMessage(null);
      setIsSubmitting(false);
    }
  };

  const shortsItems: ShortsItem[] =
    feedItems?.map((item) => ({
      id: item._id,
      videoId: item.videoId,
      title: item.topicTitle,
      topic: "Module",
      duration: item.metaData?.duration,
    })) ?? [];

  if (!activePromptId && !isFeedLoading) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="flex w-full max-w-xl flex-col gap-3">
          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleSubmit}
            fileName={file?.name ?? null}
            onFileSelect={setFile}
            isSubmitting={isSubmitting}
            className="w-full"
          />
          {errorMessage ? (
            <p className="text-sm text-rose-600" style={{ fontFamily: 'var(--font-coming-soon)' }}>{errorMessage}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {statusMessage ? (
        <div className="rounded-2xl border border-border/60 bg-white/70 px-4 py-3 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-coming-soon)' }}>
          {statusMessage}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" style={{ fontFamily: 'var(--font-coming-soon)' }}>
          {errorMessage}
        </div>
      ) : null}
      {outlineItems && outlineItems.length > 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white/70 px-6 py-4" style={{ fontFamily: 'var(--font-coming-soon)' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'var(--font-shizuru)' }}>
            Learning Topics
          </h3>
          <ul className="space-y-2">
            {outlineItems
              .sort((a, b) => a.order - b.order)
              .map((item, index) => {
                const hasVideo = feedItems?.some(feedItem => feedItem.topicTitle === item.title);
                return (
                  <li key={item._id} className="flex items-start gap-3">
                    <span className="text-sm font-medium text-black/60 min-w-[24px]">{index + 1}.</span>
                    <span className={`text-sm ${hasVideo ? 'text-black' : 'text-black/70'}`}>
                      {item.title}
                      {hasVideo && <span className="ml-2 text-xs text-green-600">✓</span>}
                    </span>
                  </li>
                );
              })}
          </ul>
        </div>
      ) : null}
      <div
        className={cn(
          "flex flex-1 items-start justify-center",
          isMobile ? "px-0" : "px-4"
        )}
      >
        <ShortsFeed
          className="w-full max-w-xl"
          items={shortsItems}
          activeIndex={activeIndex}
          onActiveIndexChange={onActiveIndexChange}
          onNearEnd={onNearEnd}
          isLoading={isFeedLoading}
        />
      </div>
    </div>
  );
}
