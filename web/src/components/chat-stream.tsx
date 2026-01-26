import { cn } from "@/lib/utils";

export type ChatMessage = {
  id: string;
  role: "user" | "system";
  content: string;
  status?: "pending" | "success" | "error";
};

type ChatStreamProps = {
  messages: ChatMessage[];
  className?: string;
};

export function ChatStream({ messages, className }: ChatStreamProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "rounded-2xl border border-border/60 px-4 py-3 text-sm leading-relaxed",
            message.role === "user"
              ? "ml-auto bg-foreground text-background"
              : "bg-white/80 text-foreground",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium">
              {message.role === "user" ? "You" : "REELyCooked"}
            </span>
            {message.status ? (
              <span
                className={cn(
                  "text-xs uppercase tracking-[0.2em]",
                  message.status === "pending" && "text-muted-foreground",
                  message.status === "success" && "text-emerald-600",
                  message.status === "error" && "text-rose-600",
                )}
              >
                {message.status}
              </span>
            ) : null}
          </div>
          <p className="mt-2 whitespace-pre-line">{message.content}</p>
        </div>
      ))}
    </div>
  );
}
