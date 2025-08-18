"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./sidebar.module.css";
import { useAutoPopoverMaxHeight } from "@/lib/hooks/useAutoPopoverMaxHeight";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Options } from "@/lib/store";

const patternOptions = [
  { type: "none", label: "None" },
  { type: "waves", label: "Waves" },
  { type: "dots", label: "Dots" },
  { type: "stripes", label: "Stripes" },
  { type: "zigzag", label: "Zigzag" },
  { type: "graphpaper", label: "Graph Paper" },
] as const;

export type PatternState = Options["pattern"];

export function PatternPicker({ pattern, onPick, children }: { pattern: PatternState; onPick: (type: PatternState["type"]) => void; children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  useAutoPopoverMaxHeight(triggerRef, contentRef, [open, pattern.enabled]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1">
          <span className="block text-xs font-medium text-stone-700">Pattern</span>
        </div>
        <PopoverTrigger asChild>
          <button ref={triggerRef} aria-label="Edit pattern overlay" className={cn("size-8 rounded-md border border-stone-300 flex items-center justify-center transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white", pattern.enabled ? "opacity-100" : "opacity-50")}>
            <div className="size-7 rounded-sm relative overflow-hidden bg-white flex items-center justify-center">
              {pattern.enabled ? (
                <div className={cn(
                  "w-full h-full relative",
                  styles.patternTile,
                  pattern.type === "waves" && styles.patternWaves,
                  pattern.type === "dots" && styles.patternDots,
                  pattern.type === "stripes" && styles.patternStripes,
                  pattern.type === "zigzag" && styles.patternZigzag,
                  pattern.type === "graphpaper" && styles.patternGraphpaper
                )} />
              ) : (
                <span className="text-stone-400 text-xs">Off</span>
              )}
            </div>
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent align="end" className="z-[9999] w-80">
        <div ref={contentRef} className="w-full overflow-y-auto">
        <span className="block font-medium text-sm text-stone-900 mb-2">Pattern Options</span>
        <div className="grid grid-cols-3 gap-2">
          {patternOptions.map((p) => (
            <div key={p.type} className={cn("cursor-pointer flex flex-col items-center gap-1.5")} onClick={() => onPick(p.type as any)}>
              <div className={cn("w-full h-14 rounded-md border border-stone-200 flex items-center justify-center bg-white overflow-hidden", { "ring-2 ring-rose-400": p.type === pattern.type })}>
                {p.type !== "none" ? (
                  <div className={cn(
                    "w-full h-full relative opacity-30",
                    styles.patternTile,
                    p.type === "waves" && cn(styles.patternWaves, styles.bgSize85),
                    p.type === "dots" && cn(styles.patternDots, styles.bgSize85),
                    p.type === "stripes" && cn(styles.patternStripes, styles.bgSize25),
                    p.type === "zigzag" && cn(styles.patternZigzag, styles.bgSize25),
                    p.type === "graphpaper" && cn(styles.patternGraphpaper, styles.bgSize85)
                  )} />
                ) : null}
              </div>
              <span className="text-xs text-stone-600">{p.label}</span>
            </div>
          ))}
        </div>
        {children}
        </div>
      </PopoverContent>
    </Popover>
  );
}
