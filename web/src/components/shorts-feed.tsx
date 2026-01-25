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
  className?: string;
};

export function ShortsFeed({ items, activeIndex = 0, className }: ShortsFeedProps) {
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
      <div className="flex-1 space-y-4 overflow-hidden">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "relative overflow-hidden rounded-2xl border border-border/60 bg-[linear-gradient(135deg,_#fff1f2,_#eff6ff)] p-4",
              index === activeIndex && "border-foreground/40 shadow-lg"
            )}
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span>{item.topic ?? "Focus"}</span>
              <span>{item.duration ?? "Short"}</span>
            </div>
            <h4 className="mt-3 text-base font-semibold text-foreground">
              {item.title}
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              youtube.com/watch?v={item.videoId}
            </p>
            <div className="pointer-events-none absolute inset-0 border border-white/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
