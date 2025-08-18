"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { gradientPresets, solidPresets } from "@/lib/config/presets";

export function BackgroundPicker({ theme, onChange }: { theme: string; onChange: (t: string) => void }) {
  return (
    <Popover>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1">
          <span className="block text-xs font-medium text-stone-700">Background</span>
        </div>
        <PopoverTrigger asChild>
          <button aria-label="Edit background" className="size-8 rounded-md border border-stone-300 flex items-center justify-center transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white">
            {theme.includes("bg-gradient") ? (
              <div className={cn("size-7 rounded-sm", theme)} />
            ) : (
              <svg width="28" height="28" className="rounded-sm overflow-hidden" aria-hidden="true" focusable="false">
                <rect width="100%" height="100%" fill={theme} />
              </svg>
            )}
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent align="end" className="z-[9999] w-80">
        <span className="block font-medium text-sm text-stone-900 mb-2">Background Presets</span>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {gradientPresets.map((t) => (
            <div key={t} className={cn("cursor-pointer w-full h-8 rounded-md border", t, t === theme && "ring-2 ring-rose-400")} onClick={() => onChange(t)} aria-label={t} />
          ))}
        </div>
        <span className="block font-medium text-sm text-stone-900 mb-2">Solid Colors</span>
        <div className="grid grid-cols-10 gap-2">
          {solidPresets.map((color) => (
            <button
              key={color}
              className={cn("h-6 w-6 rounded-md border p-0 overflow-hidden", theme === color ? "ring-2 ring-rose-400" : "ring-0")}
              aria-label={`Color ${color}`}
              onClick={() => onChange(color)}
            >
              <svg width="24" height="24" aria-hidden="true" focusable="false">
                <rect width="100%" height="100%" fill={color} />
              </svg>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
