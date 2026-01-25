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
                <SidebarMenuItem key={prompt.id} className="py-1">
                  <SidebarMenuButton
                    isActive={prompt.isActive}
                    onClick={() => onSelect?.(prompt.id)}
                    className="items-start py-3 px-3 min-h-[60px]"
                  >
                    <div className="flex flex-col text-left gap-1 flex-1" style={{ fontFamily: 'var(--font-coming-soon)' }}>
                      <span className="font-medium text-foreground text-sm leading-tight">
                        {prompt.title}
                      </span>
                      {prompt.subtitle ? (
                        <span className="text-xs text-muted-foreground leading-tight">
                          {prompt.subtitle}
                        </span>
                      ) : null}
                    </div>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    showOnHover
                    onClick={() => onDelete?.(prompt.id)}
                    aria-label="Delete prompt"
                    className="mr-2"
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
