"use client";

import * as React from "react";
import { History, Plus } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

type MobileNavbarProps = {
  onNewPrompt: () => void;
  onFeedClick: () => void;
};

export function MobileNavbar({ onNewPrompt, onFeedClick }: MobileNavbarProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/10"
      style={{ backgroundColor: '#F5F0E6' }}
    >
      <div className="flex items-center justify-around h-12 px-4 pb-1">
        {/* Home/Feed button */}
        <button
          onClick={onFeedClick}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-opacity active:opacity-70"
        >
          <div className="w-6 h-6 rounded-full border border-black flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-black" />
          </div>
          <span
            className="text-xs text-black"
            style={{ fontFamily: 'var(--font-coming-soon)' }}
          >
            Feed
          </span>
        </button>

        {/* History button */}
        <button
          onClick={() => toggleSidebar()}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-opacity active:opacity-70"
        >
          <History className="w-5 h-5 text-black" />
          <span
            className="text-xs text-black"
            style={{ fontFamily: 'var(--font-coming-soon)' }}
          >
            History
          </span>
        </button>

        {/* New Prompt button */}
        <button
          onClick={onNewPrompt}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-opacity active:opacity-70"
        >
          <div
            className="w-8 h-8 rounded-full border-[1.5px] border-black flex items-center justify-center"
            style={{ backgroundColor: '#FCFCFA' }}
          >
            <Plus className="w-4 h-4 text-black" />
          </div>
          <span
            className="text-xs text-black"
            style={{ fontFamily: 'var(--font-coming-soon)' }}
          >
            New
          </span>
        </button>
      </div>
    </nav>
  );
}
