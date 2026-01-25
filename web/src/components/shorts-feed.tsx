"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type ShortsItem = {
  id: string;
  videoId: string;
  title: string;
  topic?: string;
  duration?: string;
};

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
  const itemRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (activeIndexProp !== undefined) {
      setActiveIndex(activeIndexProp);
      const target = itemRefs.current[activeIndexProp];
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeIndexProp]);

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
        if (!Number.isNaN(index)) {
          setActiveIndex(index);
          onActiveIndexChange?.(index);
        }
      },
      { threshold: [0.6] }
    );

    itemRefs.current.forEach((item) => {
      if (item) {
        observer.observe(item);
      }
    });

    return () => observer.disconnect();
  }, [items, onActiveIndexChange]);

  React.useEffect(() => {
    if (items.length && activeIndex >= items.length - 3) {
      onNearEnd?.();
    }
  }, [activeIndex, items.length, onNearEnd]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "w-full",
        className
      )}
    >
      {isLoading ? (
        <div className="h-screen snap-start flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="w-full max-w-md aspect-[9/16] rounded-2xl" />
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="h-screen snap-start flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            Waiting for the first batch of clips.
          </div>
        </div>
      ) : (
        items.map((item, index) => {
          const isActive = index === activeIndex;
          // Only show content for current video and adjacent ones (prev, current, next)
          const shouldShow = Math.abs(index - activeIndex) <= 1;
          
          return (
            <div
              key={item.id}
              data-index={index}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              className="h-screen w-full snap-center snap-always relative flex items-center justify-center pt-4 pb-4"
            >
              {shouldShow ? (
                <>
                  {/* White card with border */}
                  <div className="w-full max-w-sm aspect-[9/16] bg-white rounded-3xl border border-white shadow-lg flex flex-col items-center justify-center p-8">
                    <div className="text-center space-y-4">
                      <h3 className="text-xl font-semibold text-black" style={{ fontFamily: 'var(--font-coming-soon)' }}>
                        {item.title}
                      </h3>
                      {item.topic && (
                        <p className="text-sm text-black/70" style={{ fontFamily: 'var(--font-coming-soon)' }}>
                          {item.topic}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Video implementation commented out for now */}
                  {/* 
                  <div className="w-full max-w-sm aspect-[9/16] bg-black rounded-3xl overflow-hidden border border-white shadow-lg">
                    <iframe
                      title={item.title}
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${item.videoId}?autoplay=${
                        isActive ? "1" : "0"
                      }&mute=1&playsinline=1&controls=0&rel=0`}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                    <div className="w-full max-w-sm space-y-2 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-4 py-4 text-white rounded-b-3xl">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/70">
                        <span>{item.topic ?? "Focus"}</span>
                        <span>{item.duration ?? "Short"}</span>
                      </div>
                      <h4 className="text-base font-semibold">{item.title}</h4>
                    </div>
                  </div>
                  */}
                </>
              ) : (
                // Placeholder for non-visible cards to maintain scroll positions
                <div className="w-full max-w-sm aspect-[9/16] bg-transparent" />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
