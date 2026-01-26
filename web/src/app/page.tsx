"use client";

import * as React from "react";
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { SignInButton, SignOutButton, useAuth } from "@clerk/nextjs";

import { HistorySidebar } from "@/components/history-sidebar";
import { LearningWorkspace } from "@/components/learning-workspace";
import { MobileNavbar } from "@/components/mobile-navbar";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

function MainContent({
  prompts,
  activePromptId,
  setActivePromptId,
  activeIndex,
  setActiveIndex,
  feedItems,
  outlineItems,
  isFeedLoading,
  deletePrompt,
  updatePromptProgress,
  fetchNextTopic,
  expandOutline,
  isLoadingMore,
  setIsLoadingMore,
  loadingStatus,
  setLoadingStatus,
}: {
  prompts: any;
  activePromptId: Id<"prompts"> | null;
  setActivePromptId: (id: Id<"prompts"> | null) => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  feedItems: any;
  outlineItems: any;
  isFeedLoading: boolean;
  deletePrompt: any;
  updatePromptProgress: any;
  fetchNextTopic: any;
  expandOutline: any;
  isLoadingMore: boolean;
  setIsLoadingMore: (loading: boolean) => void;
  loadingStatus: string | null;
  setLoadingStatus: (status: string | null) => void;
}) {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const [isScrolling, setIsScrolling] = React.useState(false);
  const mainRef = React.useRef<HTMLElement | null>(null);
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Hide bear immediately when scrolling starts
      // Show it again after scrolling stops (300ms delay)
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 300);
    };

    mainElement.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      mainElement.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <SidebarInset className="!m-0 !rounded-none !shadow-none flex flex-col h-screen overflow-hidden">
      <div
        className="flex h-full flex-col w-full"
        style={{ backgroundColor: "#F5F0E6" }}
      >
        {/* Header - desktop */}
        {!isMobile && (
          <header
            className="flex-shrink-0 flex flex-wrap items-center justify-between gap-4 border-b border-black/10 px-6 pt-3 pb-4 relative min-h-[60px]"
            style={{ backgroundColor: "#F5F0E6" }}
          >
            {/* Sidebar trigger button - visible when sidebar is collapsed */}
            {state === "collapsed" && (
              <div className="absolute top-4 left-6 z-20">
                <SidebarTrigger className="bg-transparent hover:bg-white rounded-lg transition-colors" />
              </div>
            )}
            {/* REELlyCooked title - only show when sidebar is collapsed */}
            <div className="space-y-1 ml-auto">
              <h2
                className={`text-2xl font-normal text-black ${state === "collapsed" ? "visible" : "invisible"}`}
                style={{ fontFamily: "var(--font-shizuru)" }}
              >
                REELyCooked
              </h2>
            </div>
          </header>
        )}
        {/* Mobile header */}
        {isMobile && (
          <header
            className="flex-shrink-0 flex items-center justify-center border-b border-black/10 px-6 pt-4 pb-4 relative min-h-[60px]"
            style={{ backgroundColor: "#F5F0E6" }}
          >
            <h2
              className="text-2xl font-normal text-black"
              style={{ fontFamily: "var(--font-shizuru)" }}
            >
              REELyCooked
            </h2>
          </header>
        )}
        <main
          ref={mainRef}
          className={`flex-1 overflow-y-scroll snap-y snap-mandatory flex flex-col relative ${
            isMobile ? "pb-12" : ""
          }`}
        >
          {/* Bear image in top right of main container - hide on mobile */}
          {!isMobile && (
            <div
              className={`absolute top-6 right-6 z-10 transition-opacity duration-200 ${
                isScrolling ? "opacity-0" : "opacity-100"
              }`}
            >
              <Image
                src="/bear.png"
                alt="Bear"
                width={120}
                height={120}
                className="object-contain"
              />
            </div>
          )}
          {/* Loading status indicator */}
          {(loadingStatus || isLoadingMore) && (
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 z-20 rounded-full px-4 py-2 bg-black/80 text-white text-sm shadow-lg"
              style={{ fontFamily: "var(--font-coming-soon)" }}
            >
              {loadingStatus || "Loading more..."}
            </div>
          )}
          <LearningWorkspace
            feedItems={feedItems ?? []}
            outlineItems={outlineItems ?? []}
            activePromptId={activePromptId}
            onPromptCreated={setActivePromptId}
            isFeedLoading={isFeedLoading}
            activeIndex={activeIndex}
            onActiveIndexChange={(index) => {
              setActiveIndex(index);
              if (!activePromptId) {
                return;
              }
              const activeItem = feedItems?.[index];
              updatePromptProgress({
                promptId: activePromptId,
                updates: {
                  lastWatchedIndex: index,
                  lastVideoId: activeItem?.videoId,
                },
              });
            }}
            onNearEnd={async () => {
              if (!activePromptId || isLoadingMore) return;

              setIsLoadingMore(true);
              try {
                // Try to fetch the next topic's videos
                const result = await fetchNextTopic({
                  promptId: activePromptId,
                });

                if (result.status === "success") {
                  // Successfully loaded next topic
                  setLoadingStatus(`Loaded: ${result.topicTitle}`);
                  setTimeout(() => setLoadingStatus(null), 2000);
                } else if (result.status === "needs_expansion") {
                  // All topics exhausted - expand the outline with new topics
                  setLoadingStatus("Expanding topics with AI...");

                  const expansionResult = await expandOutline({
                    promptId: activePromptId,
                  });

                  if (
                    expansionResult.status === "success" &&
                    expansionResult.items.length > 0
                  ) {
                    // New topics added, fetch the first one
                    setLoadingStatus(
                      `Added ${expansionResult.items.length} new topics, loading videos...`,
                    );

                    const nextResult = await fetchNextTopic({
                      promptId: activePromptId,
                    });
                    if (nextResult.status === "success") {
                      setLoadingStatus(`Loaded: ${nextResult.topicTitle}`);
                      setTimeout(() => setLoadingStatus(null), 2000);
                    }
                  } else {
                    setLoadingStatus("Could not generate more topics");
                    setTimeout(() => setLoadingStatus(null), 3000);
                  }
                } else if (result.status === "no_topics") {
                  setLoadingStatus("No topics available");
                  setTimeout(() => setLoadingStatus(null), 2000);
                }
              } catch (error) {
                console.error("Error loading more videos:", error);
                setLoadingStatus("Error loading more content");
                setTimeout(() => setLoadingStatus(null), 3000);
              } finally {
                setIsLoadingMore(false);
              }
            }}
          />
        </main>
        {/* Mobile navbar */}
        {isMobile && (
          <MobileNavbar
            onNewPrompt={() => setActivePromptId(null)}
            onFeedClick={() => {
              // Set the first prompt in history as active
              if (prompts && prompts.length > 0) {
                setActivePromptId(prompts[0]._id);
              }
            }}
            isScrolling={isScrolling}
          />
        )}
      </div>
    </SidebarInset>
  );
}

export default function Home() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const shouldQuery = !isLoading && isAuthenticated;
  const prompts = useQuery(
    api.queries.listPrompts.listPrompts,
    shouldQuery ? {} : "skip",
  );
  const [activePromptId, setActivePromptId] =
    React.useState<Id<"prompts"> | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const feedItems = useQuery(
    api.queries.listFeedItems.listFeedItems,
    shouldQuery && activePromptId ? { promptId: activePromptId } : "skip",
  );
  const outlineItems = useQuery(
    api.queries.listOutlineItems.listOutlineItems,
    shouldQuery && activePromptId ? { promptId: activePromptId } : "skip",
  );
  const isFeedLoading = activePromptId !== null && feedItems === undefined;
  const deletePrompt = useMutation(api.mutations.deletePrompt.deletePrompt);
  const updatePromptProgress = useMutation(
    api.mutations.updatePromptProgress.updatePromptProgress,
  );
  const fetchNextTopic = useAction(api.actions.fetchNextTopic.fetchNextTopic);
  const expandOutline = useAction(api.actions.expandOutline.expandOutline);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [loadingStatus, setLoadingStatus] = React.useState<string | null>(null);

  useEffect(() => {
    if (!prompts || !activePromptId) {
      return;
    }
    const current = prompts.find((prompt) => prompt._id === activePromptId);
    if (!current) {
      return;
    }
    setActiveIndex(current.lastWatchedIndex ?? 0);
  }, [prompts, activePromptId]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: "#F5F0E6" }}
      >
        <div
          className="w-full max-w-md rounded-3xl border border-black/10 bg-white/80 p-8 text-center shadow-sm"
          style={{ fontFamily: "var(--font-coming-soon)" }}
        >
          <h1
            className="text-3xl font-normal text-black"
            style={{ fontFamily: "var(--font-shizuru)" }}
          >
            REELyCooked
          </h1>
          <p className="mt-4 text-lg text-black/80">
            You are not authenticated.
          </p>
          <div className="mt-6">
            <SignInButton>
              <button
                className="rounded-full px-6 py-3 text-base font-normal text-black border border-black/20 bg-white hover:bg-black/5 transition-colors"
                style={{ fontFamily: "var(--font-coming-soon)" }}
              >
                Sign in to continue
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

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
      <Sidebar
        collapsible="offcanvas"
        variant="inset"
        style={{ backgroundColor: "#F5F0E6" }}
      >
        <SidebarHeader
          className="gap-3 border-b px-6 pt-2 pb-3"
          style={{ backgroundColor: "#F5F0E6" }}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1
                className="text-2xl font-normal text-black"
                style={{ fontFamily: "var(--font-shizuru)" }}
              >
                REELyCooked
              </h1>
            </div>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent
          style={{ backgroundColor: "#F5F0E6" }}
          className="flex flex-col"
        >
          <div className="flex-1 overflow-y-auto min-h-0">
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
          </div>
          <SidebarSeparator />
          <div className="px-4 pb-4 flex-shrink-0">
            <button
              onClick={() => setActivePromptId(null)}
              className="w-full rounded-[30px] px-6 py-5 text-lg font-normal text-black border-[1.5px] border-black shadow-sm hover:shadow-md transition-shadow"
              style={{
                fontFamily: "var(--font-coming-soon)",
                backgroundColor: "#FCFCFA",
              }}
            >
              Start New Prompt
            </button>
            <SignOutButton>
              <button
                className="mt-3 w-full rounded-[30px] px-6 py-4 text-base font-normal text-black border border-black/20 bg-white hover:bg-black/5 transition-colors"
                style={{ fontFamily: "var(--font-coming-soon)" }}
              >
                Log out
              </button>
            </SignOutButton>
          </div>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <MainContent
        prompts={prompts}
        activePromptId={activePromptId}
        setActivePromptId={setActivePromptId}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        feedItems={feedItems}
        outlineItems={outlineItems}
        isFeedLoading={isFeedLoading}
        deletePrompt={deletePrompt}
        updatePromptProgress={updatePromptProgress}
        fetchNextTopic={fetchNextTopic}
        expandOutline={expandOutline}
        isLoadingMore={isLoadingMore}
        setIsLoadingMore={setIsLoadingMore}
        loadingStatus={loadingStatus}
        setLoadingStatus={setLoadingStatus}
      />
    </SidebarProvider>
  );
}
