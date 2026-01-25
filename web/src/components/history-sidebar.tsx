"use client";

import { Trash2 } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { Id } from "../../convex/_generated/dataModel";

export type PromptHistoryItem = {
  id: Id<"prompts">;
  title: string;
  subtitle?: string;
  isActive?: boolean;
};

type HistorySidebarProps = {
  prompts: PromptHistoryItem[];
  isLoading?: boolean;
  onSelect?: (id: Id<"prompts">) => void;
  onDelete?: (id: Id<"prompts">) => void;
  className?: string;
};

export function HistorySidebar({
  prompts,
  isLoading = false,
  onSelect,
  onDelete,
  className,
}: HistorySidebarProps) {
  return (
    <SidebarGroup className={cn("gap-4 px-2", className)}>
      <SidebarGroupLabel className="px-2" style={{ fontFamily: 'var(--font-coming-soon)' }}>
        Prompt History
      </SidebarGroupLabel>
      <SidebarGroupContent className="px-2">
        <SidebarMenu className="space-y-2">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <SidebarMenuSkeleton key={`history-skeleton-${index}`} />
              ))
            : prompts.map((prompt) => (
                <SidebarMenuItem key={prompt.id} className="py-1 w-full">
                  <SidebarMenuButton
                    isActive={prompt.isActive}
                    onClick={() => onSelect?.(prompt.id)}
                    className="items-start py-3 px-3 min-h-[60px] h-auto w-full !overflow-visible [&>span:last-child]:!truncate-0"
                  >
                    <div className="flex flex-col text-left gap-1 flex-1 min-w-0 w-full overflow-visible" style={{ fontFamily: 'var(--font-coming-soon)' }}>
                      <span className="font-medium text-foreground text-sm leading-tight break-words whitespace-normal overflow-visible pb-1">
                        {prompt.title}
                      </span>
                      {prompt.subtitle ? (
                        <span className="text-xs text-muted-foreground leading-tight break-words whitespace-normal overflow-visible">
                          {prompt.subtitle}
                        </span>
                      ) : null}
                    </div>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    showOnHover
                    onClick={() => onDelete?.(prompt.id)}
                    aria-label="Delete prompt"
                    className="mr-2 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
          {!isLoading && prompts.length === 0 ? (
            <SidebarMenuItem>
              <SidebarMenuButton disabled className="py-3 px-3" style={{ fontFamily: 'var(--font-coming-soon)' }}>
                No prompts yet
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : null}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
