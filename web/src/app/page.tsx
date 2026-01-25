"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";

import { HistorySidebar } from "@/components/history-sidebar";
import { LearningWorkspace } from "@/components/learning-workspace";
import { MobileNavbar } from "@/components/mobile-navbar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
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
  useSidebar,
} from "@/components/ui/sidebar";
import type { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";

function MainContent({
  prompts,
  activePromptId,
  setActivePromptId,
  activeIndex,
  setActiveIndex,
  feedItems,
  isFeedLoading,
  deletePrompt,
  updatePromptProgress,
}: {
  prompts: any;
  activePromptId: Id<"prompts"> | null;
  setActivePromptId: (id: Id<"prompts"> | null) => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  feedItems: any;
  isFeedLoading: boolean;
  deletePrompt: any;
  updatePromptProgress: any;
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

    mainElement.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      mainElement.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <SidebarInset className="!m-0 !rounded-none !shadow-none flex flex-col h-screen overflow-hidden">
      <div className="flex h-full flex-col w-full" style={{ backgroundColor: '#F5F0E6' }}>
        {/* Header - desktop */}
        {!isMobile && (
          <header className="flex-shrink-0 flex flex-wrap items-center justify-between gap-4 border-b border-black/10 px-6 pt-3 pb-4 relative min-h-[60px]" style={{ backgroundColor: '#F5F0E6' }}>
            {/* Sidebar trigger button - visible when sidebar is collapsed */}
            {state === "collapsed" && (
              <div className="absolute top-4 left-6 z-20">
                <SidebarTrigger className="bg-transparent hover:bg-white rounded-lg transition-colors" />
              </div>
            )}
            {/* ShortBreak title - only show when sidebar is collapsed */}
            <div className="space-y-1 ml-auto">
              <h2 
                className={`text-2xl font-normal text-black ${state === "collapsed" ? "visible" : "invisible"}`}
                style={{ fontFamily: 'var(--font-shizuru)' }}
              >
                ShortBreak
              </h2>
            </div>
          </header>
        )}
        {/* Mobile header */}
        {isMobile && (
          <header className="flex-shrink-0 flex items-center justify-center border-b border-black/10 px-6 pt-4 pb-4 relative min-h-[60px]" style={{ backgroundColor: '#F5F0E6' }}>
            <h2 
              className="text-2xl font-normal text-black"
              style={{ fontFamily: 'var(--font-shizuru)' }}
            >
              ShortBreak
            </h2>
          </header>
        )}
        <main 
          ref={mainRef}
          className={`flex-1 overflow-y-scroll snap-y snap-mandatory flex flex-col relative ${
            isMobile ? 'pb-12' : ''
          }`}
        >
          {/* Bear image in top right of main container - hide on mobile */}
          {!isMobile && (
            <div 
              className={`absolute top-6 right-6 z-10 transition-opacity duration-200 ${
                isScrolling ? 'opacity-0' : 'opacity-100'
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
          <LearningWorkspace
            feedItems={feedItems ?? []}
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
                lastWatchedIndex: index,
                lastVideoId: activeItem?.videoId,
              });
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
          />
        )}
      </div>
    </SidebarInset>
  );
}

export default function Home() {
  const prompts = useQuery(api.queries.listPrompts.listPrompts);
  const [activePromptId, setActivePromptId] = React.useState<
    Id<"prompts"> | null
  >(
    null,
  );
  const [activeIndex, setActiveIndex] = React.useState(0);
  const feedItems = useQuery(
    api.queries.listFeedItems.listFeedItems,
    activePromptId ? { promptId: activePromptId } : "skip",
  );
  const isFeedLoading = activePromptId !== null && feedItems === undefined;
  const deletePrompt = useMutation(api.mutations.deletePrompt.deletePrompt);
  const updatePromptProgress = useMutation(
    api.mutations.updatePromptProgress.updatePromptProgress,
  );

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
      <Sidebar collapsible="offcanvas" variant="inset" style={{ backgroundColor: '#F5F0E6' }}>
        <SidebarHeader className="gap-3 border-b px-6 pt-2 pb-3" style={{ backgroundColor: '#F5F0E6' }}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 
                className="text-2xl font-normal text-black"
                style={{ fontFamily: 'var(--font-shizuru)' }}
              >
                ShortBreak
              </h1>
            </div>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent style={{ backgroundColor: '#F5F0E6' }} className="flex flex-col">
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
                fontFamily: 'var(--font-coming-soon)',
                backgroundColor: '#FCFCFA'
              }}
            >
              Start New Prompt
            </button>
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
        isFeedLoading={isFeedLoading}
        deletePrompt={deletePrompt}
        updatePromptProgress={updatePromptProgress}
      />
    </SidebarProvider>
  );
}
