"use client"

import { type LucideIcon, Layers, Palette, Briefcase, FileText, Presentation, Sparkles } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useImageStore, type PresetSettings } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

type Preset = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  settings: PresetSettings
  preview: {
    background: string
    hasPattern: boolean
    patternType?: string
    frameStyle: "none" | "arc" | "stack"
    shadow: boolean
  }
}

const presets: Preset[] = [
  {
    id: "clean-minimal",
    title: "Clean & Minimal",
    description: "Perfect for documentation",
    icon: FileText,
    settings: {
      theme: "#ffffff",
      screenshotScale: 0.85,
      rounded: 8,
      shadow: 1,
      frame: "none",
      pattern: { enabled: false, type: "none", intensity: 15, opacity: 6, rotation: 0 },
      browserBar: "hidden",
      outlineSize: 12,
    },
    preview: {
      background: "#ffffff",
      hasPattern: false,
      frameStyle: "none",
      shadow: true,
    },
  },
  {
    id: "social-media",
    title: "Social Media",
    description: "Eye-catching for posts",
    icon: Sparkles,
    settings: {
      theme: "bg-gradient-to-br from-blue-400 to-purple-500",
      screenshotScale: 0.8,
      rounded: 16,
      shadow: 3,
      frame: "arc",
      pattern: { enabled: false, type: "none", intensity: 15, opacity: 6, rotation: 0 },
      browserBar: "hidden",
      outlineSize: 8,
    },
    preview: {
      background: "linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)",
      hasPattern: false,
      frameStyle: "arc",
      shadow: true,
    },
  },
  {
    id: "product-shot",
    title: "Product Shot",
    description: "Professional showcase",
    icon: Briefcase,
    settings: {
      theme: "#1f2937",
      screenshotScale: 0.9,
      rounded: 12,
      shadow: 4,
      frame: "stack",
      pattern: { enabled: false, type: "none", intensity: 15, opacity: 6, rotation: 0 },
      browserBar: "dark",
      outlineSize: 6,
    },
    preview: {
      background: "#1f2937",
      hasPattern: false,
      frameStyle: "stack",
      shadow: true,
    },
  },
  {
    id: "blog-hero",
    title: "Blog Hero",
    description: "Vibrant and engaging",
    icon: Palette,
    settings: {
      theme: "bg-gradient-to-br from-emerald-300 to-teal-400",
      screenshotScale: 0.85,
      rounded: 20,
      shadow: 2,
      frame: "none",
      pattern: { enabled: true, type: "waves", intensity: 25, opacity: 8, rotation: 0 },
      browserBar: "light",
      outlineSize: 10,
    },
    preview: {
      background: "linear-gradient(135deg, #86efac 0%, #5eead4 100%)",
      hasPattern: true,
      patternType: "waves",
      frameStyle: "none",
      shadow: true,
    },
  },
  {
    id: "presentation",
    title: "Presentation",
    description: "Clean and professional",
    icon: Presentation,
    settings: {
      theme: "bg-gradient-to-br from-stone-50 to-stone-100",
      screenshotScale: 0.9,
      rounded: 8,
      shadow: 2,
      frame: "none",
      pattern: { enabled: true, type: "dots", intensity: 30, opacity: 4, rotation: 0 },
      browserBar: "light",
      outlineSize: 8,
    },
    preview: {
      background: "linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)",
      hasPattern: true,
      patternType: "dots",
      frameStyle: "none",
      shadow: true,
    },
  },
  {
    id: "creative",
    title: "Creative",
    description: "Bold and artistic",
    icon: Layers,
    settings: {
      theme: "bg-gradient-to-br from-fuchsia-300 to-purple-400",
      screenshotScale: 0.75,
      rounded: 24,
      shadow: 4,
      frame: "arc",
      pattern: { enabled: true, type: "stripes", intensity: 20, opacity: 12, rotation: 45 },
      browserBar: "hidden",
      outlineSize: 12,
    },
    preview: {
      background: "linear-gradient(135deg, #f0abfc 0%, #c084fc 100%)",
      hasPattern: true,
      patternType: "stripes",
      frameStyle: "arc",
      shadow: true,
    },
  },
]

export function AppSidebar() {
  const { selectedPreset, applyPreset } = useImageStore()
  const { toast } = useToast()

  const handlePresetClick = (preset: Preset) => {
    applyPreset(preset.id, preset.settings)
    toast({
      title: "Preset applied",
      description: `${preset.title} settings have been applied.`,
    })
  }

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r">
      <SidebarHeader>
        <div className="px-2 py-1.5">
          <h2 className="text-sm font-semibold text-stone-800">Presets</h2>
          <p className="text-xs text-stone-500">Choose a style to get started</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Popular Styles</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="grid gap-3 p-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    "group relative overflow-hidden rounded-lg border-2 transition-all duration-200 hover:scale-[1.02]",
                    selectedPreset === preset.id
                      ? "border-rose-400 shadow-md"
                      : "border-stone-200 hover:border-stone-300",
                  )}
                >
                  {/* Preview Background */}
                  <div
                    className="h-20 w-full relative overflow-hidden"
                    style={{ background: preset.preview.background }}
                  >
                    {/* Pattern Overlay */}
                    {preset.preview.hasPattern && (
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage:
                            preset.preview.patternType === "waves"
                              ? `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                              : preset.preview.patternType === "dots"
                                ? `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fillOpacity='0.4' fillRule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
                                : `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fillOpacity='0.4' fillRule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
                          backgroundSize: "20px 20px",
                          transform: preset.preview.patternType === "stripes" ? "rotate(45deg)" : "none",
                        }}
                      />
                    )}

                    {/* Mock Screenshot */}
                    <div className="absolute inset-0 flex items-center justify-center p-3">
                      <div
                        className={cn(
                          "bg-white rounded-md shadow-sm border border-stone-200 w-full h-full relative overflow-hidden",
                          preset.preview.shadow && "shadow-lg",
                        )}
                        style={{
                          transform: "scale(0.8)",
                        }}
                      >
                        {/* Mock content lines */}
                        <div className="p-2 space-y-1">
                          <div className="h-1 bg-stone-300 rounded w-3/4"></div>
                          <div className="h-1 bg-stone-200 rounded w-1/2"></div>
                          <div className="h-1 bg-stone-200 rounded w-2/3"></div>
                        </div>

                        {/* Frame overlay */}
                        {preset.preview.frameStyle === "arc" && (
                          <div className="absolute inset-0 rounded-md border-2 border-white/30 shadow-inner"></div>
                        )}
                        {preset.preview.frameStyle === "stack" && (
                          <>
                            <div className="absolute -top-1 -left-1 w-full h-full bg-stone-300/50 rounded-md"></div>
                            <div className="absolute -top-0.5 -left-0.5 w-full h-full bg-stone-200/50 rounded-md"></div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 bg-white">
                    <div className="flex items-start gap-2">
                      <preset.icon className="h-4 w-4 text-stone-600 mt-0.5 flex-shrink-0" />
                      <div className="text-left min-w-0">
                        <h3 className="font-medium text-sm text-stone-800 truncate">{preset.title}</h3>
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{preset.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Selected indicator */}
                  {selectedPreset === preset.id && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-rose-400 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export type { Preset }
