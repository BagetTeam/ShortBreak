"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";

import { HistorySidebar } from "@/components/history-sidebar";
import { LearningWorkspace } from "@/components/learning-workspace";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const prompts = useQuery(api.queries.listPrompts);
  const [activePromptId, setActivePromptId] = React.useState<string | null>(
    null
  );
  const [activeIndex, setActiveIndex] = React.useState(0);
  const feedItems = useQuery(
    api.queries.listFeedItems,
    activePromptId ? { promptId: activePromptId } : "skip"
  );
  const deletePrompt = useMutation(api.mutations.deletePrompt);
  const updatePromptProgress = useMutation(api.mutations.updatePromptProgress);

  React.useEffect(() => {
    if (prompts && prompts.length > 0 && !activePromptId) {
      setActivePromptId(prompts[0]._id);
    }
  }, [prompts, activePromptId]);

  React.useEffect(() => {
    if (!prompts || !activePromptId) {
      return;
    }
    const current = prompts.find((prompt) => prompt._id === activePromptId);
    if (!current) {
      return;
    }
    setActiveIndex(current.lastWatchedIndex ?? 0);
  }, [prompts, activePromptId]);

  const promptHistory =
    prompts?.map((prompt) => ({
      id: prompt._id,
      title: prompt.title,
      subtitle:
        typeof prompt.lastWatchedIndex === "number"
          ? `Last watched: Clip ${prompt.lastWatchedIndex + 1}`
          : "New session",
      isActive: prompt._id === activePromptId,
    })) ?? [];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="gap-3 border-b px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                ShortBreak
              </p>
              <h1 className="text-lg font-semibold text-foreground">
                Learning Feed
              </h1>
            </div>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <HistorySidebar
            prompts={promptHistory}
            isLoading={!prompts}
            onSelect={setActivePromptId}
            onDelete={(id) => {
              deletePrompt({ promptId: id });
              if (id === activePromptId) {
                setActivePromptId(null);
              }
            }}
          />
          <SidebarSeparator />
          <div className="px-4 pb-4">
            <Button variant="outline" className="w-full rounded-full">
              Start New Prompt
            </Button>
          </div>
        </SidebarContent>
        <SidebarFooter className="border-t px-4 py-4">
          <Button className="w-full">Start a Session</Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="flex h-full min-h-svh flex-col bg-[radial-gradient(circle_at_top,_#f7f2ff,_#fff_45%,_#f7f9ff_100%)]">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 px-6 py-5">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                Curriculum
              </p>
              <h2 className="text-2xl font-semibold text-foreground">
                Design Your Next Learning Sprint
              </h2>
            </div>
            <Button variant="outline" className="rounded-full">
              View Queue
            </Button>
          </header>
          <main className="flex flex-1 flex-col gap-6 px-6 py-6">
            <LearningWorkspace
              feedItems={feedItems ?? []}
              onPromptCreated={setActivePromptId}
              activeIndex={activeIndex}
              onActiveIndexChange={(index) => {
                setActiveIndex(index);
                if (!activePromptId) {
                  return;
                }
                const activeItem = feedItems?.[index];
                updatePromptProgress({
                  promptId: activePromptId,
                  lastWatchedIndex: index,
                  lastVideoId: activeItem?.videoId,
                });
              }}
            />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
