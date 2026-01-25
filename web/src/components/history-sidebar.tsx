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

export type PromptHistoryItem = {
  id: string;
  title: string;
  subtitle?: string;
  isActive?: boolean;
};

type HistorySidebarProps = {
  prompts: PromptHistoryItem[];
  isLoading?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
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
    <SidebarGroup className={cn("gap-2", className)}>
      <SidebarGroupLabel>Prompt History</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <SidebarMenuSkeleton key={`history-skeleton-${index}`} />
              ))
            : prompts.map((prompt) => (
                <SidebarMenuItem key={prompt.id}>
                  <SidebarMenuButton
                    isActive={prompt.isActive}
                    onClick={() => onSelect?.(prompt.id)}
                    className="items-start"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-medium text-foreground">
                        {prompt.title}
                      </span>
                      {prompt.subtitle ? (
                        <span className="text-xs text-muted-foreground">
                          {prompt.subtitle}
                        </span>
                      ) : null}
                    </div>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    showOnHover
                    onClick={() => onDelete?.(prompt.id)}
                    aria-label="Delete prompt"
                  >
                    <Trash2 />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
          {!isLoading && prompts.length === 0 ? (
            <SidebarMenuItem>
              <SidebarMenuButton disabled>
                No prompts yet
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : null}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
