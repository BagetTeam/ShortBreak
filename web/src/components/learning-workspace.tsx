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
  activePromptId?: Id<"prompts"> | null;
  onPromptCreated?: (promptId: Id<"prompts">) => void;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  onNearEnd?: () => void;
  isFeedLoading?: boolean;
};

export function LearningWorkspace({
  feedItems,
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

      const outlineItems = await generateOutline({
        promptId,
        prompt,
      });
      if (!outlineItems.length) {
        setErrorMessage(
          "No outline items were generated. Try a shorter or more specific prompt."
        );
        return;
      }

      const fetchedItems = await fetchShorts({
        promptId,
        items: outlineItems,
      });
      if (!fetchedItems.length) {
        setErrorMessage(
          "No videos were found for this topic. Try tweaking the prompt."
        );
      }

      setPrompt("");
      setFile(null);
    } catch (error) {
      console.error(error);
      setErrorMessage("Something went wrong while building the feed.");
    } finally {
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
            <p className="text-sm text-rose-600">{errorMessage}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
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
