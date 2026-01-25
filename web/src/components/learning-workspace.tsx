"use client";

import * as React from "react";
import { useAction, useMutation } from "convex/react";

import { ChatStream, type ChatMessage } from "@/components/chat-stream";
import { PromptInput } from "@/components/prompt-input";
import { ShortsFeed, type ShortsItem } from "@/components/shorts-feed";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { api } from "../../convex/_generated/api";

const demoFeed: ShortsItem[] = [
  {
    id: "clip-1",
    videoId: "vXgN3aXKk7Q",
    title: "Color Theory in 60 Seconds",
    topic: "Foundations",
    duration: "0:58",
  },
  {
    id: "clip-2",
    videoId: "aN7Yk0Jc8NQ",
    title: "Typography Pairing Mistakes",
    topic: "Practice",
    duration: "0:47",
  },
  {
    id: "clip-3",
    videoId: "kGx0eQZfTgM",
    title: "Create a Bold Hero Layout",
    topic: "Build",
    duration: "1:02",
  },
];

const baseMessages: ChatMessage[] = [
  {
    id: "system-1",
    role: "system",
    content:
      "Ready when you are. Drop a prompt or upload a syllabus and I will assemble your clip-by-clip learning path.",
  },
];

export function LearningWorkspace() {
  const isMobile = useIsMobile();
  const [prompt, setPrompt] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>(baseMessages);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const createPrompt = useMutation(api.mutations.createPrompt);
  const generateOutline = useAction(api.actions.generateOutline);
  const fetchShorts = useAction(api.actions.fetchShorts);

  const updateMessageStatus = React.useCallback(
    (messageId: string, status: ChatMessage["status"], content?: string) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                status,
                content: content ?? message.content,
              }
            : message
        )
      );
    },
    []
  );

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      return;
    }
    setIsSubmitting(true);
    const userMessageId = `user-${Date.now()}`;
    const systemMessageId = `system-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        role: "user",
        content: prompt,
      },
      {
        id: systemMessageId,
        role: "system",
        status: "pending",
        content: "Drafting your outline and pulling the first clips.",
      },
    ]);
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

      const outlineItems = await generateOutline({
        promptId,
        prompt,
      });

      await fetchShorts({
        promptId,
        items: outlineItems,
      });

      updateMessageStatus(
        systemMessageId,
        "success",
        "Your learning feed is ready. Scroll the playlist to begin."
      );
    } catch (error) {
      updateMessageStatus(
        systemMessageId,
        "error",
        error instanceof Error
          ? error.message
          : "Something went wrong generating the feed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div
        className={cn(
          "grid gap-6",
          isMobile ? "grid-cols-1" : "grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
        )}
      >
        <div className="space-y-6">
          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleSubmit}
            fileName={file?.name ?? null}
            onFileSelect={setFile}
            isSubmitting={isSubmitting}
          />
          <div className="rounded-3xl border border-border/60 bg-white/60 p-5 shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Session Log
            </p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">
              Intent & Output
            </h3>
            <div className="mt-4 max-h-[320px] overflow-y-auto pr-2">
              <ChatStream messages={messages} />
            </div>
          </div>
        </div>
        <ShortsFeed items={demoFeed} />
      </div>
    </div>
  );
}
