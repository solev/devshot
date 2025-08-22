"use client";
import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EnhancedSlider } from "@/components/enhanced-slider";
import { cn } from "@/lib/utils";
import { ArrowLeftRight, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { hslToHex, hexToHslTriplet } from "@/lib/color";
import { waveColorPresets } from "@/lib/config/presets";
import type { Options } from "@/lib/store";
import { useAutoPopoverMaxHeight } from "@/lib/hooks/useAutoPopoverMaxHeight";
import { GradientWavesPreview } from "@/components/gradient-waves-preview";

export type GradientWavesPanelProps = {
  options: Options;
  onChange: (updates: Partial<Options>) => void;
};

export function GradientWavesPanel({ options, onChange }: GradientWavesPanelProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  useAutoPopoverMaxHeight(triggerRef, contentRef, [open, options.gradientWaves.enabled]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1">
          <span className="block text-xs font-medium text-stone-700">Gradient Waves</span>
        </div>
        <PopoverTrigger asChild>
          <button aria-label="Edit gradient waves" ref={triggerRef} className={cn("size-8 rounded-md border border-stone-300 flex items-center justify-center transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white", options.gradientWaves.enabled ? "opacity-100" : "opacity-50")}>
            <div className="size-7 rounded-sm relative overflow-hidden bg-white flex items-center justify-center">
              <GradientWavesPreview 
                gradientWaves={options.gradientWaves} 
                width={28} 
                height={28}
                className="rounded-sm"
              />
            </div>
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent align="end" className="z-[9999] w-80 pr-1">
        <div ref={contentRef} className="w-full overflow-y-auto">
          <span className="block font-medium text-sm text-stone-900 mb-2">Gradient Waves</span>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-stone-700">Enabled</Label>
              <Switch aria-label="Toggle gradient waves" checked={options.gradientWaves.enabled} onCheckedChange={(checked) => onChange({ gradientWaves: { ...options.gradientWaves, enabled: checked }, pattern: checked ? { ...options.pattern, enabled: false, type: "none" } : options.pattern })} />
            </div>
            <div className={cn("space-y-3", !options.gradientWaves.enabled && "opacity-50 pointer-events-none select-none")}>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-stone-700">Fill</Label>
                <Switch aria-label="Toggle fill mode" checked={options.gradientWaves.fill} disabled={!options.gradientWaves.enabled} onCheckedChange={(checked) => onChange({ gradientWaves: { ...options.gradientWaves, fill: checked } })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-stone-700">Crazyness</Label>
                <Switch aria-label="Toggle crazyness" checked={options.gradientWaves.crazyness} disabled={!options.gradientWaves.enabled} onCheckedChange={(checked) => onChange({ gradientWaves: { ...options.gradientWaves, crazyness: checked } })} />
              </div>
              <EnhancedSlider label="Lines" value={options.gradientWaves.lines} disabled={!options.gradientWaves.enabled} onChange={(v) => onChange({ gradientWaves: { ...options.gradientWaves, lines: Math.round(v) } })} min={5} max={50} step={1} defaultValue={20} onReset={() => onChange({ gradientWaves: { ...options.gradientWaves, lines: 20 } })} />
              <EnhancedSlider label="Amplitude X" value={options.gradientWaves.amplitudeX} disabled={!options.gradientWaves.enabled} onChange={(v) => onChange({ gradientWaves: { ...options.gradientWaves, amplitudeX: Math.round(v) } })} min={20} max={300} step={1} defaultValue={100} onReset={() => onChange({ gradientWaves: { ...options.gradientWaves, amplitudeX: 100 } })} />
              <EnhancedSlider label="Amplitude Y" value={options.gradientWaves.amplitudeY} disabled={!options.gradientWaves.enabled} onChange={(v) => onChange({ gradientWaves: { ...options.gradientWaves, amplitudeY: Math.round(v) } })} min={0} max={200} step={1} defaultValue={20} onReset={() => onChange({ gradientWaves: { ...options.gradientWaves, amplitudeY: 20 } })} />
              <EnhancedSlider label="Smoothness" value={options.gradientWaves.smoothness} disabled={!options.gradientWaves.enabled} onChange={(v) => onChange({ gradientWaves: { ...options.gradientWaves, smoothness: Number(v.toFixed(1)) } })} min={0.5} max={10} step={0.5} defaultValue={3} onReset={() => onChange({ gradientWaves: { ...options.gradientWaves, smoothness: 3 } })} />
              <EnhancedSlider label="Offset X" value={options.gradientWaves.offsetX} disabled={!options.gradientWaves.enabled} onChange={(v) => onChange({ gradientWaves: { ...options.gradientWaves, offsetX: Math.round(v) } })} min={-20} max={20} step={1} defaultValue={10} onReset={() => onChange({ gradientWaves: { ...options.gradientWaves, offsetX: 10 } })} />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-stone-700">Quick palettes</Label>
                  <div className="flex flex-wrap gap-2">
                    {waveColorPresets.map((p, i) => (
                      <button key={i} type="button" className="h-7 w-16 rounded border border-stone-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-400 p-0 overflow-hidden" title={p.name ?? `Preset ${i + 1}`} aria-label={p.name ?? `Preset ${i + 1}`} disabled={!options.gradientWaves.enabled} onClick={() => { const s = hexToHslTriplet(p.start); const e = hexToHslTriplet(p.end); onChange({ gradientWaves: { ...options.gradientWaves, start: s, end: e } }); }}>
                        <svg width="64" height="28" aria-hidden="true" focusable="false">
                          <defs>
                            <linearGradient id={`gw-chip-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor={p.start} />
                              <stop offset="100%" stopColor={p.end} />
                            </linearGradient>
                          </defs>
                          <rect width="100%" height="100%" fill={`url(#gw-chip-${i})`} />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded overflow-hidden" aria-label="Current gradient preview" role="img">
                      <svg width="100%" height="8" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="gw-preview" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={hslToHex(options.gradientWaves.start.h, options.gradientWaves.start.s, options.gradientWaves.start.l)} />
                            <stop offset="100%" stopColor={hslToHex(options.gradientWaves.end.h, options.gradientWaves.end.s, options.gradientWaves.end.l)} />
                          </linearGradient>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#gw-preview)" />
                      </svg>
                    </div>
                    <Button variant="outline" size="sm" className="h-8" title="Swap colors" aria-label="Swap colors" disabled={!options.gradientWaves.enabled} onClick={() => onChange({ gradientWaves: { ...options.gradientWaves, start: options.gradientWaves.end, end: options.gradientWaves.start } })}>
                      <ArrowLeftRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8" title="Randomize palette" aria-label="Randomize palette" disabled={!options.gradientWaves.enabled} onClick={() => { const pick = waveColorPresets[Math.floor(Math.random() * waveColorPresets.length)]; const s = hexToHslTriplet(pick.start); const e = hexToHslTriplet(pick.end); onChange({ gradientWaves: { ...options.gradientWaves, start: s, end: e } }); }}>
                      <Shuffle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-stone-700">Start color</Label>
                  <div className="flex items-center justify-between gap-2">
                    <input type="color" className="h-8 w-8 rounded border border-stone-300 cursor-pointer" aria-label="Start color" disabled={!options.gradientWaves.enabled} value={hslToHex(options.gradientWaves.start.h, options.gradientWaves.start.s, options.gradientWaves.start.l)} onChange={(e) => onChange({ gradientWaves: { ...options.gradientWaves, start: hexToHslTriplet(e.target.value) } })} />
                    <input type="text" className="h-8 w-28 rounded border border-stone-300 px-2 text-xs" aria-label="Start color hex" disabled={!options.gradientWaves.enabled} value={hslToHex(options.gradientWaves.start.h, options.gradientWaves.start.s, options.gradientWaves.start.l)} onChange={(e) => { const hex = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`; const valid = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex); if (valid) { onChange({ gradientWaves: { ...options.gradientWaves, start: hexToHslTriplet(hex) } }); } }} />
                  </div>
                  <details className="mt-1">
                    <summary className="text-xs text-stone-600 cursor-pointer select-none">Advanced (HSL)</summary>
                    <div className="space-y-2 mt-2">
                      <EnhancedSlider label="Hue" value={options.gradientWaves.start.h} disabled={!options.gradientWaves.enabled} onChange={(v) => onChange({ gradientWaves: { ...options.gradientWaves, start: { ...options.gradientWaves.start, h: Math.round(v) } } })} min={0} max={360} step={1} defaultValue={53} />
                      <EnhancedSlider label="Saturation" value={options.gradientWaves.start.s} disabled={!options.gradientWaves.enabled} onChange={(v) => onChange({ gradientWaves: { ...options.gradientWaves, start: { ...options.gradientWaves.start, s: Math.round(v) } } })} min={0} max={100} step={1} unit="%" defaultValue={74} />
                      <EnhancedSlider label="Lightness" value={options.gradientWaves.start.l} disabled={!options.gradientWaves.enabled} onChange={(v) => onChange({ gradientWaves: { ...options.gradientWaves, start: { ...options.gradientWaves.start, l: Math.round(v) } } })} min={0} max={100} step={1} unit="%" defaultValue={67} />
                    </div>
                  </details>
                </div>
                <Separator className="bg-stone-200" />
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-stone-700">End color</Label>
                  <div className="flex items-center justify-between gap-2">
                    <input type="color" className="h-8 w-8 rounded border border-stone-300 cursor-pointer" aria-label="End color" disabled={!options.gradientWaves.enabled} value={hslToHex(options.gradientWaves.end.h, options.gradientWaves.end.s, options.gradientWaves.end.l)} onChange={(e) => onChange({ gradientWaves: { ...options.gradientWaves, end: hexToHslTriplet(e.target.value) } })} />
                    <input type="text" className="h-8 w-28 rounded border border-stone-300 px-2 text-xs" aria-label="End color hex" disabled={!options.gradientWaves.enabled} value={hslToHex(options.gradientWaves.end.h, options.gradientWaves.end.s, options.gradientWaves.end.l)} onChange={(e) => { const hex = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`; const valid = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex); if (valid) { onChange({ gradientWaves: { ...options.gradientWaves, end: hexToHslTriplet(hex) } }); } }} />
                  </div>
                  <details className="mt-1">
                    <summary className="text-xs text-stone-600 cursor-pointer select-none">Advanced (HSL)</summary>
                    <div className="space-y-2 mt-2">
                      <EnhancedSlider label="Hue" value={options.gradientWaves.end.h} disabled={!options.gradientWaves.enabled} onChange={(v) => onChange({ gradientWaves: { ...options.gradientWaves, end: { ...options.gradientWaves.end, h: Math.round(v) } } })} min={0} max={360} step={1} defaultValue={216} />
                      <EnhancedSlider label="Saturation" value={options.gradientWaves.end.s} disabled={!options.gradientWaves.enabled} onChange={(v) => onChange({ gradientWaves: { ...options.gradientWaves, end: { ...options.gradientWaves.end, s: Math.round(v) } } })} min={0} max={100} step={1} unit="%" defaultValue={100} />
                      <EnhancedSlider label="Lightness" value={options.gradientWaves.end.l} disabled={!options.gradientWaves.enabled} onChange={(v) => onChange({ gradientWaves: { ...options.gradientWaves, end: { ...options.gradientWaves.end, l: Math.round(v) } } })} min={0} max={100} step={1} unit="%" defaultValue={7} />
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
