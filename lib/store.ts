import { create } from "zustand"
import { persist } from "zustand/middleware"

type PatternType = "waves" | "dots" | "stripes" | "zigzag" | "graphpaper" | "gradientwaves" | "none"

type GradientWavesConfig = {
  lines: number
  amplitudeX: number
  amplitudeY: number
  offsetX: number
  smoothness: number
  crazyness: boolean
  hueStart: number
  saturationStart: number
  lightnessStart: number
  hueEnd: number
  saturationEnd: number
  lightnessEnd: number
}

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
  gradientWaves: GradientWavesConfig
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
  options: Options
  outlineSize: number
  outlineColor: string
  selectedPreset: string

  updateOptions: (updates: Partial<Options>) => void
  setOutlineSize: (size: number) => void
  setOutlineColor: (color: string) => void
  applyPreset: (presetId: string, settings: PresetSettings) => void
  resetToDefaults: () => void
  updateGradientWaves: (updates: Partial<GradientWavesConfig>) => void
  randomizeGradientWaves: () => void
}

const DEFAULT_OUTLINE_SIZE = 8
const DEFAULT_OUTLINE_COLOR = "#ffffff"

const DEFAULT_GRADIENT_WAVES: GradientWavesConfig = {
  lines: 29,
  amplitudeX: 100,
  amplitudeY: 20,
  offsetX: 10,
  smoothness: 3,
  crazyness: false,
  hueStart: 53,
  saturationStart: 74,
  lightnessStart: 67,
  hueEnd: 216,
  saturationEnd: 100,
  lightnessEnd: 7,
}

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
  gradientWaves: DEFAULT_GRADIENT_WAVES,
}

export const useImageStore = create<ImageStore>()(
  persist(
    (set, get) => ({
      options: DEFAULT_OPTIONS,
      outlineSize: DEFAULT_OUTLINE_SIZE,
      outlineColor: DEFAULT_OUTLINE_COLOR,
      selectedPreset: "",

      updateOptions: (updates) =>
        set((state) => ({
          options: { ...state.options, ...updates },
          selectedPreset: "",
        })),

      setOutlineSize: (size) =>
        set((state) => ({
          outlineSize: size,
          selectedPreset: "",
        })),

      setOutlineColor: (color) =>
        set((state) => ({
          outlineColor: color,
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
          },
          outlineSize: settings.outlineSize,
          selectedPreset: presetId,
        })),

      resetToDefaults: () =>
        set(() => ({
          options: DEFAULT_OPTIONS,
          outlineSize: DEFAULT_OUTLINE_SIZE,
          outlineColor: DEFAULT_OUTLINE_COLOR,
          selectedPreset: "",
        })),

      updateGradientWaves: (updates) =>
        set((state) => ({
          options: {
            ...state.options,
            gradientWaves: { ...state.options.gradientWaves, ...updates },
          },
          selectedPreset: "",
        })),

      randomizeGradientWaves: () =>
        set((state) => ({
          options: {
            ...state.options,
            gradientWaves: {
              ...state.options.gradientWaves,
              lines: Math.floor(Math.random() * 40) + 10,
              amplitudeX: Math.floor(Math.random() * 150) + 50,
              amplitudeY: Math.floor(Math.random() * 40) + 10,
              offsetX: Math.floor(Math.random() * 20),
              smoothness: Math.floor(Math.random() * 8) + 1,
              hueStart: Math.floor(Math.random() * 360),
              saturationStart: Math.floor(Math.random() * 50) + 50,
              lightnessStart: Math.floor(Math.random() * 40) + 40,
              hueEnd: Math.floor(Math.random() * 360),
              saturationEnd: Math.floor(Math.random() * 50) + 50,
              lightnessEnd: Math.floor(Math.random() * 30) + 10,
            },
          },
          selectedPreset: "",
        })),
    }),
    {
      name: "image-tool-storage",
      partialize: (state) => ({
        options: state.options,
        outlineSize: state.outlineSize,
        outlineColor: state.outlineColor,
      }),
    },
  ),
)

export type { Options, PresetSettings, GradientWavesConfig }
