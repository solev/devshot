"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { EnhancedSlider } from "@/components/enhanced-slider";
import type { Options } from "@/lib/store";
import { SidebarHeader } from "@/components/image-tool/sidebar/SidebarHeader";
import { FramePicker } from "@/components/image-tool/sidebar/FramePicker";
import { BackgroundPicker } from "@/components/image-tool/sidebar/BackgroundPicker";
import { PatternPicker } from "@/components/image-tool/sidebar/PatternPicker";
import { GradientWavesPanel } from "@/components/image-tool/sidebar/GradientWavesPanel";

export type SidebarProps = {
  visible: boolean;
  options: Options;
  outlineSize: number;
  outlineColor: string;
  updateOptions: (updates: Partial<Options>) => void;
  setOutlineSize: (size: number) => void;
  setOutlineColor: (color: string) => void;
  handleNew: () => void;
  exportOrCopy: (target: "download" | "copy") => void;
  gradientTriggerRef: React.RefObject<HTMLButtonElement>;
  gradientContentRef: React.RefObject<HTMLDivElement>;
};

export function Sidebar({
  visible,
  options,
  outlineSize,
  outlineColor,
  updateOptions,
  setOutlineSize,
  setOutlineColor,
  handleNew,
  exportOrCopy,
  gradientTriggerRef,
  gradientContentRef,
}: SidebarProps) {
  return (
    <div
      className={cn(
        "bg-stone-50 w-[20rem] rounded-lg h-[calc(100vh-6rem)] flex flex-col border border-stone-200",
        { hidden: !visible }
      )}
    >
      <div className="flex-1 overflow-y-auto p-5">
        <div className="space-y-6">
          <SidebarHeader onReset={handleNew} />

          <Separator className="bg-stone-200" />

          <FramePicker value={options.frame} onChange={(v) => updateOptions({ frame: v })} />

          <BackgroundPicker
            theme={options.theme}
            onChange={(theme) =>
              updateOptions({ theme, gradientWaves: { ...options.gradientWaves, enabled: false } })
            }
          />

          <PatternPicker
            pattern={options.pattern}
            onPick={(type) =>
              updateOptions({
                pattern: { ...options.pattern, type, enabled: type !== "none" },
                gradientWaves: type !== "none" ? { ...options.gradientWaves, enabled: false } : options.gradientWaves,
              })
            }
          >
            <div className="mt-4 space-y-3">
              <EnhancedSlider disabled={options.pattern.type === "none"} label="Size" value={options.pattern.intensity} onChange={(v) => updateOptions({ pattern: { ...options.pattern, intensity: v } })} min={1} max={100} step={1} defaultValue={15} onReset={() => updateOptions({ pattern: { ...options.pattern, intensity: 15 } })} />
              <EnhancedSlider disabled={options.pattern.type === "none"} label="Rotation" value={options.pattern.rotation} onChange={(v) => updateOptions({ pattern: { ...options.pattern, rotation: v } })} min={0} max={360} step={1} unit="°" defaultValue={0} onReset={() => updateOptions({ pattern: { ...options.pattern, rotation: 0 } })} />
              <EnhancedSlider disabled={options.pattern.type === "none"} label="Opacity" value={options.pattern.opacity} onChange={(v) => updateOptions({ pattern: { ...options.pattern, opacity: v } })} min={0} max={35} step={1} defaultValue={6} onReset={() => updateOptions({ pattern: { ...options.pattern, opacity: 6 } })} />
            </div>
          </PatternPicker>

          <GradientWavesPanel
            options={options}
            onChange={updateOptions}
            triggerRef={gradientTriggerRef}
            contentRef={gradientContentRef}
          />

          <EnhancedSlider label="Size" value={options.screenshotScale} onChange={(v) => updateOptions({ screenshotScale: v })} min={0.5} max={1.5} step={0.01} unit="x" defaultValue={0.9} onReset={() => updateOptions({ screenshotScale: 0.9 })} />
          <EnhancedSlider label="Rotation" value={options.rotation} onChange={(v) => updateOptions({ rotation: v })} min={0} max={360} step={1} unit="°" defaultValue={0} onReset={() => updateOptions({ rotation: 0 })} />
          <EnhancedSlider label="Roundness" value={options.rounded} onChange={(v) => updateOptions({ rounded: v })} min={0} max={32} step={1} unit="px" defaultValue={16} onReset={() => updateOptions({ rounded: 16 })} />
          <EnhancedSlider label="Shadow" value={options.shadow} onChange={(v) => updateOptions({ shadow: Math.round(v) })} min={0} max={4} step={1} defaultValue={2} onReset={() => updateOptions({ shadow: 2 })} />
          <EnhancedSlider label="Inset" value={outlineSize} onChange={setOutlineSize} min={0} max={100} step={1} defaultValue={8} onReset={() => setOutlineSize(8)} />

          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              <span className="block text-xs font-medium text-stone-700">Inset color</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={outlineColor}
                onChange={(e) => setOutlineColor(e.target.value)}
                className="w-8 h-8 rounded-md border border-stone-300 cursor-pointer transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-400"
                aria-label="Inset color"
              />
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-stone-600" onClick={() => setOutlineColor("#ffffff")}>
                Reset
              </Button>
            </div>
          </div>

          <Separator className="bg-stone-200" />

          <div className="flex items-center justify-between">
            <Label className="text-sm text-stone-700">Browser bar</Label>
            <div className="flex items-center gap-2">
              <select
                aria-label="Browser bar style"
                className="h-8 rounded-md border border-stone-300 bg-white px-2 text-sm"
                value={options.browserBar}
                onChange={(e) => updateOptions({ browserBar: e.target.value as Options["browserBar"] })}
              >
                <option value="hidden">Hidden</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-stone-200">
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" className="h-11 bg-transparent" onClick={handleNew}>New</Button>
          <Button className="flex-1 h-11" onClick={() => exportOrCopy("download")}>Export PNG (2x)</Button>
          <Button variant="secondary" className="h-11" onClick={() => exportOrCopy("copy")}>Copy Image</Button>
        </div>
      </div>
    </div>
  );
}
