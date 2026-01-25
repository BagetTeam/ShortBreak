"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PromptInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onFileSelect?: (file: File | null) => void;
  isSubmitting?: boolean;
  fileName?: string | null;
  placeholder?: string;
  className?: string;
};

export function PromptInput({
  value,
  onChange,
  onSubmit,
  onFileSelect,
  isSubmitting = false,
  fileName,
  placeholder = "Describe what you want to learn or drop a syllabus PDF.",
  className,
}: PromptInputProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFileSelect?.(file);
  };

  return (
    <div
      className={cn(
        "rounded-3xl border border-border/60 bg-white/80 p-5 shadow-sm backdrop-blur",
        className
      )}
    >
      <div className="flex flex-col gap-4">
        <textarea
          className="min-h-[120px] w-full resize-none rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm leading-relaxed text-foreground shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ fontFamily: 'var(--font-coming-soon)' }}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-[30px] px-6 py-3 text-base font-normal text-black border-[1.5px] border-black shadow-sm hover:shadow-md transition-shadow"
              style={{ 
                fontFamily: 'var(--font-coming-soon)',
                backgroundColor: '#FCFCFA'
              }}
            >
              Attach PDF
            </button>
            {fileName ? (
              <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-coming-soon)' }}>
                {fileName}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="rounded-[30px] px-6 py-3 text-base font-normal text-black border-[1.5px] border-black shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              fontFamily: 'var(--font-coming-soon)',
              backgroundColor: '#FCFCFA'
            }}
          >
            {isSubmitting ? "Building..." : "Generate Feed"}
          </button>
        </div>
      </div>
    </div>
  );
}
