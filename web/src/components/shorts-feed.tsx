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

// Video card component to render a single video
function VideoCard({
  item,
  isActive,
  isMobile,
  dataIndex,
  innerRef,
}: {
  item: ShortsItem;
  isActive: boolean;
  isMobile: boolean;
  dataIndex: number;
  innerRef: (node: HTMLDivElement | null) => void;
}) {
  return (
    <div
      data-index={dataIndex}
      ref={innerRef}
      className={cn(
        "h-screen w-full snap-center snap-always relative flex",
        isMobile ? "items-start justify-center pt-20" : "items-center justify-center"
      )}
    >
      <div className="w-full max-w-sm aspect-[9/16] bg-black rounded-3xl overflow-hidden border border-white shadow-lg">
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
    </div>
  );
}

export function ShortsFeed({
  items,
  activeIndex: activeIndexProp,
  onActiveIndexChange,
  onNearEnd,
  isLoading = false,
  className,
}: ShortsFeedProps) {
  const [activeIndex, setActiveIndex] = React.useState(activeIndexProp ?? 0);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const itemRefs = React.useRef<Map<number, HTMLDivElement | null>>(new Map());
  const isMobile = useIsMobile();
  const isScrollingRef = React.useRef(false);

  // Calculate which indices to render (previous, current, next)
  const indicesToRender = React.useMemo(() => {
    if (items.length === 0) return [];
    const indices: number[] = [];
    const start = Math.max(0, activeIndex - 1);
    const end = Math.min(items.length - 1, activeIndex + 1);
    for (let i = start; i <= end; i++) {
      indices.push(i);
    }
    return indices;
  }, [activeIndex, items.length]);

  // Handle controlled activeIndex prop changes
  React.useEffect(() => {
    if (activeIndexProp !== undefined && activeIndexProp !== activeIndex) {
      setActiveIndex(activeIndexProp);
    }
  }, [activeIndexProp, activeIndex]);

  // Scroll to active item when activeIndex changes
  React.useEffect(() => {
    if (isScrollingRef.current) return;
    
    const container = containerRef.current;
    if (!container || items.length === 0) return;

    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      const targetRef = itemRefs.current.get(activeIndex);
      if (targetRef) {
        targetRef.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Fallback: scroll to calculated position
        const itemHeight = window.innerHeight;
        container.scrollTo({
          top: activeIndex * itemHeight,
          behavior: "smooth",
        });
      }
    });
  }, [activeIndex, items.length]);

  // Intersection observer to detect which video is most visible
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        
        if (!visible) return;
        
        const index = Number(visible.target.getAttribute("data-index"));
        if (!Number.isNaN(index) && index !== activeIndex) {
          isScrollingRef.current = true;
          setActiveIndex(index);
          onActiveIndexChange?.(index);
          // Reset scrolling flag after a short delay
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 100);
        }
      },
      { threshold: [0.6] }
    );

    // Observe only the rendered items
    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [indicesToRender, activeIndex, onActiveIndexChange]);

  // Trigger onNearEnd when approaching the end
  React.useEffect(() => {
    if (items.length && activeIndex >= items.length - 3) {
      onNearEnd?.();
    }
  }, [activeIndex, items.length, onNearEnd]);

  // Clear refs that are no longer rendered
  React.useEffect(() => {
    const renderedSet = new Set(indicesToRender);
    itemRefs.current.forEach((_, key) => {
      if (!renderedSet.has(key)) {
        itemRefs.current.delete(key);
      }
    });
  }, [indicesToRender]);

  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="h-screen snap-start flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="w-full max-w-md aspect-[9/16] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <div className="h-screen snap-start flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            Waiting for the first batch of clips.
          </div>
        </div>
      </div>
    );
  }

  // Calculate spacer heights
  const itemHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const topSpacerHeight = Math.max(0, activeIndex - 1) * itemHeight;
  const bottomSpacerHeight = Math.max(0, items.length - activeIndex - 2) * itemHeight;

  return (
    <div
      ref={containerRef}
      className={cn("w-full", className)}
    >
      {/* Top spacer to maintain scroll position */}
      {topSpacerHeight > 0 && (
        <div style={{ height: topSpacerHeight }} aria-hidden="true" />
      )}

      {/* Render only previous, current, and next videos */}
      {indicesToRender.map((index) => {
        const item = items[index];
        return (
          <VideoCard
            key={item.id}
            item={item}
            isActive={index === activeIndex}
            isMobile={isMobile}
            dataIndex={index}
            innerRef={(node) => {
              if (node) {
                itemRefs.current.set(index, node);
              }
            }}
          />
        );
      })}

      {/* Bottom spacer to maintain scroll position */}
      {bottomSpacerHeight > 0 && (
        <div style={{ height: bottomSpacerHeight }} aria-hidden="true" />
      )}
    </div>
  );
}
