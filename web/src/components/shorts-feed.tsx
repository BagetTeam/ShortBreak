"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type ShortsItem = {
  id: string;
  videoId: string;
  videoUrl?: string;
  title: string;
  topic?: string;
  duration?: string;
};

// Helper function to check if URL is TikTok
function isTikTokVideoUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes("tiktok.com") || url.includes("vm.tiktok.com");
}

// Helper to get video URL from videoId or videoUrl
function getVideoUrl(item: ShortsItem): string {
  if (item.videoUrl) {
    return item.videoUrl;
  }
  // Fallback to YouTube embed URL if only videoId is provided
  return `https://www.youtube.com/embed/${item.videoId}?autoplay=0&mute=1&playsinline=1&controls=0&rel=0`;
}

type ShortsFeedProps = {
  items: ShortsItem[];
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  onNearEnd?: () => void;
  isLoading?: boolean;
  className?: string;
};

export function ShortsFeed({
  items,
  activeIndex: activeIndexProp,
  onActiveIndexChange,
  onNearEnd,
  isLoading = false,
  className,
}: ShortsFeedProps) {
  const [activeIndex, setActiveIndex] = React.useState(activeIndexProp ?? 0);
  const [currentIndex, setCurrentIndex] = React.useState(activeIndexProp ?? 0);
  const itemRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const videoRefs = React.useRef<Map<number, HTMLVideoElement>>(new Map());
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (activeIndexProp !== undefined) {
      setActiveIndex(activeIndexProp);
      setCurrentIndex(activeIndexProp);
      const target = itemRefs.current[activeIndexProp];
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [activeIndexProp]);

  // Handle video playback based on current index
  React.useEffect(() => {
    // Pause all videos
    videoRefs.current.forEach((video) => {
      if (video) {
        video.pause();
      }
    });

    // Play the current video
    const currentVideo = videoRefs.current.get(currentIndex);
    if (currentVideo) {
      currentVideo.currentTime = 0;
      currentVideo.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    }
  }, [currentIndex]);

  React.useEffect(() => {
    if (!itemRefs.current.length) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) {
          return;
        }
        const index = Number(visible.target.getAttribute("data-index"));
        if (!Number.isNaN(index) && index !== currentIndex) {
          setCurrentIndex(index);
          setActiveIndex(index);
          onActiveIndexChange?.(index);
        }
      },
      { threshold: [0.6], root: scrollRef.current }
    );

    itemRefs.current.forEach((item) => {
      if (item) {
        observer.observe(item);
      }
    });

    return () => observer.disconnect();
  }, [items, onActiveIndexChange, currentIndex]);

  React.useEffect(() => {
    if (items.length && activeIndex >= items.length - 3) {
      onNearEnd?.();
    }
  }, [activeIndex, items.length, onNearEnd]);

  return (
    <div
      className={cn(
        "flex h-full flex-col gap-4 rounded-3xl border border-border/60 bg-white/60 p-4 shadow-sm backdrop-blur",
        className
      )}
    >
      <div className="flex items-center justify-between px-2">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Feed
          </p>
          <h3 className="text-lg font-semibold text-foreground">
            Shorts Curriculum
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {items.length} clips
        </span>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2 snap-y snap-mandatory"
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`feed-skeleton-${index}`}
                className="overflow-hidden rounded-2xl border border-border/60 bg-white snap-start"
              >
                <Skeleton className="aspect-[9/16] w-full" />
                <div className="space-y-2 px-4 py-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            Waiting for the first batch of clips.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={item.id}
                  data-index={index}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  className={cn(
                    "relative snap-start overflow-hidden rounded-2xl border border-border/60 bg-black/90 p-0",
                    isActive && "border-foreground/40 shadow-lg"
                  )}
                >
                  <div className="aspect-[9/16] w-full bg-black flex items-center justify-center">
                    <video
                      ref={(element) => {
                        if (element) {
                          videoRefs.current.set(index, element);
                        } else {
                          videoRefs.current.delete(index);
                        }
                      }}
                      className="h-full w-full object-cover"
                      src={getVideoUrl(item)}
                      playsInline
                      muted={!isTikTokVideoUrl(item.videoUrl)}
                      loop
                      controls
                      autoPlay={index === currentIndex}
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-4 py-4 text-white">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/70">
                      <span>{item.topic ?? "Focus"}</span>
                      <span>{item.duration ?? "Short"}</span>
                    </div>
                    <h4 className="text-base font-semibold">{item.title}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
