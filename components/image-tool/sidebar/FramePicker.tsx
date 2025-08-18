"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./sidebar.module.css";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Options } from "@/lib/store";

export function FramePicker({ value, onChange }: { value: Options["frame"]; onChange: (v: Options["frame"]) => void }) {
  return (
    <Popover>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1">
          <span className="block text-xs font-medium text-stone-700">Frame</span>
        </div>
        <PopoverTrigger asChild>
          <button aria-label="Edit frame" className="w-20 h-14 rounded-md border border-stone-300 flex items-center justify-center transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white">
            <div className="w-full h-full rounded-sm relative overflow-hidden bg-gradient-to-br from-rose-300 to-orange-400 flex items-center justify-center">
              {value === "none" && <div className="w-10 h-8 bg-white border border-stone-300 rounded-sm" />}
        {value === "arc" && (
                <div className="relative">
                  <div className={cn("w-10 h-8 bg-white border border-stone-300", styles.frameArcInner)}>
                    <div className="w-full h-full bg-white rounded-[3px]" />
                  </div>
                </div>
              )}
              {value === "stack" && (
                <div className="relative">
                  <div className="absolute">
                    {Array.from({ length: 3 }).map((_, index) => {
                      const reverseIndex = 3 - index - 1;
                      const translateY = reverseIndex * -2.5;
                      const scale = 1 - reverseIndex * 0.06;
                      const opacity = Math.pow(0.7, reverseIndex);
                      return (
                        <div key={index} className={cn("absolute w-10", styles.stackLayer, styles[`stackLayer${reverseIndex}` as keyof typeof styles])} />
                      );
                    })}
                  </div>
                  <div className="relative z-10">
                    <div className="w-10 h-8 bg-white border border-stone-300 rounded-sm" />
                  </div>
                </div>
              )}
            </div>
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent align="end" className="z-[9999] w-80">
        <span className="block font-medium text-sm text-stone-900 mb-2">Frame style</span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { type: "none" as const, label: "None" },
            { type: "arc" as const, label: "Arc" },
            { type: "stack" as const, label: "Stack" },
          ].map((frame) => (
            <div key={frame.type} className={cn("cursor-pointer flex flex-col items-center gap-1.5")} onClick={() => onChange(frame.type)}>
              <div className={cn("w-full h-14 rounded-md border border-stone-200 flex items-center justify-center bg-gradient-to-br from-rose-300 to-orange-400 overflow-hidden", { "ring-2 ring-rose-400": frame.type === value })}>
                {frame.type === "none" && <div className="w-10 h-8 bg-white border border-stone-300 rounded-sm" />}
        {frame.type === "arc" && (
                  <div className="relative">
                    <div className={cn("w-10 h-8 bg-white border border-stone-300", styles.frameArcInner)}>
                      <div className="w-full h-full bg-white rounded-[3px]" />
                    </div>
                  </div>
                )}
                {frame.type === "stack" && (
                  <div className="relative">
                    <div className="absolute">
                      {Array.from({ length: 3 }).map((_, index) => {
                        const reverseIndex = 3 - index - 1;
                        const translateY = reverseIndex * -2.5;
                        const scale = 1 - reverseIndex * 0.06;
                        const opacity = Math.pow(0.7, reverseIndex);
                        return <div key={index} className={cn("absolute w-10", styles.stackLayer, styles[`stackLayer${reverseIndex}` as keyof typeof styles])} />;
                      })}
                    </div>
                    <div className="relative z-10">
                      <div className="w-10 h-8 bg-white border border-stone-300 rounded-sm" />
                    </div>
                  </div>
                )}
              </div>
              <span className="text-xs text-stone-600">{frame.label}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
