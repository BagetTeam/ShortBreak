"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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
              className={cn(
                "h-screen w-full snap-center snap-always relative flex",
                isMobile ? "items-start justify-center pt-20" : "items-center justify-center"
              )}
            >
              {shouldShow ? (
                <>
                  {/* Video card with white border - narrower on mobile */}
                  <div className={cn(
                    "w-full aspect-[9/16] bg-black rounded-3xl overflow-hidden border border-white shadow-lg",
                    isMobile ? "max-w-[280px]" : "max-w-sm"
                  )}>
                    <iframe
                      title={item.title}
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${item.videoId}?autoplay=${
                        isActive ? "1" : "0"
                      }&mute=0&playsinline=1&controls=0&rel=0`}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  </div>
                </>
              ) : (
                // Placeholder for non-visible cards to maintain scroll positions
                <div className={cn(
                  "w-full aspect-[9/16] bg-transparent",
                  isMobile ? "max-w-[280px]" : "max-w-sm"
                )} />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
