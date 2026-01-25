"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

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
  className?: string;
};

export function ShortsFeed({
  items,
  activeIndex: activeIndexProp,
  onActiveIndexChange,
  onNearEnd,
  className,
}: ShortsFeedProps) {
  const [activeIndex, setActiveIndex] = React.useState(activeIndexProp ?? 0);
  const itemRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (activeIndexProp !== undefined) {
      setActiveIndex(activeIndexProp);
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
      { threshold: [0.6], root: scrollRef.current }
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            Waiting for the first batch of clips.
          </div>
        ) : (
          <div className="space-y-4 snap-y snap-mandatory">
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
                  <div className="aspect-[9/16] w-full bg-black">
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
