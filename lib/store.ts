import { create } from "zustand"

export type PatternType = "waves" | "dots" | "stripes" | "zigzag" | "graphpaper" | "none"

type Options = {
  aspectRatio: string
  theme: string
  customTheme: { colorStart: string; colorEnd: string }
  rounded: number
  shadow: number
  browserBar: "hidden" | "light" | "dark"
  screenshotScale: number
  rotation: number
  pattern: {
    enabled: boolean
    intensity: number
    rotation: number
    opacity: number
    type: PatternType
  }
  frame: "none" | "arc" | "stack"
  outlineSize: number
  outlineColor: string
  gradientWaves: {
    enabled: boolean
    lines: number
    amplitudeX: number
    amplitudeY: number
    smoothness: number
    offsetX: number
    fill: boolean
    crazyness: boolean
    start: { h: number; s: number; l: number }
    end: { h: number; s: number; l: number }
  }
}

type PresetSettings = {
  theme: string
  screenshotScale: number
  rounded: number
  shadow: number
  frame: "none" | "arc" | "stack"
  pattern: {
    enabled: boolean
    type: PatternType
    intensity: number
    opacity: number
    rotation: number
  }
  browserBar: "hidden" | "light" | "dark"
  outlineSize: number
}

interface ImageStore {
  // State
  options: Options
  selectedPreset: string

  // Actions
  updateOptions: (updates: Partial<Options>) => void
  setOutlineSize: (size: number) => void
  setOutlineColor: (color: string) => void
  applyPreset: (presetId: string, settings: PresetSettings) => void
  resetToDefaults: () => void
}

const DEFAULT_OUTLINE_SIZE = 8
const DEFAULT_OUTLINE_COLOR = "#ffffff"

const DEFAULT_OPTIONS: Options = {
  aspectRatio: "aspect-auto",
  theme: "bg-gradient-to-br from-rose-300 to-orange-400",
  customTheme: { colorStart: "#f3f4f6", colorEnd: "#e5e7eb" },
  rounded: 16,
  shadow: 2,
  browserBar: "hidden",
  screenshotScale: 0.9,
  rotation: 0,
  pattern: { enabled: true, intensity: 15, rotation: 0, opacity: 6, type: "stripes" },
  frame: "arc",
  outlineSize: DEFAULT_OUTLINE_SIZE,
  outlineColor: DEFAULT_OUTLINE_COLOR,
  gradientWaves: {
    enabled: false,
    lines: 20,
    amplitudeX: 100,
    amplitudeY: 20,
    smoothness: 3,
    offsetX: 10,
    fill: true,
    crazyness: false,
    start: { h: 53, s: 74, l: 67 },
    end: { h: 216, s: 100, l: 7 },
  },
}

export const useImageStore = create<ImageStore>()((set, get) => ({
  // Initial state
  options: DEFAULT_OPTIONS,
  selectedPreset: "",

  // Actions
  updateOptions: (updates) =>
    set((state) => ({
      options: { ...state.options, ...updates },
      selectedPreset: "", // Clear preset selection when manually adjusting
    })),

  setOutlineSize: (size) =>
    set((state) => ({
      options: { ...state.options, outlineSize: size },
      selectedPreset: "",
    })),

  setOutlineColor: (color) =>
    set((state) => ({
      options: { ...state.options, outlineColor: color },
      selectedPreset: "",
    })),

  applyPreset: (presetId, settings) =>
    set(() => ({
      options: {
        ...get().options,
        theme: settings.theme,
        screenshotScale: settings.screenshotScale,
        rounded: settings.rounded,
        shadow: settings.shadow,
        frame: settings.frame,
        pattern: settings.pattern,
        browserBar: settings.browserBar,
        outlineSize: settings.outlineSize,
      },
      selectedPreset: presetId,
    })),

  resetToDefaults: () =>
    set(() => ({
      options: DEFAULT_OPTIONS,
      selectedPreset: "",
    })),
}))

export type { Options, PresetSettings }
