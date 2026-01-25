"use client";

import * as React from "react";

import { ChatStream, type ChatMessage } from "@/components/chat-stream";
import { PromptInput } from "@/components/prompt-input";
import { ShortsFeed, type ShortsItem } from "@/components/shorts-feed";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>(baseMessages);

  const handleSubmit = () => {
    if (!prompt.trim()) {
      return;
    }
    const nextMessages: ChatMessage[] = [
      ...messages,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: prompt,
      },
      {
        id: `system-${Date.now()}`,
        role: "system",
        status: "pending",
        content: "Drafting your outline and pulling the first clips.",
      },
    ];
    setMessages(nextMessages);
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
            fileName={fileName}
            onFileSelect={(file) => setFileName(file?.name ?? null)}
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
